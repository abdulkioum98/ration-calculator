import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Wheat, Loader2 } from 'lucide-react';

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

  // Database count/fetch logic
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

  const filteredFeeds = feeds.filter((f) => f.category === activeTab);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 max-w-md mx-auto">
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

      {/* Segment Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('dairy')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
            activeTab === 'dairy' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600'
          }`}
        >
          Nourish Dairy Feed
        </button>
        <button
          onClick={() => setActiveTab('fattening')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
            activeTab === 'fattening' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600'
          }`}
        >
          Nourish Fattening Feed
        </button>
      </div>

      {/* Feed Table (Read-Only) */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-semibold">Loading feeds...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50 text-emerald-900 border-b border-gray-200 text-xs uppercase">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">SL</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-right">Price/kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-xs text-gray-400">
                    No feeds available in this category.
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((feed, index) => (
                  <tr key={feed.id} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 px-3 text-center font-semibold text-gray-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-800 text-xs">
                      {feed.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-xs">
                      ৳{feed.tp_per_kg.toFixed(2)}
                    </td>
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