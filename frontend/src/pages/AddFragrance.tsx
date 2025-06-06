import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SmartFragranceSearch } from '@/components/SmartFragranceSearch';
import { AddFragranceForm } from '@/components/AddFragranceForm';

export const AddFragrance: React.FC = () => {
  const navigate = useNavigate();
  const [showManualForm, setShowManualForm] = useState(false);

  const handleSuccess = () => {
    // Optionally redirect to battle page after adding
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleFragranceSelect = (fragrance: any) => {
    console.log('Selected fragrance:', fragrance);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-6 py-10">
        {/* Dark Mode Header with navigation */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
              Perfume Battle AI
            </h1>
            <p className="text-xl text-gray-400 mt-2 font-medium">Expand your fragrance arsenal</p>
          </div>
          <Link
            to="/"
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-6 py-3 rounded-2xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-amber-400"
          >
            ⚔️ Back to Battle
          </Link>
        </div>

        {/* Smart Search Section - No extra wrapper needed since component has its own dark styling */}
        <SmartFragranceSearch
          onFragranceSelect={handleFragranceSelect}
          onSuccess={handleSuccess}
        />

        {/* Manual Form Toggle - Dark Mode */}
        <div className="bg-gray-800 border border-gray-600 rounded-3xl p-8 mb-12 mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Can't find your battle weapon?</h3>
              <p className="text-gray-300 text-lg mt-1">Add it manually with full details and AI categorization</p>
            </div>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-blue-400"
            >
              {showManualForm ? '🔼 Hide Manual Form' : '⚔️ Add Manually'}
            </button>
          </div>
        </div>

        {/* Manual Form (Hidden by default) */}
        {showManualForm && (
          <div className="mb-8">
            <AddFragranceForm onSuccess={handleSuccess} />
          </div>
        )}

        {/* Information cards - Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-600 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-emerald-400 mb-6">🎯 Arsenal Discovery Features</h3>
            <ul className="space-y-4 text-emerald-200">
              <li className="flex items-start">
                <span className="text-emerald-400 font-bold mr-3 text-lg">⚡</span>
                <span className="text-lg font-medium">Lightning-fast search with auto-complete</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 font-bold mr-3 text-lg">🧪</span>
                <span className="text-lg font-medium">Pre-loaded scent profiles and details</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 font-bold mr-3 text-lg">🤖</span>
                <span className="text-lg font-medium">AI battle categorization in seconds</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 font-bold mr-3 text-lg">🌍</span>
                <span className="text-lg font-medium">Legendary fragrances database</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-violet-900 border border-purple-600 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-purple-400 mb-6">🤖 AI Battle Categories</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Daily Driver</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Office</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Date Night</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Summer</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Winter</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Club</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Signature</span>
              <span className="bg-purple-800 text-purple-200 px-4 py-2 rounded-xl font-bold border border-purple-600">Special</span>
            </div>
          </div>
        </div>

        {/* Instructions - Dark Mode */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-600">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">⚔️ Battle Arsenal Deployment Protocol</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-xl">1</div>
              <h4 className="font-bold text-amber-400 mb-3 text-xl">🔍 Search</h4>
              <p className="text-gray-300 text-lg">Type any legendary fragrance name and watch the AI find your weapons</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 text-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-xl">2</div>
              <h4 className="font-bold text-emerald-400 mb-3 text-xl">🎯 Analyze</h4>
              <p className="text-gray-300 text-lg">Review the fragrance intel and combat potential before deployment</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-xl">3</div>
              <h4 className="font-bold text-purple-400 mb-3 text-xl">⚔️ Deploy</h4>
              <p className="text-gray-300 text-lg">AI categorizes and adds the weapon to your battle-ready arsenal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
