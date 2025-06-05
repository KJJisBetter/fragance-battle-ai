import React, { useState, useEffect } from 'react';
import { FragranceCard } from './FragranceCard';
import { Fragrance, CategoryBattle as CategoryBattleType } from '@/types/fragrance';

interface CategoryBattleProps {
  battleData: CategoryBattleType;
  onSelectionChange: (category: string, selectedIds: string[]) => void;
  initialSelections?: string[];
}

export const CategoryBattle: React.FC<CategoryBattleProps> = ({
  battleData,
  onSelectionChange,
  initialSelections = []
}) => {
  const [selectedFragrances, setSelectedFragrances] = useState<string[]>(initialSelections);
  const isMultiSelect = battleData.maxSelections > 1;

  useEffect(() => {
    onSelectionChange(battleData.category, selectedFragrances);
  }, [selectedFragrances, battleData.category]);

  const handleFragranceSelect = (fragranceId: string) => {
    if (isMultiSelect) {
      setSelectedFragrances(prev => {
        if (prev.includes(fragranceId)) {
          return prev.filter(id => id !== fragranceId);
        } else if (prev.length < battleData.maxSelections) {
          return [...prev, fragranceId];
        } else {
          alert(`You can only select ${battleData.maxSelections} fragrances for this category`);
          return prev;
        }
      });
    } else {
      setSelectedFragrances([fragranceId]);
    }
  };

  const categoryColors = {
    daily_driver: 'text-blue-700 border-blue-500',
    college: 'text-blue-800 border-blue-600',
    summer: 'text-cyan-600 border-cyan-500',
    office: 'text-blue-900 border-blue-700',
    club: 'text-purple-700 border-purple-600',
    date: 'text-red-600 border-red-500',
    signature: 'text-orange-600 border-orange-500',
    winter: 'text-amber-700 border-amber-600',
    special: 'text-purple-600 border-purple-500'
  };

  const colorClass = categoryColors[battleData.category as keyof typeof categoryColors] || 'text-blue-600 border-blue-500';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className={`text-2xl font-bold mb-4 pb-2 border-b-2 ${colorClass}`}>
        {battleData.title}
      </h2>

      <div className="mb-4 space-y-2">
        <div>
          <span className="font-semibold text-blue-900">Purpose:</span> {battleData.purpose}
        </div>
        <div>
          <span className="font-semibold text-blue-900">Examples:</span> {battleData.examples}
        </div>
        <div className="italic text-blue-700 mt-2">
          {battleData.instruction}
        </div>
      </div>

      <div className="space-y-3">
        {battleData.fragrances.map((fragrance) => (
          <FragranceCard
            key={fragrance.id}
            fragrance={fragrance}
            isSelected={selectedFragrances.includes(fragrance.id)}
            onSelect={handleFragranceSelect}
            selectionType={isMultiSelect ? 'checkbox' : 'radio'}
            disabled={
              !isMultiSelect &&
              selectedFragrances.length > 0 &&
              !selectedFragrances.includes(fragrance.id)
            }
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Selected: {selectedFragrances.length} / {battleData.maxSelections}
      </div>
    </div>
  );
};
