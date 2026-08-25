import React from 'react';
import { X, Tag, FlaskConical, Dna, Zap, BookOpen, Wheat, Calculator } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string, label: string) => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const menuItems = [
  { id: 'calculator', label: 'Calculator', icon: <Calculator size={18} /> },
  { id: 'nourish-feeds', label: 'List of Nourish Feed', icon: <Wheat size={18} /> },
  { id: 'price-list', label: 'Price List', icon: <Tag size={18} /> },
  { id: 'feed-nutrients', label: 'Feed Nutrients (DM, CP, Energy)', icon: <FlaskConical size={18} /> },
  { id: 'dm-reference', label: 'DM Reference', icon: <BookOpen size={18} /> },
];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

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
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id, item.label);
                  onClose();
                }}
                className={`w-full text-left py-2.5 px-3 rounded-lg hover:bg-emerald-50 text-gray-700 font-medium flex items-center space-x-3 transition ${
                  item.id === 'calculator'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border-b mb-2'
                    : ''
                }`}
              >
                <span className="text-emerald-600">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t text-xs text-gray-400 text-center">
          Cattle Ration Calculator v1.0
        </div>
      </div>
    </div>
  );
}