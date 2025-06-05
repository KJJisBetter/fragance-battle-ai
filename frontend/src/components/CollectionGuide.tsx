import React from 'react';

export const CollectionGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Building Your Collection</h2>
      <p className="mb-3 text-gray-700">Start with:</p>
      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
        <li>2 Daily Drivers (rotation)</li>
        <li>1 College/Campus fragrance</li>
        <li>1 each from the other categories you regularly encounter</li>
      </ul>
      <p className="text-gray-700">
        This will give you a well-rounded collection covering all occasions without unnecessary duplication.
      </p>
    </div>
  );
};
