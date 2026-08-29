import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Lock, LogOut, Plus, Edit3, Trash2, Save, X, Loader2, 
  Tag, Wheat, FlaskConical, BookOpen, RefreshCw, ArrowLeft 
} from 'lucide-react';

// Props Type Definition
interface AdminPageProps {
  onBack?: () => void;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'price' | 'nourish' | 'nutrients' | 'dm'>('price');

  // Form Visibility State (Hidden by default)
  const [showForm, setShowForm] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [priceList, setPriceList] = useState<any[]>([]);
  const [nourishFeeds, setNourishFeeds] = useState<any[]>([]);
  const [nutrients, setNutrients] = useState<any[]>([]);
  const [dmReferences, setDmReferences] = useState<any[]>([]);

  // Editing ID Trackers
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields - Price List & Nutrients Shared/Specific
  const [itemName, setItemName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [feedType, setFeedType] = useState<'concentrate' | 'fodder'>('concentrate');
  const [category, setCategory] = useState<'dairy' | 'fattening'>('dairy');
  
  // Form Fields - Nutrients
  const [dmPercent, setDmPercent] = useState('');
  const [cpPercent, setCpPercent] = useState('');
  const [meEnergy, setMeEnergy] = useState('');

  // Form Fields - Nourish Feed
  const [tpPerKg, setTpPerKg] = useState('');

  // Form Fields - DM Reference
  const [stageName, setStageName] = useState('');
  const [targetGroup, setTargetGroup] = useState<'dairy' | 'heifer' | 'fattening'>('dairy');
  const [concentrateRatio, setConcentrateRatio] = useState('');
  const [fodderRatio, setFodderRatio] = useState('');
  const [minDays, setMinDays] = useState('');
  const [maxDays, setMaxDays] = useState('');
  const [minMonths, setMinMonths] = useState('');
  const [maxMonths, setMaxMonths] = useState('');

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_admin_logged_in');
    if (adminStatus === 'true') {
      setIsLoggedIn(true);
      fetchAllData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim());

      if (error) {
        setLoginError('Database Connection Error!');
      } else if (!data || data.length === 0) {
        setLoginError('Invalid Username or Password!');
      } else {
        localStorage.setItem('is_admin_logged_in', 'true');
        setIsLoggedIn(true);
        fetchAllData();
      }
    } catch (err) {
      setLoginError('Login failed. Try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    setIsLoggedIn(false);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPriceList(),
      fetchNourishFeeds(),
      fetchNutrients(),
      fetchDmReferences()
    ]);
    setLoading(false);
  };

  // Fetch Individual Tables
  const fetchPriceList = async () => {
    const { data } = await supabase.from('price_list').select('*').order('created_at', { ascending: true });
    setPriceList(data || []);
  };

  const fetchNourishFeeds = async () => {
    const { data } = await supabase.from('nourish_feeds').select('*').order('created_at', { ascending: true });
    setNourishFeeds(data || []);
  };

  const fetchNutrients = async () => {
    const { data } = await supabase.from('feed_nutrients').select('*').order('created_at', { ascending: true });
    setNutrients(data || []);
  };

  const fetchDmReferences = async () => {
    const { data } = await supabase.from('dm_references').select('*').order('target_group', { ascending: true });
    setDmReferences(data || []);
  };

  const resetForm = () => {
    setEditId(null);
    setShowForm(false);
    setItemName('');
    setPricePerKg('');
    setFeedType('concentrate');
    setCategory('dairy');
    setDmPercent('');
    setCpPercent('');
    setMeEnergy('');
    setTpPerKg('');
    setStageName('');
    setTargetGroup('dairy');
    setConcentrateRatio('');
    setFodderRatio('');
    setMinDays('');
    setMaxDays('');
    setMinMonths('');
    setMaxMonths('');
  };

  const handleTabChange = (tab: 'price' | 'nourish' | 'nutrients' | 'dm') => {
    setActiveTab(tab);
    resetForm();
  };

  // Delete Action
  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchAllData();
    else alert('Failed to delete item.');
  };

  // Submit Handlers
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: itemName,
      price_per_kg: parseFloat(pricePerKg),
      feed_type: feedType,
      category: category
    };

    if (editId) {
      await supabase.from('price_list').update(payload).eq('id', editId);
    } else {
      await supabase.from('price_list').insert([payload]);
    }
    resetForm();
    fetchPriceList();
    setSubmitting(false);
  };

  const handleNourishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: itemName,
      tp_per_kg: parseFloat(tpPerKg),
      category: category
    };

    if (editId) {
      await supabase.from('nourish_feeds').update(payload).eq('id', editId);
    } else {
      await supabase.from('nourish_feeds').insert([payload]);
    }
    resetForm();
    fetchNourishFeeds();
    setSubmitting(false);
  };

  const handleNutrientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: itemName,
      dm_percent: parseFloat(dmPercent),
      cp_percent: parseFloat(cpPercent),
      me_energy: parseFloat(meEnergy),
      feed_type: feedType,
      category: category
    };

    if (editId) {
      await supabase.from('feed_nutrients').update(payload).eq('id', editId);
    } else {
      await supabase.from('feed_nutrients').insert([payload]);
    }
    resetForm();
    fetchNutrients();
    setSubmitting(false);
  };

  const handleDmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      stage_key: stageName.toLowerCase().replace(/\s+/g, '_'),
      stage_name: stageName,
      target_group: targetGroup,
      concentrate_ratio: parseFloat(concentrateRatio),
      fodder_ratio: parseFloat(fodderRatio),
      min_days: minDays !== '' ? parseInt(minDays) : null,
      max_days: maxDays !== '' ? parseInt(maxDays) : null,
      min_months: minMonths !== '' ? parseInt(minMonths) : null,
      max_months: maxMonths !== '' ? parseInt(maxMonths) : null,
    };

    if (editId) {
      await supabase.from('dm_references').update(payload).eq('id', editId);
    } else {
      await supabase.from('dm_references').insert([payload]);
    }
    resetForm();
    fetchDmReferences();
    setSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 w-full max-w-sm space-y-4">
          <div className="text-center space-y-1">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Lock size={22} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Admin Login</h2>
            <p className="text-xs text-slate-500">Sign in to manage feed & price database</p>
          </div>

          {loginError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              disabled={authenticating}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center space-x-1"
            >
              {authenticating ? <Loader2 className="animate-spin" size={16} /> : <span>Login to Dashboard</span>}
            </button>
          </form>

          {onBack && (
            <button
              onClick={onBack}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Application</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[85vh] p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-4 max-w-2xl mx-auto text-xs">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 leading-none">Admin Control Panel</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Manage All 4 Page Databases Centrally</p>
        </div>
        <div className="flex items-center space-x-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          )}
          <button
            onClick={fetchAllData}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-medium transition"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
        <button
          onClick={() => handleTabChange('price')}
          className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition ${
            activeTab === 'price' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag size={13} />
          <span className="truncate">1. Price List</span>
        </button>
        <button
          onClick={() => handleTabChange('nourish')}
          className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition ${
            activeTab === 'nourish' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wheat size={13} />
          <span className="truncate">2. Nourish Feed</span>
        </button>
        <button
          onClick={() => handleTabChange('nutrients')}
          className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition ${
            activeTab === 'nutrients' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical size={13} />
          <span className="truncate">3. Nutrients</span>
        </button>
        <button
          onClick={() => handleTabChange('dm')}
          className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition ${
            activeTab === 'dm' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={13} />
          <span className="truncate">4. DM Ratio</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center items-center text-emerald-800 space-x-2 bg-white rounded-xl">
          <Loader2 className="animate-spin" size={18} />
          <span className="font-medium">Loading database entries...</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Action Header Button: Add Item Toggle */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700 text-xs">
              {activeTab === 'price' && 'Price List Entries'}
              {activeTab === 'nourish' && 'Nourish Feed Entries'}
              {activeTab === 'nutrients' && 'Nutrient Entries'}
              {activeTab === 'dm' && 'DM Reference Entries'}
            </span>
            <button
              onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold transition shadow-2xs ${
                showForm 
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                  : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              {showForm ? <X size={14} /> : <Plus size={14} />}
              <span>{showForm ? 'Cancel' : 'Add New Item'}</span>
            </button>
          </div>

          {/* TAB 1: PRICE LIST */}
          {activeTab === 'price' && (
            <div className="space-y-4">
              {showForm && (
                <form onSubmit={handlePriceSubmit} className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3 shadow-sm animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b pb-2 font-bold text-emerald-800">
                    <span>{editId ? 'Edit Price Item' : 'Add New Price Item'}</span>
                    <button type="button" onClick={resetForm}><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Item Name</label>
                      <input
                        type="text" required placeholder="e.g. Rice Polish"
                        value={itemName} onChange={(e) => setItemName(e.target.value)}
                        className="w-full border p-1.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Price / Kg (৳)</label>
                      <input
                        type="number" step="0.01" required placeholder="e.g. 35.5"
                        value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)}
                        className="w-full border p-1.5 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Feed Type</label>
                      <select value={feedType} onChange={(e) => setFeedType(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="concentrate">Concentrate</option>
                        <option value="fodder">Fodder</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="dairy">Dairy</option>
                        <option value="fattening">Fattening</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold flex justify-center items-center space-x-1">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : editId ? <Save size={14} /> : <Plus size={14} />}
                    <span>{editId ? 'Update Price Item' : 'Save Price Item'}</span>
                  </button>
                </form>
              )}

              {/* Price List Table */}
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold border-b text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Type / Category</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {priceList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{item.name}</td>
                        <td className="p-2.5 text-[10px] text-slate-500 capitalize">{item.feed_type} | {item.category}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">৳{item.price_per_kg?.toFixed(2)}</td>
                        <td className="p-2.5 text-center space-x-1">
                          <button onClick={() => { setEditId(item.id); setItemName(item.name); setPricePerKg(item.price_per_kg); setFeedType(item.feed_type); setCategory(item.category); setShowForm(true); }} className="p-1 text-slate-500 hover:text-emerald-700"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete('price_list', item.id)} className="p-1 text-slate-500 hover:text-rose-700"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: NOURISH FEED */}
          {activeTab === 'nourish' && (
            <div className="space-y-4">
              {showForm && (
                <form onSubmit={handleNourishSubmit} className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3 shadow-sm animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b pb-2 font-bold text-emerald-800">
                    <span>{editId ? 'Edit Nourish Feed' : 'Add New Nourish Feed'}</span>
                    <button type="button" onClick={resetForm}><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Feed Name</label>
                      <input type="text" required placeholder="e.g. Nourish Dairy Pellet" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">TP / Kg (৳)</label>
                      <input type="number" step="0.01" required placeholder="e.g. 48.0" value={tpPerKg} onChange={(e) => setTpPerKg(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="dairy">Dairy Feed</option>
                        <option value="fattening">Fattening Feed</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold flex justify-center items-center space-x-1">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : editId ? <Save size={14} /> : <Plus size={14} />}
                    <span>{editId ? 'Update Nourish Feed' : 'Save Nourish Feed'}</span>
                  </button>
                </form>
              )}

              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold border-b text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">Feed Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Price/kg</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {nourishFeeds.map((feed) => (
                      <tr key={feed.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{feed.name}</td>
                        <td className="p-2.5 text-[10px] text-slate-500 capitalize">{feed.category}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-700">৳{feed.tp_per_kg?.toFixed(2)}</td>
                        <td className="p-2.5 text-center space-x-1">
                          <button onClick={() => { setEditId(feed.id); setItemName(feed.name); setTpPerKg(feed.tp_per_kg); setCategory(feed.category); setShowForm(true); }} className="p-1 text-slate-500 hover:text-emerald-700"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete('nourish_feeds', feed.id)} className="p-1 text-slate-500 hover:text-rose-700"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NUTRIENT VALUES */}
          {activeTab === 'nutrients' && (
            <div className="space-y-4">
              {showForm && (
                <form onSubmit={handleNutrientSubmit} className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3 shadow-sm animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b pb-2 font-bold text-emerald-800">
                    <span>{editId ? 'Edit Nutrient Entry' : 'Add New Nutrient Entry'}</span>
                    <button type="button" onClick={resetForm}><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Item Name</label>
                      <input type="text" required placeholder="e.g. Maize Crushed" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">DM (%)</label>
                      <input type="number" step="0.1" required placeholder="e.g. 88" value={dmPercent} onChange={(e) => setDmPercent(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">CP (%)</label>
                      <input type="number" step="0.1" required placeholder="e.g. 9.5" value={cpPercent} onChange={(e) => setCpPercent(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">ME Energy (MJ/kg)</label>
                      <input type="number" step="0.01" required placeholder="e.g. 12.2" value={meEnergy} onChange={(e) => setMeEnergy(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Type</label>
                      <select value={feedType} onChange={(e) => setFeedType(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="concentrate">Concentrate</option>
                        <option value="fodder">Fodder</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="dairy">Dairy</option>
                        <option value="fattening">Fattening</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold flex justify-center items-center space-x-1">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : editId ? <Save size={14} /> : <Plus size={14} />}
                    <span>{editId ? 'Update Nutrient Item' : 'Save Nutrient Item'}</span>
                  </button>
                </form>
              )}

              <div className="bg-white rounded-xl border overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold border-b text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5 text-center">DM %</th>
                      <th className="p-2.5 text-center">CP %</th>
                      <th className="p-2.5 text-center">ME</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {nutrients.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{item.name}</td>
                        <td className="p-2.5 text-center">{item.dm_percent}%</td>
                        <td className="p-2.5 text-center text-emerald-700 font-bold">{item.cp_percent}%</td>
                        <td className="p-2.5 text-center text-amber-700">{item.me_energy}</td>
                        <td className="p-2.5 text-center space-x-1">
                          <button onClick={() => { setEditId(item.id); setItemName(item.name); setDmPercent(item.dm_percent); setCpPercent(item.cp_percent); setMeEnergy(item.me_energy); setFeedType(item.feed_type); setCategory(item.category); setShowForm(true); }} className="p-1 text-slate-500 hover:text-emerald-700"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete('feed_nutrients', item.id)} className="p-1 text-slate-500 hover:text-rose-700"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DM RATIO REFERENCE */}
          {activeTab === 'dm' && (
            <div className="space-y-4">
              {showForm && (
                <form onSubmit={handleDmSubmit} className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3 shadow-sm animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b pb-2 font-bold text-emerald-800">
                    <span>{editId ? 'Edit DM Reference' : 'Add New DM Reference'}</span>
                    <button type="button" onClick={resetForm}><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Stage Name</label>
                      <input type="text" required placeholder="e.g. Early Lactation" value={stageName} onChange={(e) => setStageName(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Target Group</label>
                      <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value as any)} className="w-full border p-1.5 rounded-lg bg-white">
                        <option value="dairy">Dairy</option>
                        <option value="heifer">Heifer</option>
                        <option value="fattening">Fattening</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Concentrate Ratio</label>
                      <input type="number" step="0.1" required placeholder="e.g. 60" value={concentrateRatio} onChange={(e) => setConcentrateRatio(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Fodder Ratio</label>
                      <input type="number" step="0.1" required placeholder="e.g. 40" value={fodderRatio} onChange={(e) => setFodderRatio(e.target.value)} className="w-full border p-1.5 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Min - Max Days</label>
                      <div className="flex gap-1">
                        <input type="number" placeholder="Min" value={minDays} onChange={(e) => setMinDays(e.target.value)} className="w-1/2 border p-1 rounded-lg" />
                        <input type="number" placeholder="Max" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} className="w-1/2 border p-1 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Min - Max Months</label>
                      <div className="flex gap-1">
                        <input type="number" placeholder="Min" value={minMonths} onChange={(e) => setMinMonths(e.target.value)} className="w-1/2 border p-1 rounded-lg" />
                        <input type="number" placeholder="Max" value={maxMonths} onChange={(e) => setMaxMonths(e.target.value)} className="w-1/2 border p-1 rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-emerald-800 text-white py-2 rounded-lg font-bold flex justify-center items-center space-x-1">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : editId ? <Save size={14} /> : <Plus size={14} />}
                    <span>{editId ? 'Update DM Reference' : 'Save DM Reference'}</span>
                  </button>
                </form>
              )}

              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold border-b text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">Stage</th>
                      <th className="p-2.5">Group</th>
                      <th className="p-2.5 text-center">Ratio (C:F)</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {dmReferences.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">{ref.stage_name}</td>
                        <td className="p-2.5 text-[10px] text-slate-500 capitalize">{ref.target_group}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800">{ref.concentrate_ratio} : {ref.fodder_ratio}</td>
                        <td className="p-2.5 text-center space-x-1">
                          <button onClick={() => { setEditId(ref.id); setStageName(ref.stage_name); setTargetGroup(ref.target_group); setConcentrateRatio(ref.concentrate_ratio); setFodderRatio(ref.fodder_ratio); setMinDays(ref.min_days || ''); setMaxDays(ref.max_days || ''); setMinMonths(ref.min_months || ''); setMaxMonths(ref.max_months || ''); setShowForm(true); }} className="p-1 text-slate-500 hover:text-emerald-700"><Edit3 size={14} /></button>
                          <button onClick={() => handleDelete('dm_references', ref.id)} className="p-1 text-slate-500 hover:text-rose-700"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}