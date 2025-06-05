import React, { useState, useEffect } from 'react';
import { CategoryBattle } from '@/components/CategoryBattle';
import { TestingInstructions } from '@/components/TestingInstructions';
import { CollectionGuide } from '@/components/CollectionGuide';
import { ResultsModal } from '@/components/ResultsModal';
import { CategoryBattle as CategoryBattleType } from '@/types/fragrance';
import api from '@/utils/api';

const categories = [
  'daily_driver',
  'college',
  'summer',
  'office',
  'club',
  'date',
  'signature',
  'winter',
  'special'
];

export const Battle: React.FC = () => {
  const [battleData, setBattleData] = useState<CategoryBattleType[]>([]);
  const [selections, setSelections] = useState<{[category: string]: string[]}>({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadBattleData();
    createTestSession();
  }, []);

  const loadBattleData = async () => {
    try {
      const promises = categories.map(category =>
        api.get(`/testing/battle-data/${category}`)
      );
      const responses = await Promise.all(promises);
      setBattleData(responses.map(response => response.data));
    } catch (error) {
      console.error('Failed to load battle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestSession = async () => {
    try {
      const response = await api.post('/testing/session', {
        sessionName: `Fragrance Battle ${new Date().toLocaleDateString()}`,
        isBlindTest: true
      });
      setSessionId(response.data.id);
    } catch (error) {
      console.error('Failed to create test session:', error);
    }
  };

  const handleSelectionChange = (category: string, selectedIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [category]: selectedIds
    }));
  };

  const handleSaveResults = async () => {
    if (!sessionId) return;

    try {
      // Save each category's results
      const promises = Object.entries(selections).map(([category, selectedIds]) => {
        const battleConfig = battleData.find(b => b.category === category);
        if (battleConfig && selectedIds.length > 0) {
          return api.post(`/testing/session/${sessionId}/result`, {
            category,
            selectedFragrances: selectedIds,
            maxSelections: battleConfig.maxSelections
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      await api.post(`/testing/session/${sessionId}/complete`);

      alert('Results saved successfully!');
      setShowResults(false);
    } catch (error) {
      console.error('Failed to save results:', error);
      alert('Failed to save results. Please try again.');
    }
  };

  const getFragranceNames = (category: string, ids: string[]): string[] => {
    const battle = battleData.find(b => b.category === category);
    if (!battle) return [];

    return ids.map(id => {
      const fragrance = battle.fragrances.find(f => f.id === id);
      return fragrance ? fragrance.name : 'Unknown';
    });
  };

  const resultsWithNames = Object.entries(selections).reduce((acc, [category, ids]) => {
    acc[category] = getFragranceNames(category, ids);
    return acc;
  }, {} as {[category: string]: string[]});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading fragrance battles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-8">
          Fragrance Testing Guide
        </h1>

        {battleData.map((battle) => (
          <CategoryBattle
            key={battle.category}
            battleData={battle}
            onSelectionChange={handleSelectionChange}
            initialSelections={selections[battle.category] || []}
          />
        ))}

        <TestingInstructions />
        <CollectionGuide />

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-40">
          <div className="container mx-auto flex justify-center gap-4">
            <button
              onClick={() => setShowResults(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save Results
            </button>
            <button
              onClick={() => {
                setSelections({});
                window.location.reload();
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Reset Form
            </button>
          </div>
        </div>

        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          results={resultsWithNames}
          onSave={handleSaveResults}
        />

        {/* Bottom padding to account for fixed buttons */}
        <div className="h-24"></div>
      </div>
    </div>
  );
};
