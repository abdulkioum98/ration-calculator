import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

export interface FatteningCowData {
  category: 'fattening';
  breedType?: string;
  ageMonths: string;
  weight: string;
  targetWeightGain: string; // Body Weight Gain/Day (gm)
  nourishFeedName?: string;
}

interface CalculatorFatteningProps {
  onSaveAndNext: (data: FatteningCowData) => void;
  initialData?: FatteningCowData | null;
}

interface FeedOption {
  id: string;
  name: string;
}

export default function CalculatorFattening({ onSaveAndNext, initialData }: CalculatorFatteningProps) {
  const [breedType, setBreedType] = useState<string>(initialData?.breedType || '');
  const [ageMonths, setAgeMonths] = useState<string>(initialData?.ageMonths || '');
  const [weight, setWeight] = useState<string>(initialData?.weight || '');
  const [targetWeightGain, setTargetWeightGain] = useState<string>(initialData?.targetWeightGain || '');
  
  const [nourishFeedName, setNourishFeedName] = useState<string>(initialData?.nourishFeedName || '');
  const [feedList, setFeedList] = useState<FeedOption[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState<boolean>(false);

  // Load only Fattening Feeds from Supabase
  useEffect(() => {
    fetchFatteningFeeds();
  }, []);

  const fetchFatteningFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const { data, error } = await supabase
        .from('nourish_feeds')
        .select('id, name')
        .ilike('category', 'fattening');

      if (error) throw error;
      setFeedList(data || []);
    } catch (err) {
      console.error('Error fetching Fattening feeds:', err);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageMonths) return alert('Please enter Age of Cattle (Months)!');
    if (!weight) return alert('Please enter Present Body Weight!');
    if (!targetWeightGain) return alert('Please enter Body Weight Gain/Day (gm)!');

    onSaveAndNext({
      category: 'fattening',
      breedType,
      ageMonths,
      weight,
      targetWeightGain,
      nourishFeedName,
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b pb-3 mb-5">
          Fattening Cattle Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Breed Type
              </label>
              <input
                type="text"
                placeholder="e.g. Sahiwal / Local Cross"
                value={breedType}
                onChange={(e) => setBreedType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Age of Cattle (Months) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 24"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Present Body Weight (Kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 250"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Body Weight Gain/Day (gm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 750"
                value={targetWeightGain}
                onChange={(e) => setTargetWeightGain(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* NOURISH FEED DROPDOWN */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Name of Nourish Feed (Fattening)
            </label>
            <div className="relative">
              <select
                value={nourishFeedName}
                onChange={(e) => setNourishFeedName(e.target.value)}
                disabled={loadingFeeds}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100"
              >
                <option value="">-- Select Nourish Feed --</option>
                {feedList.map((feed) => (
                  <option key={feed.id} value={feed.name}>
                    {feed.name}
                  </option>
                ))}
              </select>
              {loadingFeeds && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="animate-spin text-slate-400" size={16} />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg shadow-md transition-all text-sm sm:text-base"
          >
            Calculate Fattening Ration &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}