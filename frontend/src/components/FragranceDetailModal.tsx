import React, { useState } from 'react';
import api from '@/utils/api';

interface FragranceDetailModalProps {
  fragrance: {
    name: string;
    brand: string;
    concentration?: string;
    topNotes?: string[];
    middleNotes?: string[];
    baseNotes?: string[];
    description?: string;
    imageUrl?: string;
    priceCents?: number;
    source?: string;
    year?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FragranceDetailModal: React.FC<FragranceDetailModalProps> = ({
  fragrance,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);

  if (!isOpen || !fragrance) return null;

  const handleAddToCollection = async () => {
    setIsAdding(true);
    try {
      const response = await api.post('/testing/fragrance-from-search', {
        fragranceData: fragrance
      });

      setAddedSuccessfully(true);

      // Show success message for 2 seconds, then close
      setTimeout(() => {
        setAddedSuccessfully(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Failed to add fragrance:', error);
      alert('Failed to add fragrance. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const allNotes = [
    ...(fragrance.topNotes || []),
    ...(fragrance.middleNotes || []),
    ...(fragrance.baseNotes || [])
  ];

  const getSourceInfo = (source?: string) => {
    if (source === 'external') {
      return {
        badge: 'New Addition',
        color: 'bg-green-100 text-green-800',
        description: 'This fragrance will be added to our database'
      };
    }
    return {
      badge: 'In Collection',
      color: 'bg-blue-100 text-blue-800',
      description: 'This fragrance is already in our database'
    };
  };

  const sourceInfo = getSourceInfo(fragrance.source);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Dark Sophisticated Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 p-8 flex justify-between items-start rounded-t-3xl">
          <div className="flex-1">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-gray-900 text-2xl font-bold shadow-xl border-2 border-amber-300">
                🧴
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent leading-tight">
                  {fragrance.name}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xl font-medium text-gray-300">{fragrance.brand}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border ${
                    fragrance.source === 'external'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400'
                  }`}>
                    {sourceInfo.badge}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {fragrance.concentration && (
                <span className="bg-gray-800 text-amber-400 px-4 py-2 rounded-full font-bold border border-gray-600">
                  💧 {fragrance.concentration}
                </span>
              )}
              {fragrance.year && (
                <span className="bg-gray-800 text-blue-400 px-4 py-2 rounded-full font-bold border border-gray-600">
                  📅 {fragrance.year}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-3 transition-all duration-300 text-2xl font-bold ml-6 border border-gray-600 hover:border-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Dark Mode Content */}
        <div className="p-8 space-y-8 bg-gray-900">
          {/* AI Categorization Section - Prominent */}
          {fragrance.source === 'external' && (
            <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 rounded-2xl p-6 border border-amber-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-400">AI Categorization</h3>
                  <p className="text-amber-200 text-sm">Our AI will analyze and categorize this fragrance</p>
                </div>
              </div>
              <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-amber-700">
                <p className="text-amber-300 font-medium">
                  ✨ This fragrance will be automatically categorized for Daily Driver, Office, Date Night, Summer, Winter, and more based on its notes and characteristics.
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {fragrance.description && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📝</span>
                <h3 className="text-2xl font-bold text-white">Description</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">{fragrance.description}</p>
            </div>
          )}

          {/* Sophisticated Notes Section */}
          {allNotes.length > 0 && (
            <div className="bg-gray-800 rounded-2xl border border-gray-600 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 border-b border-gray-600">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Fragrance Notes</h3>
                    <p className="text-gray-400 text-sm mt-1">The scent journey from first spray to dry down</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-8">
                {fragrance.topNotes && fragrance.topNotes.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-xl">
                        T
                      </div>
                      <div>
                        <span className="text-xl font-bold text-cyan-400">Top Notes</span>
                        <span className="block text-sm text-gray-400">First impression • 0-15 minutes</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 ml-16">
                      {fragrance.topNotes.map((note, index) => (
                        <span key={index} className="bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 px-4 py-2 rounded-xl text-sm font-bold border border-cyan-700 hover:border-cyan-500 transition-all duration-300 shadow-lg">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {fragrance.middleNotes && fragrance.middleNotes.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-xl">
                        M
                      </div>
                      <div>
                        <span className="text-xl font-bold text-purple-400">Middle Notes</span>
                        <span className="block text-sm text-gray-400">Heart of fragrance • 15 minutes - 4 hours</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 ml-16">
                      {fragrance.middleNotes.map((note, index) => (
                        <span key={index} className="bg-gradient-to-r from-purple-900 to-violet-900 text-purple-300 px-4 py-2 rounded-xl text-sm font-bold border border-purple-700 hover:border-purple-500 transition-all duration-300 shadow-lg">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {fragrance.baseNotes && fragrance.baseNotes.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-xl">
                        B
                      </div>
                      <div>
                        <span className="text-xl font-bold text-amber-400">Base Notes</span>
                        <span className="block text-sm text-gray-400">Foundation • 4+ hours</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 ml-16">
                      {fragrance.baseNotes.map((note, index) => (
                        <span key={index} className="bg-gradient-to-r from-amber-900 to-orange-900 text-amber-300 px-4 py-2 rounded-xl text-sm font-bold border border-amber-700 hover:border-amber-500 transition-all duration-300 shadow-lg">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

                    {/* Pricing & Source Info Grid - Dark Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pricing */}
            {fragrance.priceCents && (
              <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-6 border border-green-600">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">💰</span>
                  <h3 className="text-2xl font-bold text-green-400">Pricing</h3>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-green-300">
                    ${(fragrance.priceCents / 100).toFixed(0)}
                  </span>
                  <span className="text-lg text-gray-400 font-bold">USD</span>
                </div>
                <p className="text-sm text-green-200 mt-3 font-medium">Estimated retail price</p>
              </div>
            )}

            {/* Source Info */}
            <div className={`rounded-2xl p-6 border-2 ${
              fragrance.source === 'external'
                ? 'bg-gradient-to-br from-emerald-900 to-teal-900 border-emerald-600'
                : 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-600'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{fragrance.source === 'external' ? '✨' : '📚'}</span>
                <h3 className="text-2xl font-bold text-white">
                  {fragrance.source === 'external' ? 'New Discovery' : 'In Database'}
                </h3>
              </div>
              <p className="text-gray-300 font-medium mb-3">{sourceInfo.description}</p>
              {fragrance.source === 'external' && (
                <div className="bg-gray-900 bg-opacity-60 rounded-xl p-4 border border-emerald-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤖</span>
                    <p className="text-sm text-emerald-300 font-medium">
                      Expanding our AI database with your discovery!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dark Sophisticated Actions */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 p-8 rounded-b-3xl">
          {addedSuccessfully ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-green-300">
                <span className="text-3xl text-white">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Battle Ready!</h3>
              <p className="text-green-400 font-bold text-lg">Added to your fragrance arsenal successfully!</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={onClose}
                className="flex-1 px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-800 hover:border-gray-500 hover:text-white transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <span className="text-xl">👈</span>
                Go Back
              </button>
              <button
                onClick={handleAddToCollection}
                disabled={isAdding}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-gray-900 rounded-2xl hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl hover:shadow-amber-500/25 font-bold text-lg transform hover:scale-105 border-2 border-amber-400"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span>Adding to Battle Arsenal...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">⚔️</span>
                    <span>Add to Battle Collection</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
