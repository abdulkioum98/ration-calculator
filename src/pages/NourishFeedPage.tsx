import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Wheat, Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';

export interface FeedItem {
  id: string;
  name: string;
  tp_per_kg: number;
  category: 'dairy' | 'fattening';
}

interface NourishFeedPageProps {
  onBack: () => void;
}

export default function NourishFeedPage({ onBack }: NourishFeedPageProps) {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dairy' | 'fattening'>('dairy');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Load feeds from database
  const fetchFeeds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nourish_feeds')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load feed items: ' + error.message);
    } else {
      setFeeds(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  // 2. Add new item to database
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !priceInput) return;

    const { data, error } = await supabase.from('nourish_feeds').insert([
      {
        name: nameInput,
        tp_per_kg: parseFloat(priceInput),
        category: activeTab,
      },
    ]).select();

    if (error) {
      alert('Failed to add item: ' + error.message);
    } else if (data) {
      setFeeds([...feeds, ...data]);
      setNameInput('');
      setPriceInput('');
      setIsAdding(false);
    }
  };

  // 3. Update item in database
  const handleUpdateItem = async (id: string) => {
    const { error } = await supabase
      .from('nourish_feeds')
      .update({
        name: nameInput,
        tp_per_kg: parseFloat(priceInput),
      })
      .eq('id', id);

    if (error) {
      alert('Failed to update item: ' + error.message);
    } else {
      setFeeds(
        feeds.map((f) =>
          f.id === id ? { ...f, name: nameInput, tp_per_kg: parseFloat(priceInput) } : f
        )
      );
      setEditingId(null);
      setNameInput('');
      setPriceInput('');
    }
  };

  // 4. Delete item from database
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;

    const { error } = await supabase.from('nourish_feeds').delete().eq('id', id);

    if (error) {
      alert('Failed to delete item: ' + error.message);
    } else {
      setFeeds(feeds.filter((f) => f.id !== id));
    }
  };

  const filteredFeeds = feeds.filter((f) => f.category === activeTab);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center space-x-2">
          <Wheat className="text-emerald-700" size={20} />
          <h2 className="text-lg font-bold text-emerald-800">List of Nourish Feed</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded hover:bg-emerald-100 transition"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Segment Tabs & Add Button */}
      <div className="flex items-center space-x-2">
        <div className="flex flex-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('dairy'); setEditingId(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              activeTab === 'dairy' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Nourish Dairy Feed
          </button>
          <button
            onClick={() => { setActiveTab('fattening'); setEditingId(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              activeTab === 'fattening' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Nourish Fattening Feed
          </button>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setNameInput('');
            setPriceInput('');
            setEditingId(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition"
          title="Add New Feed"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add New Item Form */}
      {isAdding && (
        <form onSubmit={handleAddItem} className="bg-emerald-50 p-3 rounded-lg space-y-2 border border-emerald-200">
          <h4 className="text-xs font-bold text-emerald-900">
            Add to {activeTab === 'dairy' ? 'Dairy' : 'Fattening'} Feed
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Item Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="col-span-2 text-xs p-2 border border-gray-300 rounded focus:outline-emerald-600 bg-white"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price/kg"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="text-xs p-2 border border-gray-300 rounded focus:outline-emerald-600 bg-white"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-emerald-700 text-white font-bold rounded hover:bg-emerald-800"
            >
              Save to DB
            </button>
          </div>
        </form>
      )}

      {/* Feed Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-semibold">Loading feeds from Supabase...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50 text-emerald-900 border-b border-gray-200 text-xs uppercase">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">SL</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-right">Price/kg</th>
                <th className="py-2.5 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-gray-400">
                    No items in database. Click "+" to add.
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((feed, index) => (
                  <tr key={feed.id} className="hover:bg-gray-50 transition">
                    {editingId === feed.id ? (
                      <>
                        <td className="py-2 px-2 text-center text-xs font-semibold text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full text-xs p-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            className="w-16 text-xs p-1 border rounded text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleUpdateItem(feed.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-center font-semibold text-gray-500 text-xs">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-800 text-xs">
                          {feed.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-xs">
                          ৳{feed.tp_per_kg.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingId(feed.id);
                                setNameInput(feed.name);
                                setPriceInput(feed.tp_per_kg.toString());
                              }}
                              className="text-gray-400 hover:text-emerald-700 p-0.5"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(feed.id)}
                              className="text-gray-400 hover:text-rose-600 p-0.5"
                              title="Delete"
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
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg text-xs hover:bg-emerald-700 transition flex items-center justify-center space-x-1.5 mt-2"
      >
        <ArrowLeft size={14} />
        <span>Back to Calculator</span>
      </button>
    </div>
  );
}