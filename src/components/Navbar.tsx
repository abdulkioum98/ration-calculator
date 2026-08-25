import React from 'react';
import { Menu, Home, Calculator } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  onGoHome: () => void;
  onGoCalculator: () => void;
  hasCowData: boolean;
}

export default function Navbar({ onOpenSidebar, onGoHome, onGoCalculator, hasCowData }: NavbarProps) {
  return (
    <header className="bg-emerald-700 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button onClick={onOpenSidebar} className="text-2xl focus:outline-none p-1">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">Cattle Ration Calc</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* গরুর ডাটা সেভ থাকলে সরাসরি ক্যালকুলেটরে ফেরার বাটন */}
        {hasCowData && (
          <button 
            onClick={onGoCalculator} 
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
            title="Go to Calculator"
          >
            <Calculator size={16} />
            <span>Calc</span>
          </button>
        )}
        
        <button onClick={onGoHome} className="text-xl p-1" title="Home">
          <Home size={22} />
        </button>
      </div>
    </header>
  );
}