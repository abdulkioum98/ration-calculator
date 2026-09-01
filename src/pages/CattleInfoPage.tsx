import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

export interface CowData {
  category: 'dairy';
  breedType?: string;
  ageMonths?: string;
  weight: string;
  cowType?: 'lactating' | 'dry' | 'heifer';
  lactationNo?: string;
  ageLactation?: string;
  milkYield?: string;
  nourishFeedName?: string;
}

interface CattleInfoPageProps {
  onSaveAndNext: (data: CowData) => void;
  initialData?: CowData | null;
}

interface FeedOption {
  id: string;
  name: string;
}

interface BreedOption {
  id: string;
  name: string;
}

export default function CattleInfoPage({ onSaveAndNext, initialData }: CattleInfoPageProps) {
  // Dairy Specific Fields
  const [breedType, setBreedType] = useState<string>(initialData?.breedType || '');
  const [ageMonths, setAgeMonths] = useState<string>(initialData?.ageMonths || '');
  const [weight, setWeight] = useState<string>(initialData?.weight || '');
  const [cowType, setCowType] = useState<'lactating' | 'dry' | 'heifer'>(
    initialData?.cowType || 'lactating'
  );
  const [lactationNo, setLactationNo] = useState<string>(initialData?.lactationNo || '');
  const [ageLactation, setAgeLactation] = useState<string>(initialData?.ageLactation || '');
  const [milkYield, setMilkYield] = useState<string>(initialData?.milkYield || '');

  // Feed & Breed State
  const [nourishFeedName, setNourishFeedName] = useState<string>(initialData?.nourishFeedName || '');
  const [feedList, setFeedList] = useState<FeedOption[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState<boolean>(false);

  const [breedList, setBreedList] = useState<BreedOption[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState<boolean>(false);

  // Fetch Dairy feeds & Breeds from Supabase
  useEffect(() => {
    fetchDairyFeeds();
    fetchDairyBreeds();
  }, []);

  const fetchDairyFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const { data, error } = await supabase
        .from('nourish_feeds')
        .select('id, name')
        .ilike('category', 'dairy');

      if (error) throw error;
      setFeedList(data || []);
    } catch (err) {
      console.error('Error fetching Dairy feeds:', err);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const fetchDairyBreeds = async () => {
    setLoadingBreeds(true);
    try {
      const { data, error } = await supabase
        .from('breeds')
        .select('id, name')
        .ilike('category', 'dairy')
        .order('name', { ascending: true });

      if (error) throw error;
      setBreedList(data || []);
    } catch (err) {
      console.error('Error fetching Dairy breeds:', err);
    } finally {
      setLoadingBreeds(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return alert('Please enter Present Body Weight!');

    if (cowType === 'lactating') {
      if (!ageLactation) return alert('Please enter Age of Lactation (Months)!');
      if (!milkYield) return alert('Please enter Daily Milk Yield!');
    }

    onSaveAndNext({
      category: 'dairy',
      breedType,
      ageMonths,
      weight,
      cowType,
      lactationNo: cowType === 'lactating' ? lactationNo : '0',
      ageLactation: cowType === 'lactating' ? ageLactation : '0',
      milkYield: cowType === 'lactating' ? milkYield : '0',
      nourishFeedName,
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 border-b pb-3 mb-5">
          Dairy Cow Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* GENERAL INFO SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BREEDS DROPDOWN */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Breed Type
              </label>
              <div className="relative">
                <select
                  value={breedType}
                  onChange={(e) => setBreedType(e.target.value)}
                  disabled={loadingBreeds}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">-- Select Breed --</option>
                  {breedList.map((breed) => (
                    <option key={breed.id} value={breed.name}>
                      {breed.name}
                    </option>
                  ))}
                </select>
                {loadingBreeds && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="animate-spin text-slate-400" size={16} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Age of Cow (Months)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 36"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Present Body Weight */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Present Body Weight (Kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 350"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>

          {/* COW TYPE DROPDOWN */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Cow Type / Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={cowType}
              onChange={(e) => setCowType(e.target.value as 'lactating' | 'dry' | 'heifer')}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold bg-white cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            >
              <option value="lactating">Lactating Cow</option>
              <option value="dry">Dry Cow</option>
              <option value="heifer">Growing Heifer</option>
            </select>
          </div>

          {/* DYNAMIC LACTATION FIELDS */}
          {cowType === 'lactating' && (
            <div className="space-y-4 bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Lactation Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={lactationNo}
                    onChange={(e) => setLactationNo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Age of Lactation (Months) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={ageLactation}
                    onChange={(e) => setAgeLactation(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Daily Milk Yield (Liters/Kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 12"
                  value={milkYield}
                  onChange={(e) => setMilkYield(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* NOURISH FEED DROPDOWN */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Name of Nourish Feed (Dairy)
            </label>
            <div className="relative">
              <select
                value={nourishFeedName}
                onChange={(e) => setNourishFeedName(e.target.value)}
                disabled={loadingFeeds}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
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

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Calculate Ration</span>
            <span className="text-lg">&rarr;</span>
          </button>
        </form>
      </div>
    </div>
  );
}