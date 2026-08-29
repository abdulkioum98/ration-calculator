import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';

export interface DmReferenceItem {
  id: string;
  stage_key: string;
  stage_name: string;
  target_group: 'dairy' | 'heifer' | 'fattening';
  concentrate_ratio: number;
  fodder_ratio: number;
  min_days?: number | null;
  max_days?: number | null;
  min_months?: number | null;
  max_months?: number | null;
}

interface DmReferencePageProps {
  onBack: () => void;
}

export default function DmReferencePage({ onBack }: DmReferencePageProps) {
  const [references, setReferences] = useState<DmReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReferences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dm_references')
      .select('*')
      .order('target_group', { ascending: true })
      .order('min_days', { ascending: true, nullsFirst: false })
      .order('min_months', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching DM references:', error);
    } else {
      setReferences(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const dairyItems = references.filter((r) => r.target_group === 'dairy');
  const heiferItems = references.filter((r) => r.target_group === 'heifer');
  const fatteningItems = references.filter((r) => r.target_group === 'fattening');

  const renderReferenceList = (items: DmReferenceItem[]) => (
    <div className="divide-y divide-slate-100">
      {items.length === 0 ? (
        <div className="p-3 text-center text-xs text-slate-400">
          No records found.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
            <div className="space-y-0.5 pr-2">
              <p className="font-semibold text-slate-800">{item.stage_name}</p>
              <p className="text-[10px] text-slate-400">
                {item.min_days !== undefined && item.min_days !== null
                  ? `Days: ${item.min_days} - ${item.max_days} d`
                  : item.min_months !== undefined && item.min_months !== null
                  ? `Age: ${item.min_months}${item.max_months ? ` - ${item.max_months}` : '+'} Months`
                  : ''}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200/50">
                {item.concentrate_ratio} : {item.fodder_ratio}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-[85vh] p-3 sm:p-4 rounded-2xl shadow-xs border border-slate-200 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-100/70 text-emerald-800 rounded-lg">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-none">DM Ratio References</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Concentrate vs Fodder Standard Ratios</p>
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

      {loading ? (
        <div className="p-8 flex justify-center items-center text-emerald-700 space-x-2 bg-white rounded-xl">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-xs font-medium">Loading references...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dairy Cows Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-emerald-800 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wide">
              Dairy Cow Stages (Lactation Days)
            </div>
            {renderReferenceList(dairyItems)}
          </div>

          {/* Heifer Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-slate-800 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wide">
              Heifer Stages
            </div>
            {renderReferenceList(heiferItems)}
          </div>

          {/* Fattening Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="bg-amber-800 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wide">
              Fattening Animals
            </div>
            {renderReferenceList(fatteningItems)}
          </div>
        </div>
      )}

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