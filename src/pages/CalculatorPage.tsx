import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { CowData } from './CattleInfoPage';

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

interface CalculatorPageProps {
  cowData?: CowData | null;
  onEditCowInfo?: () => void;
}

export default function CalculatorPage({ cowData, onEditCowInfo }: CalculatorPageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [nutrientList, setNutrientList] = useState<FeedNutrientItem[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchCalculatorData();
  }, []);

  const fetchCalculatorData = async () => {
    setLoading(true);
    try {
      const { data: priceData, error: priceError } = await supabase
        .from('price_list')
        .select('*')
        .ilike('category', 'dairy');

      const { data: nutrientData, error: nutrientError } = await supabase
        .from('feed_nutrients')
        .select('id, name, dm_percent, cp_percent, me_energy, category, feed_type')
        .ilike('category', 'dairy');

      if (priceError) throw priceError;
      if (nutrientError) throw nutrientError;

      const sortNourishFirst = <T extends { name: string }>(list: T[]) => {
        return [...list].sort((a, b) => {
          const aIsNourish = a.name.toLowerCase().includes('nourish');
          const bIsNourish = b.name.toLowerCase().includes('nourish');
          if (aIsNourish && !bIsNourish) return -1;
          if (!aIsNourish && bIsNourish) return 1;
          return 0;
        });
      };

      setPriceList(sortNourishFirst(priceData || []));
      setNutrientList(sortNourishFirst(nutrientData || []));
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

  const isItemSelected = (name: string): boolean => {
    const item = priceList.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    return item ? (quantities[item.id] || 0) > 0 : false;
  };

  const cowType = cowData?.cowType || 'lactating';
  const bodyWeight = parseFloat(cowData?.weight || '0');
  const breedType = cowData?.breedType;
  const ageMonths = cowData?.ageMonths;
  const nourishFeedName = cowData?.nourishFeedName;
  
  const milkYield = cowType === 'lactating' ? parseFloat(cowData?.milkYield || '0') : 0;
  const ageLactationMonths = cowType === 'lactating' ? parseFloat(cowData?.ageLactation || '0') : 0;

  let stageName = 'Mid Lactation';
  let targetConcentratePct = 50;
  let targetFodderPct = 50;

  if (cowType === 'dry') {
    stageName = 'Dry Cow';
    targetConcentratePct = 30;
    targetFodderPct = 70;
  } else if (cowType === 'heifer') {
    stageName = 'Growing Heifer';
    targetConcentratePct = 50;
    targetFodderPct = 50;
  } else {
    const days = ageLactationMonths * 30;
    if (days <= 90) {
      targetConcentratePct = 60;
      targetFodderPct = 40;
      stageName = 'Early Lactation (0-90 d)';
    } else if (days <= 200) {
      targetConcentratePct = 50;
      targetFodderPct = 50;
      stageName = 'Mid Lactation (91-200 d)';
    } else {
      targetConcentratePct = 30;
      targetFodderPct = 70;
      stageName = 'Late Lactation (201-305 d)';
    }
  }

  const getQtyByName = (name: string): number => {
    const item = priceList.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    return item ? quantities[item.id] || 0 : 0;
  };

  const getItemDMKg = (item: FeedNutrientItem): number => (getQtyByName(item.name) * (item.dm_percent || 0)) / 100;
  const getItemCPKg = (item: FeedNutrientItem): number => (getQtyByName(item.name) * (item.cp_percent || 0)) / 100;
  const getItemEnergyMJ = (item: FeedNutrientItem): number => getQtyByName(item.name) * (item.me_energy || 0);

  const nutrientConcentrates = nutrientList.filter((item) => item.feed_type?.toLowerCase() === 'concentrate');
  const nutrientFodders = nutrientList.filter((item) => item.feed_type?.toLowerCase() === 'fodder');

  const dmConcentrateTotal = nutrientConcentrates.reduce((acc, item) => acc + getItemDMKg(item), 0);
  const dmFodderTotal = nutrientFodders.reduce((acc, item) => acc + getItemDMKg(item), 0);
  const totalActualDM = dmConcentrateTotal + dmFodderTotal;

  const cpConcentrateTotal = nutrientConcentrates.reduce((acc, item) => acc + getItemCPKg(item), 0);
  const cpFodderTotal = nutrientFodders.reduce((acc, item) => acc + getItemCPKg(item), 0);
  const totalActualCP = cpConcentrateTotal + cpFodderTotal;

  const energyConcentrateTotal = nutrientConcentrates.reduce((acc, item) => acc + getItemEnergyMJ(item), 0);
  const energyFodderTotal = nutrientFodders.reduce((acc, item) => acc + getItemEnergyMJ(item), 0);
  const totalActualEnergy = energyConcentrateTotal + energyFodderTotal;

  const costConcentrate = priceList
    .filter((p) => p.feed_type?.toLowerCase() === 'concentrate')
    .reduce((acc, p) => acc + (quantities[p.id] || 0) * (p.price_per_kg || 0), 0);

  const costFodder = priceList
    .filter((p) => p.feed_type?.toLowerCase() === 'fodder')
    .reduce((acc, p) => acc + (quantities[p.id] || 0) * (p.price_per_kg || 0), 0);

  const totalCost = costConcentrate + costFodder;

  const dmReq = (bodyWeight * 0.02) + (milkYield * 0.33);
  const cpReq = ((bodyWeight * 1) + (milkYield * 90)) / 1000;
  const energyReq = (bodyWeight * 0.10) + (milkYield * 6);

  const actualConcentrateRatioPct = totalActualDM > 0 ? Math.round((dmConcentrateTotal / totalActualDM) * 100) : 0;
  const actualFodderRatioPct = totalActualDM > 0 ? 100 - actualConcentrateRatioPct : 0;

  const concentrateDiff = actualConcentrateRatioPct - targetConcentratePct;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-700">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const priceConcentrates = priceList.filter((item) => item.feed_type?.toLowerCase() === 'concentrate');
  const priceFodders = priceList.filter((item) => item.feed_type?.toLowerCase() === 'fodder');

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      
      {/* BANNER */}
      <div className="bg-emerald-50/60 rounded-xl p-3.5 sm:p-4 shadow-xs border border-emerald-200/80 flex justify-between items-center gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px] sm:text-xs uppercase tracking-wide">
              {cowType}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {stageName}
            </span>
            {breedType && (
              <span className="bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[10px] sm:text-xs border border-emerald-300">
                {breedType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-x-3 gap-y-1 text-slate-700 text-[11px] sm:text-xs flex-wrap font-semibold">
            <span><b>Weight:</b> {bodyWeight || 0} kg</span>
            
            {ageMonths && (
              <>
                <span className="text-slate-300">•</span>
                <span><b>Age:</b> {ageMonths}m</span>
              </>
            )}

            {cowType === 'lactating' && (
              <>
                <span className="text-slate-300">•</span>
                <span><b>Milk:</b> {milkYield || 0} L</span>
                <span className="text-slate-300">•</span>
                <span><b>Lact. No:</b> {cowData?.lactationNo || '-'}</span>
                <span className="text-slate-300">•</span>
                <span><b>Lact. Age:</b> {ageLactationMonths || 0}m</span>
              </>
            )}

            {nourishFeedName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-800"><b>Feed:</b> {nourishFeedName}</span>
              </>
            )}
          </div>
        </div>

        {onEditCowInfo && (
          <button
            onClick={onEditCowInfo}
            className="bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Edit3 size={13} className="text-emerald-700" />
            <span className="hidden sm:inline">Edit Info</span>
          </button>
        )}
      </div>

      {/* TOP TABLES */}
      <div className="flex flex-row gap-1.5 sm:gap-4 items-start w-full">
        
        {/* Left Input Table */}
        <div className="flex-[60] min-w-0 bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-emerald-800 text-white p-2 font-semibold text-xs sm:text-sm md:text-base">
            Input Quantity
          </div>

          <div className="w-full">
            <table className="w-full text-[10px] sm:text-xs md:text-sm text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-1 sm:p-2 border">Item</th>
                  <th className="p-1 sm:p-2 border text-center w-7 sm:w-12">TK</th>
                  <th className="p-1 sm:p-2 border text-center w-16 sm:w-24">Qty (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b font-bold text-amber-900 text-[10px] sm:text-xs md:text-sm">
                  <td colSpan={3} className="p-2 sm:p-2.5">Concentrate</td>
                </tr>
                {priceConcentrates.map((item) => {
                  const isSelected = (quantities[item.id] || 0) > 0;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${isSelected ? 'bg-emerald-100/70 border-l-4 border-l-emerald-600 font-semibold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-1 sm:p-2 border font-medium text-slate-800 break-words leading-tight">
                        {item.name}
                      </td>
                      <td className="p-1 sm:p-2 border text-center">{item.price_per_kg}</td>
                      <td className="p-0.5 sm:p-1 border text-center">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={quantities[item.id] !== undefined && quantities[item.id] !== 0 ? quantities[item.id] : ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className={`w-full border rounded p-1 text-center border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-xs sm:text-sm md:text-base ${
                            isSelected ? 'bg-emerald-50 text-emerald-900 border-emerald-400' : 'bg-white text-emerald-800'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}

                <tr className="border-b font-bold text-emerald-900 text-[10px] sm:text-xs md:text-sm">
                  <td colSpan={3} className="p-2 sm:p-2.5 pt-3">Fodder</td>
                </tr>
                {priceFodders.map((item) => {
                  const isSelected = (quantities[item.id] || 0) > 0;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${isSelected ? 'bg-emerald-100/70 border-l-4 border-l-emerald-600 font-semibold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-1 sm:p-2 border font-medium text-slate-800 break-words leading-tight">
                        {item.name}
                      </td>
                      <td className="p-1 sm:p-2 border text-center">{item.price_per_kg}</td>
                      <td className="p-0.5 sm:p-1 border text-center">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={quantities[item.id] !== undefined && quantities[item.id] !== 0 ? quantities[item.id] : ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className={`w-full border rounded p-1 text-center border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-xs sm:text-sm md:text-base ${
                            isSelected ? 'bg-emerald-50 text-emerald-900 border-emerald-400' : 'bg-white text-emerald-800'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* RATIO BREAKDOWN & UPDATED CLEAN SUGGESTION */}
          <div className="p-2 sm:p-2.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-[10px] sm:text-xs md:text-sm">
            <div className="font-bold text-slate-800 border-b border-slate-200 pb-0.5">
              DM Ratio Breakdown (Conc : Fodder)
            </div>
            
            <div className="flex justify-between items-center text-slate-700 flex-wrap gap-1">
              <span>Actual:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                {actualConcentrateRatioPct} : {actualFodderRatioPct}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 flex-wrap gap-1">
              <span className="shrink-0">Target ({stageName}):</span>
              <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                {targetConcentratePct} : {targetFodderPct}
              </span>
            </div>

            {/* Clean Ratio Suggestion Text (Without heavy background) */}
            {totalActualDM > 0 && Math.abs(concentrateDiff) > 2 && (
              <div className="pt-1 flex items-center gap-1.5 text-slate-800 font-semibold text-[11px] sm:text-xs leading-snug">
                <AlertCircle size={15} className="shrink-0 text-amber-600" />
                <div>
                  {concentrateDiff < 0 ? (
                    <span>
                      Need Concentrate <b className="text-emerald-700 text-xs sm:text-sm font-extrabold">(+{Math.abs(concentrateDiff)}%)</b> | Need Fodder <b className="text-rose-600 text-xs sm:text-sm font-extrabold">(-{Math.abs(concentrateDiff)}%)</b>
                    </span>
                  ) : (
                    <span>
                      Need Concentrate <b className="text-rose-600 text-xs sm:text-sm font-extrabold">(-{Math.abs(concentrateDiff)}%)</b> | Need Fodder <b className="text-emerald-700 text-xs sm:text-sm font-extrabold">(+{Math.abs(concentrateDiff)}%)</b>
                    </span>
                  )}
                </div>
              </div>
            )}
            {totalActualDM > 0 && Math.abs(concentrateDiff) <= 2 && (
              <div className="pt-1 flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] sm:text-xs">
                <AlertCircle size={15} className="shrink-0 text-emerald-600" />
                <span>Balanced Ratio!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Table */}
        <div className="flex-[40] min-w-0 bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white p-2 font-semibold text-xs sm:text-sm md:text-base">
            Calculation
          </div>

          <div className="w-full">
            <table className="w-full text-[9px] sm:text-xs md:text-sm text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-1 sm:p-2 border">Parameters</th>
                  <th className="p-1 sm:p-2 border text-center w-10 sm:w-16">Qty</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. UPDATED BACKGROUND COLOR FOR DRY MATTER HEADER */}
                <tr className="bg-slate-200 font-extrabold text-slate-800 text-[8px] sm:text-[10px] md:text-xs border-b border-slate-300">
                  <td colSpan={2} className="p-1 sm:p-1.5 border">Dry Matter (DM)</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">DM Required (kg)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50">{dmReq.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">DM Actual (kg)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50 text-emerald-700">{totalActualDM.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">DM Difference (kg)</td>
                  <td className={`p-1 sm:p-1.5 border text-center font-bold bg-slate-50 ${totalActualDM - dmReq < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualDM - dmReq).toFixed(1)}
                  </td>
                </tr>

                <tr className="bg-blue-100 font-bold text-blue-900 text-[8px] sm:text-[10px] md:text-xs">
                  <td colSpan={2} className="p-0.5 sm:p-1 border">Crude Protein (CP)</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">CP Required (kg)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50">{cpReq.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">CP Actual (kg)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50 text-blue-700">{totalActualCP.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">CP Difference (kg)</td>
                  <td className={`p-1 sm:p-1.5 border text-center font-bold bg-slate-50 ${totalActualCP - cpReq < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualCP - cpReq).toFixed(1)}
                  </td>
                </tr>

                <tr className="bg-purple-100 font-bold text-purple-900 text-[8px] sm:text-[10px] md:text-xs">
                  <td colSpan={2} className="p-0.5 sm:p-1 border">Energy (MJ)</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">Energy Required (MJ)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50">{energyReq.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">Energy Actual (MJ)</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-slate-50 text-purple-700">{totalActualEnergy.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">Energy Difference (MJ)</td>
                  <td className={`p-1 sm:p-1.5 border text-center font-bold bg-slate-50 ${totalActualEnergy - energyReq < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {(totalActualEnergy - energyReq).toFixed(1)}
                  </td>
                </tr>

                <tr className="bg-amber-100 font-bold text-amber-900 text-[8px] sm:text-[10px] md:text-xs">
                  <td colSpan={2} className="p-0.5 sm:p-1 border">Cost Breakdown</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">Concentrate Cost</td>
                  <td className="p-1 sm:p-1.5 border text-center font-medium bg-slate-50">৳{costConcentrate.toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="p-1 sm:p-1.5 border text-slate-700 break-words leading-tight">Fodder Cost</td>
                  <td className="p-1 sm:p-1.5 border text-center font-medium bg-slate-50">৳{costFodder.toFixed(0)}</td>
                </tr>
                <tr className="font-bold bg-slate-100">
                  <td className="p-1 sm:p-1.5 border text-slate-900 break-words leading-tight">Total Cost</td>
                  <td className="p-1 sm:p-1.5 border text-center font-bold bg-amber-200 text-amber-900">৳{totalCost.toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* LOWER TABLES - FIXED FULL ROW HIGHLIGHT ON SELECTION */}
      <div className="space-y-6 pt-2 w-full">
        
        {/* DM Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-emerald-700 text-white p-2 sm:p-2.5 font-semibold text-xs sm:text-sm md:text-base">
            DM of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs md:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 border">Feed Ingredients</th>
                  <th className="p-2 border text-center w-16 sm:w-24">DM (%)</th>
                  <th className="p-2 border text-center w-20 sm:w-28">Amount (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-extrabold text-amber-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 bg-slate-50">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.dm_percent}%
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-emerald-800'}`}>
                        {getItemDMKg(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Concentrate DM:</td>
                  <td className="p-2 border text-center font-bold">{dmConcentrateTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 pt-3 bg-slate-50">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.dm_percent}%
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-emerald-800'}`}>
                        {getItemDMKg(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Fodder DM:</td>
                  <td className="p-2 border text-center font-bold">{dmFodderTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2 border text-right">Total DM (Kg):</td>
                  <td className="p-2 border text-center font-black text-emerald-800">{totalActualDM.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CP Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-blue-700 text-white p-2 sm:p-2.5 font-semibold text-xs sm:text-sm md:text-base">
            CP of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs md:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 border">Feed Ingredients</th>
                  <th className="p-2 border text-center w-16 sm:w-24">CP (%)</th>
                  <th className="p-2 border text-center w-20 sm:w-28">Amount (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-extrabold text-amber-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 bg-slate-50">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.cp_percent}%
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-blue-800'}`}>
                        {getItemCPKg(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Concentrate CP:</td>
                  <td className="p-2 border text-center font-bold">{cpConcentrateTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 pt-3 bg-slate-50">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.cp_percent}%
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-blue-800'}`}>
                        {getItemCPKg(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Fodder CP:</td>
                  <td className="p-2 border text-center font-bold">{cpFodderTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2 border text-right">Total CP (Kg):</td>
                  <td className="p-2 border text-center font-black text-blue-800">{totalActualCP.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Energy Table */}
        <div className="w-full bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-purple-700 text-white p-2 sm:p-2.5 font-semibold text-xs sm:text-sm md:text-base">
            Energy of Feed
          </div>
          <div className="w-full">
            <table className="w-full text-xs md:text-sm text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 border">Feed Ingredients</th>
                  <th className="p-2 border text-center w-16 sm:w-28">MJ/kg</th>
                  <th className="p-2 border text-center w-20 sm:w-28">Amount (MJ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-extrabold text-amber-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 bg-slate-50">Concentrate</td>
                </tr>
                {nutrientConcentrates.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.me_energy}
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-purple-800'}`}>
                        {getItemEnergyMJ(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Concentrate Energy:</td>
                  <td className="p-2 border text-center font-bold">{energyConcentrateTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                  <td colSpan={3} className="p-2 pt-3 bg-slate-50">Fodder</td>
                </tr>
                {nutrientFodders.map((item) => {
                  const selected = isItemSelected(item.name);
                  const selectedCellClass = selected ? 'bg-emerald-100/80 font-semibold text-emerald-950' : 'hover:bg-slate-50';
                  return (
                    <tr key={item.id}>
                      <td className={`p-2 border font-medium ${selectedCellClass} ${selected ? 'border-l-4 border-l-emerald-600' : ''}`}>
                        {item.name}
                      </td>
                      <td className={`p-2 border text-center ${selectedCellClass}`}>
                        {item.me_energy}
                      </td>
                      <td className={`p-2 border text-center font-bold ${selected ? 'bg-emerald-200/80 text-emerald-950' : 'bg-slate-50 text-purple-800'}`}>
                        {getItemEnergyMJ(item).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold text-slate-800">
                  <td colSpan={2} className="p-2 border text-right">Total Fodder Energy:</td>
                  <td className="p-2 border text-center font-bold">{energyFodderTotal.toFixed(2)}</td>
                </tr>

                <tr className="font-extrabold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2 border text-right">Total Energy (MJ):</td>
                  <td className="p-2 border text-center font-black text-purple-800">{totalActualEnergy.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}