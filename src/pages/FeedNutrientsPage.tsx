import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FlaskConical, Loader2, Layers } from 'lucide-react';

export interface NutrientItem {
  id: string;
  name: string;
  dm_percent: number;
  cp_percent: number;
  me_energy: number;
  feed_type: 'concentrate' | 'fodder';
  category: 'dairy' | 'fattening';
}

interface FeedNutrientsPageProps {
  onBack: () => void;
}

export default function FeedNutrientsPage({ onBack }: FeedNutrientsPageProps) {
  const [items, setItems] = useState<NutrientItem[]>([]);
  const [activeFeedType, setActiveFeedType] = useState<'concentrate' | 'fodder'>('concentrate');
  const [activeCategory, setActiveCategory] = useState<'dairy' | 'fattening'>('dairy');
  const [loading, setLoading] = useState(true);

  // Fetch nutrient items from Supabase
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feed_nutrients')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching nutrient values:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) => item.feed_type === activeFeedType && item.category === activeCategory
  );

  return (
    <div className="bg-slate-50 min-h-[85vh] p-3 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-3.5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-lg">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-none">Nutrient Values</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">DM (%), CP (%) & ME Energy (MJ/kg)</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-600 font-semibold flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Category Pills (Concentrate vs Fodder) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveFeedType('concentrate')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeFeedType === 'concentrate'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Concentrate
        </button>
        <button
          type="button"
          onClick={() => setActiveFeedType('fodder')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeFeedType === 'fodder'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fodder
        </button>
      </div>

      {/* Sub Category Tabs (Dairy vs Fattening) */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveCategory('dairy')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeCategory === 'dairy'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Dairy
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('fattening')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeCategory === 'fattening'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Fattening
        </button>
      </div>

      {/* Nutrients Table (Read-Only) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-xs font-medium">Loading nutrients...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-2 text-center">DM %</th>
                  <th className="py-2.5 px-2 text-center">CP %</th>
                  <th className="py-2.5 px-2 text-center">ME (MJ/kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center space-y-1">
                      <Layers className="mx-auto text-slate-300" size={24} />
                      <p className="text-xs text-slate-400 font-medium">No nutrient data available.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 font-medium">
                        {item.dm_percent}%
                      </td>
                      <td className="py-2.5 px-2 text-center text-emerald-700 font-bold">
                        {item.cp_percent}%
                      </td>
                      <td className="py-2.5 px-2 text-center text-amber-700 font-semibold">
                        {item.me_energy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-900 transition flex items-center justify-center space-x-1.5 shadow-2xs mt-3"
      >
        <ArrowLeft size={14} />
        <span>Back to Calculator</span>
      </button>
    </div>
  );
}