import React from 'react';
import { ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onSelectDairy: () => void;
}

export default function LandingPage({ onSelectDairy }: LandingPageProps) {
  return (
    <div className="space-y-6 mt-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-800">Select Category</h2>
        <p className="text-gray-500 text-sm mt-1">Choose the type of ration calculation</p>
      </div>

      <div className="space-y-4">
        {/* Dairy Option */}
        <button
          onClick={onSelectDairy}
          className="w-full bg-white border-2 border-emerald-600 p-5 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between text-left group"
        >
          <div>
            <h3 className="text-lg font-bold text-emerald-800">Ration Calculation for Dairy</h3>
            <p className="text-xs text-gray-500 mt-1">For milk-producing cows</p>
          </div>
          <div className="bg-emerald-100 p-2 rounded-full text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
            <ChevronRight size={20} />
          </div>
        </button>

        {/* Fattening Option */}
        <button
          disabled
          className="w-full bg-gray-50 border-2 border-gray-200 p-5 rounded-xl opacity-60 cursor-not-allowed flex items-center justify-between text-left"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-500">Ration Calculation for Fattening</h3>
            <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
          </div>
        </button>
      </div>
    </div>
  );
}