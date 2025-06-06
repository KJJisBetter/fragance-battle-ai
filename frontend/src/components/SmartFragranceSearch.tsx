import React, { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { FragranceDetailModal } from './FragranceDetailModal';

interface SearchResult {
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
}

interface SmartFragranceSearchProps {
  onFragranceSelect: (fragrance: SearchResult) => void;
  onSuccess?: () => void;
}

export const SmartFragranceSearch: React.FC<SmartFragranceSearchProps> = ({
  onFragranceSelect,
  onSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchStats, setSearchStats] = useState<{database: number, external: number, total: number} | null>(null);
  const [selectedFragrance, setSelectedFragrance] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search with enhanced error handling
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setShowResults(false);
      setError(null);
      setSearchStats(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔍 Searching for: "${searchTerm}"`);
        const response = await api.get(`/testing/fragrance-search?q=${encodeURIComponent(searchTerm)}`);

        console.log(`✅ Search completed:`, response.data);
        setResults(response.data.fragrances || []);
        setSearchStats(response.data.source || null);
        setShowResults(true);
        setSelectedIndex(-1);

        // Log search success
        console.log(`🎯 Found ${response.data.fragrances?.length || 0} fragrances`);

      } catch (error: any) {
        console.error('❌ Search failed:', error);
        setResults([]);
        setSearchStats(null);

        // Enhanced error handling
        if (error.response?.status === 404) {
          setError('Search service not available. Please try again later.');
        } else if (error.response?.status >= 500) {
          setError('Server error. Our team has been notified.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network connection issue. Please check your internet connection.');
        } else {
          setError('Search failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectFragrance(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectFragrance = (fragrance: SearchResult) => {
    // Open modal for detailed view instead of immediately adding
    setSelectedFragrance(fragrance);
    setIsModalOpen(true);
    setShowResults(false); // Hide search results
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFragrance(null);
  };

  const handleModalSuccess = () => {
    // Reset search when successfully added
    setSearchTerm('');
    setResults([]);
    setSelectedIndex(-1);

    if (onSuccess) onSuccess();
    if (selectedFragrance) {
      onFragranceSelect(selectedFragrance);
    }
  };

  const handleInputClick = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getFragranceDisplayName = (fragrance: SearchResult) => {
    return `${fragrance.name} by ${fragrance.brand}${fragrance.concentration ? ` (${fragrance.concentration})` : ''}`;
  };

  const getSourceBadge = (source?: string) => {
    if (source === 'external') {
      return (
        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-bold border border-emerald-400 shadow-lg">
          ✨ New Discovery
        </span>
      );
    }
    return (
      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-3 py-1 rounded-full font-bold border border-blue-400 shadow-lg">
        📚 Arsenal
      </span>
    );
  };

  return (
    <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-amber-300">
            <span className="text-gray-900 text-2xl font-bold">🔍</span>
          </div>
          <div>
            <label className="block text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
              Battle Arsenal Search
            </label>
            <p className="text-lg text-gray-400 font-medium mt-1">Discover and add new weapons to your scent collection</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold border border-emerald-400 shadow-lg">
              🤖 AI Powered
            </span>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold border border-blue-400 shadow-lg">
              ⚡ Lightning Fast
            </span>
          </div>
        </div>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            className="w-full p-6 pl-16 bg-gray-800 border-2 border-gray-600 rounded-2xl focus:ring-4 focus:ring-amber-500/30 focus:border-amber-500 text-xl text-white placeholder-gray-400 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 font-medium"
            placeholder="Search for your next signature weapon: &quot;Dior Sauvage&quot;, &quot;Creed Aventus&quot;..."
            disabled={loading}
          />
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
            <span className="text-amber-500 text-2xl">🎭</span>
          </div>
        </div>

        {loading && (
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-3 bg-gray-700 bg-opacity-95 rounded-xl px-4 py-3 shadow-xl border border-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400"></div>
            <span className="text-sm text-amber-400 font-bold">Searching arsenal...</span>
          </div>
        )}

        {/* Error Message - Dark Mode */}
        {error && (
          <div className="mt-6 p-6 bg-gradient-to-r from-red-900 to-pink-900 border-2 border-red-600 rounded-2xl">
            <div className="flex items-center gap-4">
              <span className="text-red-400 text-2xl">⚠️</span>
              <div>
                <p className="text-red-300 font-bold text-lg">Search Error</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Statistics - Dark Mode */}
        {searchStats && !loading && (
          <div className="mt-6 flex items-center gap-4">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-6 py-3 rounded-full text-sm font-bold shadow-xl border border-amber-400">
              <span className="mr-2">🎯</span>
              Found {searchStats.total} battle-ready fragrances
            </div>
            <div className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-full border border-gray-600 font-medium">
              {searchStats.database} in arsenal • {searchStats.external} new discoveries
            </div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown - Dark Mode */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-gray-800 border-2 border-gray-600 rounded-3xl shadow-2xl z-50 max-h-96 overflow-y-auto mt-4"
        >
          <div className="p-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600 rounded-t-3xl">
            <p className="text-lg font-bold text-amber-400 flex items-center gap-3">
              <span>🎯</span>
              Battle Arsenal Candidates - Click to review
            </p>
          </div>
          {results.map((fragrance, index) => (
            <div
              key={`${fragrance.name}-${fragrance.brand}-${index}`}
              className={`p-6 cursor-pointer border-b border-gray-700 last:border-b-0 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300 ${
                index === selectedIndex ? 'bg-gradient-to-r from-amber-900 to-yellow-900 border-l-4 border-l-amber-500' : ''
              }`}
              onClick={() => handleSelectFragrance(fragrance)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-gray-900 text-lg font-bold shadow-xl">
                      🧴
                    </div>
                    <div>
                      <div className="font-bold text-white text-xl">
                        {fragrance.name}
                      </div>
                      <div className="text-sm font-bold text-gray-300">
                        {fragrance.brand} {fragrance.concentration && `• ${fragrance.concentration}`}
                      </div>
                    </div>
                    {fragrance.year && (
                      <span className="text-xs text-gray-300 bg-gray-700 px-3 py-1 rounded-full font-bold border border-gray-600">
                        {fragrance.year}
                      </span>
                    )}
                  </div>
                  {fragrance.description && (
                    <div className="text-sm text-gray-300 mt-3 line-clamp-2 pl-16">
                      {fragrance.description}
                    </div>
                  )}
                  {fragrance.topNotes && fragrance.topNotes.length > 0 && (
                    <div className="text-sm text-gray-400 mt-4 pl-16">
                      <span className="font-bold text-cyan-400">Top notes:</span>
                      <span className="ml-2">
                        {fragrance.topNotes.slice(0, 3).map((note, idx) => (
                          <span key={idx} className="inline-block bg-cyan-900 text-cyan-200 px-3 py-1 rounded-full mr-2 font-bold border border-cyan-700 text-xs">
                            {note}
                          </span>
                        ))}
                        {fragrance.topNotes.length > 3 && (
                          <span className="text-gray-500 font-bold">+{fragrance.topNotes.length - 3} more</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-6 flex-shrink-0 flex flex-col items-end gap-3">
                  {getSourceBadge(fragrance.source)}
                  {fragrance.priceCents && (
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        ${(fragrance.priceCents / 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400 font-bold">USD</div>
                    </div>
                  )}
                  <div className="text-sm text-amber-400 font-bold bg-amber-900 px-4 py-2 rounded-xl border border-amber-600 shadow-lg">
                    Review & Add ⚔️
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message - Dark Mode */}
      {showResults && results.length === 0 && searchTerm.length >= 2 && !loading && !error && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border-2 border-gray-600 rounded-2xl shadow-2xl z-50 p-8 text-center mt-4">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <div className="font-bold text-xl text-white mb-2">No battle-ready fragrances found for "{searchTerm}"</div>
            <div className="text-lg mt-2 text-amber-400">Try searching for legendary houses like "Dior", "Chanel", or "Creed"</div>
          </div>
        </div>
      )}

      {/* Instructions - Dark Mode */}
      <div className="mt-8 p-6 bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 rounded-2xl border border-amber-600">
        <div className="flex items-center gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-lg font-bold text-amber-200">
              <strong>Battle Strategy:</strong> Click any fragrance to analyze its combat potential before adding to your arsenal
            </p>
            {searchStats && searchStats.external > 0 && (
              <p className="text-sm text-amber-300 mt-2 flex items-center gap-2 font-medium">
                <span>🤖</span>
                AI-powered with {searchStats.external} fresh battle-tested discoveries from the fragrance battlefield
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fragrance Detail Modal */}
      <FragranceDetailModal
        fragrance={selectedFragrance}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
