import React from 'react';
import { Fragrance } from '@/types/fragrance';

interface FragranceCardProps {
  fragrance: Fragrance;
  isSelected: boolean;
  onSelect: (fragranceId: string) => void;
  selectionType: 'checkbox' | 'radio';
  disabled?: boolean;
}

export const FragranceCard: React.FC<FragranceCardProps> = ({
  fragrance,
  isSelected,
  onSelect,
  selectionType,
  disabled = false
}) => {
  const notes = [
    ...fragrance.notes.top,
    ...fragrance.notes.middle,
    ...fragrance.notes.base
  ].join(', ');

  return (
    <div className={`fragrance-card border-l-4 border-red-400 p-4 mb-4 bg-gray-50 rounded-r-lg transition-all duration-200 ${
      isSelected ? 'bg-blue-50 border-blue-500' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}>
      <label className="flex items-start cursor-pointer">
        <input
          type={selectionType}
          checked={isSelected}
          onChange={() => !disabled && onSelect(fragrance.id)}
          disabled={disabled}
          className="mt-1 mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-gray-900">{fragrance.name}</div>
            <div className="text-red-500 text-sm">
              Versatility: {fragrance.versatility}/5
            </div>
          </div>
          <div className="text-sm text-gray-600 italic">
            Notes: {notes}
          </div>
          {fragrance.description && (
            <div className="text-sm text-gray-700 mt-1">
              {fragrance.description}
            </div>
          )}
        </div>
      </label>
    </div>
  );
};
