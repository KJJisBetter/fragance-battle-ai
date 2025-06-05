import React from 'react';

export const TestingInstructions: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Testing Instructions</h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>For each category, have your friend label test strips A, B, C (and D if needed)</li>
        <li>Don't look at which fragrance is which - smell them blind</li>
        <li>Pick your favorite(s) for each category by checking the boxes</li>
        <li>After all testing is complete, have your friend reveal which fragrances you selected</li>
        <li>Use the "Save Results" button to save or share your selections</li>
      </ol>
    </div>
  );
};
