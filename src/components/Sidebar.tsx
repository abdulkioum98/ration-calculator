import React from 'react';
import { X, Tag, FlaskConical, BookOpen, Wheat, Calculator, Layers, Dna } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string, label: string) => void;
  activeId?: string;
}

export default function Sidebar({ isOpen, onClose, onNavigate, activeId = 'calculator' }: SidebarProps) {
  const menuItems = [
    { id: 'calculator', label: 'Calculator', icon: <Calculator size={18} /> },
    { id: 'nourish-feeds-reference', label: 'Nourish Feeds', icon: <Wheat size={18} /> },
    { id: 'other-ingredients-reference', label: 'Other Ingredients', icon: <Layers size={18} /> },
    { id: 'dm-ration-reference', label: 'DM Ratio', icon: <BookOpen size={18} /> },
    { id: 'breed-reference', label: 'Breeds', icon: <Dna size={18} /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Sidebar Content */}
      <div className="relative w-64 bg-white h-full shadow-xl z-50 flex flex-col justify-between">
        <div>
          <div className="bg-emerald-800 text-white p-4 flex justify-between items-center">
            <h2 className="font-bold text-lg">Menu & Reference</h2>
            <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded transition">
              <X size={20} />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id, item.label);
                    onClose();
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-gray-700 font-medium flex items-center space-x-3 transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-700' : 'text-emerald-600'}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t text-xs text-gray-400 text-center">
          Cattle Ration Calculator v1.0
        </div>
      </div>
    </div>
  );
}