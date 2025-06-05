import React from 'react';
import { X, Share2, Download } from 'lucide-react';

interface TestResults {
  [category: string]: string[];
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResults;
  onSave: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  onSave
}) => {
  if (!isOpen) return null;

  const categoryTitles = {
    daily_driver: 'DAILY DRIVERS',
    college: 'COLLEGE/CAMPUS',
    summer: 'SUMMER/WARM WEATHER',
    office: 'OFFICE/PROFESSIONAL',
    club: 'CLUB/NIGHT OUT',
    date: 'DATE NIGHT',
    signature: 'SIGNATURE SCENT',
    winter: 'FALL/WINTER',
    special: 'SPECIAL OCCASION'
  };

  const generateResultsText = () => {
    let resultString = "MY FRAGRANCE SELECTIONS\n\n";

    Object.entries(results).forEach(([category, selections]) => {
      const title = categoryTitles[category as keyof typeof categoryTitles] || category.toUpperCase();
      resultString += `${title}: `;
      resultString += selections.length > 0 ? selections.join(", ") : "None selected";
      resultString += "\n\n";
    });

    return resultString;
  };

  const handleShare = async () => {
    const resultsText = generateResultsText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Fragrance Selections',
          text: resultsText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(resultsText);
      alert('Results copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const resultsText = generateResultsText();
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fragrance-test-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Your Fragrance Selections</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            {Object.entries(results).map(([category, selections]) => {
              const title = categoryTitles[category as keyof typeof categoryTitles] || category.toUpperCase();
              return (
                <div key={category} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold text-gray-900">{title}:</div>
                  <div className="text-gray-700">
                    {selections.length > 0 ? selections.join(", ") : "None selected"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Results
            </button>
            <button
              onClick={handleShare}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
