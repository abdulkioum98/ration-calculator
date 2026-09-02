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
        <button onClick={onOpenSidebar} className="text-2xl focus:outline-none p-1 hover:bg-emerald-800 rounded-lg transition">
          <Menu size={24} />
        </button>
        
        {/* Brand Logo & Title */}
        <div 
          onClick={onGoHome} 
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <img 
            src="/nourish.png" 
            alt="Nourish Logo" 
            className="h-7 w-auto object-contain bg-white/90 p-0.5 rounded-md shadow-xs"
          />
          <h1 className="text-lg font-bold tracking-tight">Ration Calc</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        
        <button 
          onClick={onGoHome} 
          className="text-xl p-1.5 hover:bg-emerald-800 rounded-lg transition" 
          title="Home"
        >
          <Home size={22} />
        </button>
      </div>
    </header>
  );
}