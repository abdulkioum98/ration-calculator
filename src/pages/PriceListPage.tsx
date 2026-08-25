import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Tag, Plus, Edit2, Trash2, Check, X, Loader2, Layers } from 'lucide-react';

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
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // 2. Add item to Supabase
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !priceInput) return;

    const { data, error } = await supabase
      .from('price_list')
      .insert([
        {
          name: nameInput,
          price_per_kg: parseFloat(priceInput),
          feed_type: activeFeedType,
          category: activeCategory,
        },
      ])
      .select();

    if (error) {
      alert('Failed to add item: ' + error.message);
    } else if (data) {
      setItems([...items, ...data]);
      setNameInput('');
      setPriceInput('');
      setIsAdding(false);
    }
  };

  // 3. Update item in Supabase
  const handleUpdateItem = async (id: string) => {
    const { error } = await supabase
      .from('price_list')
      .update({
        name: nameInput,
        price_per_kg: parseFloat(priceInput),
      })
      .eq('id', id);

    if (error) {
      alert('Failed to update item: ' + error.message);
    } else {
      setItems(
        items.map((item) =>
          item.id === id
            ? { ...item, name: nameInput, price_per_kg: parseFloat(priceInput) }
            : item
        )
      );
      setEditingId(null);
      setNameInput('');
      setPriceInput('');
    }
  };

  // 4. Delete item from Supabase
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;

    const { error } = await supabase.from('price_list').delete().eq('id', id);

    if (error) {
      alert('Failed to delete item: ' + error.message);
    } else {
      setItems(items.filter((item) => item.id !== id));
    }
  };

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
            <p className="text-[11px] text-slate-400 mt-0.5">Manage raw feed & fodder prices</p>
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
          onClick={() => {
            setActiveFeedType('concentrate');
            setEditingId(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeFeedType === 'concentrate'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Concentrate
        </button>
        <button
          onClick={() => {
            setActiveFeedType('fodder');
            setEditingId(null);
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            activeFeedType === 'fodder'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Fodder
        </button>
      </div>

      {/* Sub Category Tabs (Dairy vs Fattening) & Floating Add Action */}
      <div className="flex items-center space-x-2">
        <div className="flex flex-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => {
              setActiveCategory('dairy');
              setEditingId(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === 'dairy'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dairy
          </button>
          <button
            onClick={() => {
              setActiveCategory('fattening');
              setEditingId(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === 'fattening'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fattening
          </button>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setNameInput('');
            setPriceInput('');
            setEditingId(null);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center shrink-0"
          title="Add New Feed Item"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add New Item Modal/Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="bg-white p-3.5 rounded-xl space-y-2.5 border border-emerald-300 shadow-xs"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              New {activeFeedType} ({activeCategory}) Item
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Ingredient Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="col-span-2 text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-hidden bg-slate-50/50"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price/kg"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-hidden bg-slate-50/50"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 shadow-xs"
            >
              Save to DB
            </button>
          </div>
        </form>
      )}

      {/* Item List / Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-xs font-medium">Loading feeds...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <Layers className="mx-auto text-slate-300" size={28} />
            <p className="text-xs text-slate-500 font-medium">No ingredients added yet.</p>
            <p className="text-[11px] text-slate-400">Tap the "+" button to add price records.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition"
              >
                {editingId === item.id ? (
                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="flex-1 text-xs p-1.5 border rounded-lg"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-16 text-xs p-1.5 border rounded-lg text-right"
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleUpdateItem(item.id)}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-400 w-4 text-right">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        ৳{item.price_per_kg.toFixed(2)}/kg
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setNameInput(item.name);
                            setPriceInput(item.price_per_kg.toString());
                          }}
                          className="text-slate-400 hover:text-emerald-700 p-1 rounded-md transition"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
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