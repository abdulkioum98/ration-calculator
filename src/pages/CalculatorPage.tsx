import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

// Interfaces matching exact Supabase schemas
interface PriceListItem {
  id: string;
  name: string;
  price_per_kg: number;
  feed_type: string;
  category: string;
}

interface FeedNutrientItem {
  id: string;
  name: string;
  category: string;
  feed_type: string;
  dm_percent: number;
  cp_percent: number;
  me_energy: number;
}

export default function CalculatorPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [nutrientList, setNutrientList] = useState<FeedNutrientItem[]>([]);
  
  // State for feed quantities (Key: item.id, Value: quantity in kg)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Requirements
  const [requirements] = useState({
    dm: 10.0,
    cp: 1.5,
    energy: 90.0
  });

  useEffect(() => {
    fetchCalculatorData();
  }, []);

  const fetchCalculatorData = async () => {
    setLoading(true);
    try {
      // Fetch price list (Only dairy category)
      const { data: priceData, error: priceError } = await supabase
        .from('price_list')
        .select('*')
        .ilike('category', 'dairy');

      // Fetch nutrients from feed_nutrients (Only dairy category)
      const { data: nutrientData, error: nutrientError } = await supabase
        .from('feed_nutrients')
        .select('id, name, dm_percent, cp_percent, me_energy, category, feed_type')
        .ilike('category', 'dairy');

      if (priceError) throw priceError;
      if (nutrientError) throw nutrientError;

      setPriceList(priceData || []);
      setNutrientList(nutrientData || []);
    } catch (err) {
      console.error('Error fetching calculator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  // --- HELPER CALCULATIONS ---

  const getQtyByName = (name: string): number => {
    const item = priceList.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    return item ? (quantities[item.id] || 0) : 0;
  };

  const getItemDMKg = (item: FeedNutrientItem): number => {
    const qty = getQtyByName(item.name);
    return (qty * (item.dm_percent || 0)) / 100;
  };

  const getItemCPKg = (item: FeedNutrientItem): number => {
    const dmKg = getItemDMKg(item);
    return (dmKg * (item.cp_percent || 0)) / 100;
  };

  const getItemEnergyMJ = (item: FeedNutrientItem): number => {
    const dmKg = getItemDMKg(item);
    return dmKg * (item.me_energy || 0);
  };

  // --- TOTALS CALCULATIONS ---

  const totalActualDM = nutrientList.reduce((acc, item) => acc + getItemDMKg(item), 0);
  const totalActualCP = nutrientList.reduce((acc, item) => acc + getItemCPKg(item), 0);
  const totalActualEnergy = nutrientList.reduce((acc, item) => acc + getItemEnergyMJ(item), 0);

  const costConcentrate = priceList
    .filter((p) => p.feed_type?.toLowerCase() === 'concentrate')
    .reduce((acc, p) => acc + (quantities[p.id] || 0) * (p.price_per_kg || 0), 0);

  const costFodder = priceList
    .filter((p) => p.feed_type?.toLowerCase() === 'fodder')
    .reduce((acc, p) => acc + (quantities[p.id] || 0) * (p.price_per_kg || 0), 0);

  const totalCost = costConcentrate + costFodder;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-700">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Safe Case-Insensitive Filtering for Feed Types
  const priceConcentrates = priceList.filter((item) => item.feed_type?.toLowerCase() === 'concentrate');
  const priceFodders = priceList.filter((item) => item.feed_type?.toLowerCase() === 'fodder');

  const nutrientConcentrates = nutrientList.filter((item) => item.feed_type?.toLowerCase() === 'concentrate');
  const nutrientFodders = nutrientList.filter((item) => item.feed_type?.toLowerCase() === 'fodder');

  return (
    <div className="w-full p-2 sm:p-4 lg:p-6 space-y-6">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 border-b pb-2">
        Ration Calculator (Dairy)
      </h2>

      {/* TOP SECTION: ALWAYS SIDE BY SIDE ON MOBILE & DESKTOP */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 items-start w-full">
        
        {/* 1. Input Quantity Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-emerald-800 text-white p-2 sm:p-3 font-semibold text-xs sm:text-sm lg:text-base">
            Input Quantity
          </div>

          <div className="w-full">
            <table className="w-full text-[11px] sm:text-xs lg:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-1.5 sm:p-2 lg:p-3 border">Feed</th>
                  <th className="p-1.5 sm:p-2 lg:p-3 border text-center w-12 sm:w-20 lg:w-24">TK/kg</th>
                  <th className="p-1.5 sm:p-2 lg:p-3 border text-center w-14 sm:w-24 lg:w-28">Qty (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50 font-bold text-amber-900">
                  <td colSpan={3} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">Concentrate (দানাদার)</td>
                </tr>
                {priceConcentrates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-1.5 sm:p-2 lg:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-1.5 sm:p-2 lg:p-3 border text-center">{item.price_per_kg}</td>
                    <td className="p-1 sm:p-1.5 border text-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[item.id] !== undefined && quantities[item.id] !== 0 ? quantities[item.id] : ''}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-full border rounded p-1 text-center bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-emerald-800 text-[11px] sm:text-xs lg:text-sm"
                      />
                    </td>
                  </tr>
                ))}

                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td colSpan={3} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">Fodder (কাঁচা ঘাস/খড়)</td>
                </tr>
                {priceFodders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-1.5 sm:p-2 lg:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-1.5 sm:p-2 lg:p-3 border text-center">{item.price_per_kg}</td>
                    <td className="p-1 sm:p-1.5 border text-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[item.id] !== undefined && quantities[item.id] !== 0 ? quantities[item.id] : ''}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-full border rounded p-1 text-center bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-emerald-800 text-[11px] sm:text-xs lg:text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Calculation Summary Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white p-2 sm:p-3 font-semibold text-xs sm:text-sm lg:text-base">
            Summary
          </div>

          <div className="w-full">
            <table className="w-full text-[11px] sm:text-xs lg:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-1.5 sm:p-2 lg:p-3 border">Parameter</th>
                  <th className="p-1.5 sm:p-2 lg:p-3 border text-center w-14 sm:w-24 lg:w-28">Qty</th>
                </tr>
              </thead>
              <tbody>
                {/* DM Calculation */}
                <tr className="bg-emerald-100 font-bold text-emerald-900">
                  <td colSpan={2} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">DM Calculation</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">DM Req (Kg)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-medium bg-slate-50">{requirements.dm.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">DM Actual (Kg)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 text-emerald-700">{totalActualDM.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">DM Diff (Kg)</td>
                  <td className={`p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 ${totalActualDM - requirements.dm < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualDM - requirements.dm).toFixed(2)}
                  </td>
                </tr>

                {/* CP Calculation */}
                <tr className="bg-blue-100 font-bold text-blue-900">
                  <td colSpan={2} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">CP Calculation</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">CP Req (Kg)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-medium bg-slate-50">{requirements.cp.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">CP Actual (Kg)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 text-blue-700">{totalActualCP.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">CP Diff (Kg)</td>
                  <td className={`p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 ${totalActualCP - requirements.cp < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualCP - requirements.cp).toFixed(2)}
                  </td>
                </tr>

                {/* Energy Calculation */}
                <tr className="bg-purple-100 font-bold text-purple-900">
                  <td colSpan={2} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">Energy Calculation</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">Energy Req (MJ)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-medium bg-slate-50">{requirements.energy.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">Energy Actual (MJ)</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 text-purple-700">{totalActualEnergy.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">Energy Diff (MJ)</td>
                  <td className={`p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-slate-50 ${totalActualEnergy - requirements.energy < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualEnergy - requirements.energy).toFixed(2)}
                  </td>
                </tr>

                {/* Cost Calculation */}
                <tr className="bg-amber-100 font-bold text-amber-900">
                  <td colSpan={2} className="p-1 sm:p-2 border text-[10px] sm:text-xs lg:text-sm">Cost Calculation</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">Concentrate Cost</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-medium bg-slate-50">৳{costConcentrate.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-700">Fodder Cost</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-medium bg-slate-50">৳{costFodder.toFixed(2)}</td>
                </tr>
                <tr className="font-bold bg-slate-100">
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-slate-900">Total Cost</td>
                  <td className="p-1.5 sm:p-2 lg:p-3 border text-center font-bold bg-amber-200 text-amber-900">৳{totalCost.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: NUTRIENT TABLES */}
      <div className="space-y-6 pt-2 w-full">
        
        {/* DM Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-emerald-700 text-white p-2.5 sm:p-3 font-semibold text-xs sm:text-sm lg:text-base">
            DM of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs sm:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 sm:p-3 border">Feed Ingredients</th>
                  <th className="p-2 sm:p-3 border text-center w-24 sm:w-36">DM (%)</th>
                  <th className="p-2 sm:p-3 border text-center w-28 sm:w-40">DM Amount (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50 font-bold text-amber-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.dm_percent}%</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-emerald-800 bg-slate-50">
                      {getItemDMKg(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.dm_percent}%</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-emerald-800 bg-slate-50">
                      {getItemDMKg(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-100 font-bold text-emerald-900">
                  <td colSpan={2} className="p-2 sm:p-3 border text-right">Total DM (Kg):</td>
                  <td className="p-2 sm:p-3 border text-center font-black bg-emerald-200">{totalActualDM.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CP Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-blue-700 text-white p-2.5 sm:p-3 font-semibold text-xs sm:text-sm lg:text-base">
            CP of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs sm:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 sm:p-3 border">Feed Ingredients</th>
                  <th className="p-2 sm:p-3 border text-center w-24 sm:w-36">CP (%)</th>
                  <th className="p-2 sm:p-3 border text-center w-28 sm:w-40">CP Amount (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50 font-bold text-amber-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.cp_percent}%</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-blue-800 bg-slate-50">
                      {getItemCPKg(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.cp_percent}%</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-blue-800 bg-slate-50">
                      {getItemCPKg(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-100 font-bold text-blue-900">
                  <td colSpan={2} className="p-2 sm:p-3 border text-right">Total CP (Kg):</td>
                  <td className="p-2 sm:p-3 border text-center font-black bg-blue-200">{totalActualCP.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Energy Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-purple-700 text-white p-2.5 sm:p-3 font-semibold text-xs sm:text-sm lg:text-base">
            Energy of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs sm:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 sm:p-3 border">Feed Ingredients</th>
                  <th className="p-2 sm:p-3 border text-center w-28 sm:w-44">Energy (MJ/kg DM)</th>
                  <th className="p-2 sm:p-3 border text-center w-28 sm:w-40">Energy Amount (MJ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50 font-bold text-amber-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.me_energy}</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-purple-800 bg-slate-50">
                      {getItemEnergyMJ(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td colSpan={3} className="p-1.5 sm:p-2 border text-xs sm:text-sm">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 sm:p-3 border font-medium text-slate-800 break-words">{item.name}</td>
                    <td className="p-2 sm:p-3 border text-center">{item.me_energy}</td>
                    <td className="p-2 sm:p-3 border text-center font-bold text-purple-800 bg-slate-50">
                      {getItemEnergyMJ(item).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-purple-100 font-bold text-purple-900">
                  <td colSpan={2} className="p-2 sm:p-3 border text-right">Total Energy (MJ):</td>
                  <td className="p-2 sm:p-3 border text-center font-black bg-purple-200">{totalActualEnergy.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}