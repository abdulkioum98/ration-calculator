import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, FlaskConical, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';

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
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [cpInput, setCpInput] = useState('');
  const [energyInput, setEnergyInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Fetch nutrient items from Supabase
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

  const resetForm = () => {
    setNameInput('');
    setDmInput('');
    setCpInput('');
    setEnergyInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleToggleAdd = () => {
    setNameInput('');
    setDmInput('');
    setCpInput('');
    setEnergyInput('');
    setEditingId(null);
    setIsAdding((prev) => !prev);
  };

  // 2. Add item to Supabase
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !dmInput || !cpInput || !energyInput) {
      alert('Please fill in all fields correctly.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('feed_nutrients')
      .insert([
        {
          name: nameInput.trim(),
          dm_percent: parseFloat(dmInput),
          cp_percent: parseFloat(cpInput),
          me_energy: parseFloat(energyInput),
          feed_type: activeFeedType,
          category: activeCategory,
        },
      ])
      .select();

    setIsSubmitting(false);

    if (error) {
      alert('Failed to add item: ' + error.message);
    } else if (data && data.length > 0) {
      setItems((prev) => [...prev, data[0]]);
      resetForm();
    }
  };

  // 3. Update item in Supabase
  const handleUpdateItem = async (id: string) => {
    if (!nameInput.trim() || !dmInput || !cpInput || !energyInput) return;

    const { error } = await supabase
      .from('feed_nutrients')
      .update({
        name: nameInput.trim(),
        dm_percent: parseFloat(dmInput),
        cp_percent: parseFloat(cpInput),
        me_energy: parseFloat(energyInput),
      })
      .eq('id', id);

    if (error) {
      alert('Failed to update item: ' + error.message);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                name: nameInput.trim(),
                dm_percent: parseFloat(dmInput),
                cp_percent: parseFloat(cpInput),
                me_energy: parseFloat(energyInput),
              }
            : item
        )
      );
      resetForm();
    }
  };

  // 4. Delete item from Supabase
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('feed_nutrients').delete().eq('id', id);

    if (error) {
      alert('Failed to delete item: ' + error.message);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

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
          onClick={() => {
            setActiveFeedType('concentrate');
            resetForm();
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
          type="button"
          onClick={() => {
            setActiveFeedType('fodder');
            resetForm();
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

      {/* Sub Category Tabs (Dairy vs Fattening) & Add Button */}
      <div className="flex items-center space-x-2">
        <div className="flex flex-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('dairy');
              resetForm();
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
            type="button"
            onClick={() => {
              setActiveCategory('fattening');
              resetForm();
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
          type="button"
          onClick={handleToggleAdd}
          className={`p-2.5 rounded-xl transition active:scale-95 shrink-0 flex items-center justify-center ${
            isAdding
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
          }`}
          title={isAdding ? 'Close Form' : 'Add New Item'}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Add New Item Form Block */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="bg-white p-3.5 rounded-xl space-y-2.5 border-2 border-emerald-500 shadow-md animate-in fade-in duration-150"
        >
          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Add New {activeFeedType} ({activeCategory})
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Ingredient Name (e.g. Rice Bran)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">DM (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="88.0"
                value={dmInput}
                onChange={(e) => setDmInput(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50/50"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">CP (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="12.5"
                value={cpInput}
                onChange={(e) => setCpInput(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50/50"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">ME (MJ/kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="11.5"
                value={energyInput}
                onChange={(e) => setEnergyInput(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50/50"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs disabled:opacity-50 flex items-center space-x-1"
            >
              {isSubmitting && <Loader2 size={12} className="animate-spin mr-1" />}
              <span>Save Data</span>
            </button>
          </div>
        </form>
      )}

      {/* Nutrients Table */}
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
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No records found. Click "+" to add.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {editingId === item.id ? (
                        <>
                          <td className="p-1.5" colSpan={4}>
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full text-xs p-1 border rounded"
                              />
                              <div className="grid grid-cols-3 gap-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={dmInput}
                                  onChange={(e) => setDmInput(e.target.value)}
                                  className="text-xs p-1 border rounded text-center"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={cpInput}
                                  onChange={(e) => setCpInput(e.target.value)}
                                  className="text-xs p-1 border rounded text-center"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={energyInput}
                                  onChange={(e) => setEnergyInput(e.target.value)}
                                  className="text-xs p-1 border rounded text-center"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-1 text-center align-top">
                            <div className="flex justify-center space-x-1 mt-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item.id)}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => resetForm()}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
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
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAdding(false);
                                  setEditingId(item.id);
                                  setNameInput(item.name);
                                  setDmInput(item.dm_percent.toString());
                                  setCpInput(item.cp_percent.toString());
                                  setEnergyInput(item.me_energy.toString());
                                }}
                                className="text-slate-400 hover:text-emerald-700 p-0.5"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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