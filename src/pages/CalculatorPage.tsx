import React from 'react';
import { CowData } from './CowInfoPage';

interface CalculatorPageProps {
  cowData: CowData | null;
  onEditInfo: () => void;
}

export default function CalculatorPage({ cowData, onEditInfo }: CalculatorPageProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-bold text-emerald-800 border-b pb-2">Dairy Ration Calculator</h2>

      {cowData && (
        <div className="bg-emerald-50 p-3 rounded-lg text-xs text-gray-700 space-y-1">
          <p><strong>Breed:</strong> {cowData.breed || 'N/A'} | <strong>Weight:</strong> {cowData.weight} kg</p>
          <p><strong>Milk Yield:</strong> {cowData.milkYield} L/day | <strong>Feed:</strong> {cowData.nourishFeed || 'N/A'}</p>
        </div>
      )}

      <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
        <p className="text-sm font-medium">Calculator logic & parameters will be added here next.</p>
      </div>

      <button
        onClick={onEditInfo}
        className="w-full bg-gray-100 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-200 transition"
      >
        Edit Cow Information
      </button>
    </div>
  );
}