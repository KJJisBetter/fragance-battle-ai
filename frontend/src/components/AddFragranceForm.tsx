import React, { useState } from 'react';
import api from '@/utils/api';

interface AddFragranceFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const AddFragranceForm: React.FC<AddFragranceFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    concentration: 'EDT' as 'EDT' | 'EDP' | 'Parfum' | 'Cologne',
    topNotes: [] as string[],
    middleNotes: [] as string[],
    baseNotes: [] as string[],
    description: '',
    imageUrl: '',
    price: ''
  });

  const [currentTopNote, setCurrentTopNote] = useState('');
  const [currentMiddleNote, setCurrentMiddleNote] = useState('');
  const [currentBaseNote, setCurrentBaseNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addNote = (noteType: 'topNotes' | 'middleNotes' | 'baseNotes', note: string) => {
    if (note.trim()) {
      setFormData(prev => ({
        ...prev,
        [noteType]: [...prev[noteType], note.trim()]
      }));

      // Clear the input
      if (noteType === 'topNotes') setCurrentTopNote('');
      if (noteType === 'middleNotes') setCurrentMiddleNote('');
      if (noteType === 'baseNotes') setCurrentBaseNote('');
    }
  };

  const removeNote = (noteType: 'topNotes' | 'middleNotes' | 'baseNotes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [noteType]: prev[noteType].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || formData.topNotes.length === 0) {
      alert('Please fill in the required fields: name, brand, and at least one top note.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/testing/fragrance', {
        name: formData.name,
        brand: formData.brand,
        concentration: formData.concentration,
        topNotes: formData.topNotes,
        middleNotes: formData.middleNotes,
        baseNotes: formData.baseNotes,
        description: formData.description,
        imageUrl: formData.imageUrl,
        priceCents: formData.price ? Math.round(parseFloat(formData.price) * 100) : undefined
      });

      alert(`Fragrance added successfully! AI suggested categories: ${response.data.suggestedCategories.join(', ')}`);

      // Reset form
      setFormData({
        name: '', brand: '', concentration: 'EDT', topNotes: [], middleNotes: [], baseNotes: [],
        description: '', imageUrl: '', price: ''
      });
      setSuggestedCategories([]);
      setShowPreview(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to add fragrance:', error);
      alert('Failed to add fragrance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categoryDisplayNames = {
    daily_driver: 'Daily Driver',
    college: 'College/Campus',
    summer: 'Summer',
    office: 'Office/Professional',
    club: 'Club/Night Out',
    date: 'Date Night',
    signature: 'Signature Scent',
    winter: 'Fall/Winter',
    special: 'Special Occasion'
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Add New Fragrance</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Sauvage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Dior"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concentration
            </label>
            <select
              value={formData.concentration}
              onChange={(e) => handleInputChange('concentration', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Cologne">Cologne</option>
              <option value="EDT">EDT (Eau de Toilette)</option>
              <option value="EDP">EDP (Eau de Parfum)</option>
              <option value="Parfum">Parfum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="99.99"
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Fragrance Notes</h3>

          {/* Top Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top Notes *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTopNote}
                onChange={(e) => setCurrentTopNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote('topNotes', currentTopNote))}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Bergamot, Lemon, Pink Pepper"
              />
              <button
                type="button"
                onClick={() => addNote('topNotes', currentTopNote)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topNotes.map((note, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {note}
                  <button type="button" onClick={() => removeNote('topNotes', index)} className="text-blue-600 hover:text-blue-800">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Middle Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Notes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentMiddleNote}
                onChange={(e) => setCurrentMiddleNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote('middleNotes', currentMiddleNote))}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Lavender, Rose, Jasmine"
              />
              <button
                type="button"
                onClick={() => addNote('middleNotes', currentMiddleNote)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.middleNotes.map((note, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {note}
                  <button type="button" onClick={() => removeNote('middleNotes', index)} className="text-green-600 hover:text-green-800">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Base Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Notes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentBaseNote}
                onChange={(e) => setCurrentBaseNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote('baseNotes', currentBaseNote))}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Sandalwood, Vanilla, Musk"
              />
              <button
                type="button"
                onClick={() => addNote('baseNotes', currentBaseNote)}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.baseNotes.map((note, index) => (
                <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {note}
                  <button type="button" onClick={() => removeNote('baseNotes', index)} className="text-amber-600 hover:text-amber-800">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the fragrance's character, inspiration, or when to wear it..."
          />
        </div>

        {/* AI Category Preview */}
        {showPreview && suggestedCategories.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Suggested Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedCategories.map(category => (
                <span key={category} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {categoryDisplayNames[category as keyof typeof categoryDisplayNames]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding Fragrance...' : '🤖 Add Fragrance (AI Categories)'}
          </button>
        </div>
      </form>
    </div>
  );
};
