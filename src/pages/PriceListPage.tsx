import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Tag, Loader2, Layers } from 'lucide-react';

export interface PriceListItem {
  id: string;
  name: string;
  price_per_kg: number;
  feed_type: 'concentrate' | 'fodder';
  category: 'dairy' | 'fattening';
}

interface PriceListPageProps {
  onBack: () => void;
}

export default function PriceListPage({ onBack }: PriceListPageProps) {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [activeFeedType, setActiveFeedType] = useState<'concentrate' | 'fodder'>('concentrate');
  const [activeCategory, setActiveCategory] = useState<'dairy' | 'fattening'>('dairy');
  const [loading, setLoading] = useState(true);

  // 1. Fetch items from Supabase
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('price_list')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching price list:', error);
      alert('Failed to load items: ' + error.message);
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
    <div className="bg-slate-50 min-h-[85vh] p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3.5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-lg">
            <Tag size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-none">Price List</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Raw feed & fodder prices</p>
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
      <div className="flex bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
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

      {/* Item List / Cards (Read-Only) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-xs font-medium">Loading feeds...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <Layers className="mx-auto text-slate-300" size={28} />
            <p className="text-xs text-slate-500 font-medium">No ingredients available.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-400 w-4 text-right">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    ৳{item.price_per_kg.toFixed(2)}/kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-900 transition flex items-center justify-center space-x-1.5 shadow-2xs mt-3"
      >
        <ArrowLeft size={14} />
        <span>Back to Calculator</span>
      </button>
    </div>
  );
}