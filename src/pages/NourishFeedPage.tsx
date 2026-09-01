import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Wheat, Loader2 } from 'lucide-react';

export interface FeedItem {
  id: string;
  name: string;
  price?: number;
  tp_per_kg?: number;
  price_per_kg?: number;
  dm?: number;
  cp?: number;
  me?: number;
  category?: 'dairy' | 'fattening' | string;
}

interface NourishFeedPageProps {
  onBack: () => void;
}

export default function NourishFeedPage({ onBack }: NourishFeedPageProps) {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'dairy' | 'fattening'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch nourish_feeds data from Supabase
  const fetchFeeds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nourish_feeds')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching nourish feeds:', error);
      alert('Failed to load feed items: ' + error.message);
    } else {
      setFeeds(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  // Filter items based on active tab (or show all if category is missing)
  const filteredFeeds = feeds.filter((f) => {
    if (activeTab === 'all') return true;
    if (!f.category) return true; // Category না থাকলে সব দেখাবে
    return f.category.toLowerCase() === activeTab;
  });

  // Helper function to safely get price value
  const getPrice = (feed: FeedItem) => {
    const val = feed.price ?? feed.tp_per_kg ?? feed.price_per_kg ?? 0;
    return Number(val).toFixed(2);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center space-x-2">
          <Wheat className="text-emerald-700" size={22} />
          <h2 className="text-lg font-bold text-emerald-800">Nourish Feeds Reference</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Segment Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-md transition ${
            activeTab === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Feeds ({feeds.length})
        </button>
        <button
          onClick={() => setActiveTab('dairy')}
          className={`flex-1 py-1.5 rounded-md transition ${
            activeTab === 'dairy' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dairy
        </button>
        <button
          onClick={() => setActiveTab('fattening')}
          className={`flex-1 py-1.5 rounded-md transition ${
            activeTab === 'fattening' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fattening
        </button>
      </div>

      {/* Feed Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-semibold">Loading feeds from Supabase...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50 text-emerald-900 border-b border-gray-200 uppercase font-bold">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">SL</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-2 text-center">DM (%)</th>
                <th className="py-2.5 px-2 text-center">CP (%)</th>
                <th className="py-2.5 px-2 text-center">ME</th>
                <th className="py-2.5 px-3 text-right">Price/kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFeeds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-gray-400">
                    No feeds available in this section.
                  </td>
                </tr>
              ) : (
                filteredFeeds.map((feed, index) => (
                  <tr key={feed.id || index} className="hover:bg-emerald-50/40 transition">
                    <td className="py-2.5 px-3 text-center font-semibold text-gray-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {feed.name}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-600 font-medium">
                      {feed.dm != null ? `${feed.dm}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-600 font-medium">
                      {feed.cp != null ? `${feed.cp}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-600 font-medium">
                      {feed.me != null ? feed.me : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      ৳{getPrice(feed)}
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
        className="w-full bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-xs hover:bg-emerald-800 transition flex items-center justify-center space-x-1.5 mt-2 shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Back to Main Menu</span>
      </button>
    </div>
  );
}