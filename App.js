import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, Wallet, Calendar, User, LogOut, ChevronDown, Loader2 } from 'lucide-react';

// 1. YAHAN APNA URL PASTE KAREIN
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSuATOOwiMTSQ87EEgwCkAWxpiOzmlYR8n4G6sxWpwb4YmGpRUEWNZL7OxCBM1VKCN/exec'; 
const BUDGET_LIMIT = 150000;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    description: '',
    amount: '',
    addedBy: 'Husband'
  });

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const json = await response.json();
      
      // Google Sheet data ko format karna (Headers: Timestamp, Date, Day, Category, Description, Amount, AddedBy)
      const formattedData = json.map(row => ({
        Date: row[1],
        Day: row[2],
        'Expense Category': row[3],
        Description: row[4],
        'Amount Spend': row[5],
        'Added By': row[6]
      }));

      setData(formattedData);
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      setSelectedMonth(currentMonth);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'UK123') setIsAuthenticated(true);
    else alert('Ghalat Password! UK123 try karein.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dayName = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
    const payload = { ...formData, day: dayName };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Zaroori hai Google Script ke liye
        body: JSON.stringify(payload)
      });
      alert("Entry Saved!");
      setFormData({ ...formData, description: '', amount: '' });
      fetchData();
    } catch (err) {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // Monthly Logic
  const monthsList = useMemo(() => {
    const months = data.map(item => {
      const d = new Date(item.Date);
      return isNaN(d) ? null : d.toLocaleString('default', { month: 'long', year: 'numeric' });
    }).filter(Boolean);
    return [...new Set(months)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const d = new Date(item.Date);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [data, selectedMonth]);

  const totalSpent = filteredData.reduce((acc, curr) => acc + Number(curr['Amount Spend'] || 0), 0);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-red-900/30 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="flex justify-center mb-8">
            <span className="bg-red-600 px-3 py-1 text-white font-bold text-2xl rounded">UK</span>
            <span className="text-white font-light text-2xl ml-2">Finances</span>
          </div>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-black border border-zinc-800 text-white p-4 rounded-xl mb-6 focus:border-red-600 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/20">
            UNLOCK DASHBOARD
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-zinc-900 pb-6 gap-6">
        <div className="flex items-center group cursor-pointer">
          <div className="bg-red-600 px-3 py-1 text-white font-bold text-2xl rounded group-hover:scale-110 transition-transform">UK</div>
          <div className="text-white font-light text-2xl ml-2 tracking-tight">Finances</div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
          <select 
            className="bg-transparent border-none p-2 rounded text-sm outline-none text-white font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthsList.length > 0 ? monthsList.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>) : <option>No Data Found</option>}
          </select>
          <button 
            onClick={() => setSelectedMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))}
            className="text-[10px] bg-zinc-800 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg uppercase font-bold transition-all"
          >
            Current
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="text-zinc-500 hover:text-red-600 ml-2 transition-colors">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      {loading && (
        <div className="fixed top-4 right-4 animate-spin text-red-600">
          <Loader2 size={24} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Form */}
        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Monthly Spending</p>
            <h2 className="text-4xl font-black text-white">Rs. {totalSpent.toLocaleString()}</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
              <PlusCircle size={20} className="text-red-600"/> Add Transaction
            </h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Date</label>
                <input type="date" className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Category</label>
                <select className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>House</option><option>Food</option><option>Medical</option><option>Transport</option><option>Entertainment</option><option>Others</option>
                </select>
              </div>

              <input type="text" placeholder="Description (e.g. Grocery)" className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              <input type="number" placeholder="Amount (Rs.)" className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none text-red-500 font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              
              <div className="flex bg-black p-1.5 rounded-xl border border-zinc-800">
                <button type="button" onClick={() => setFormData({...formData, addedBy: 'Husband'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.addedBy === 'Husband' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>HUSBAND</button>
                <button type="button" onClick={() => setFormData({...formData, addedBy: 'Wife'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.addedBy === 'Wife' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>WIFE</button>
              </div>
              <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-4 shadow-lg shadow-red-900/30 active:scale-95 transition-all uppercase tracking-widest">
                {loading ? 'Processing...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-red-600"/> Monthly Ledger
              </h3>
              <span className="text-[10px] bg-red-600/10 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-tighter border border-red-900/30">
                {filteredData.length} entries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-black text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                    <th className="p-5">Date</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Description</th>
                    <th className="p-5">By</th>
                    <th className="p-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredData.length > 0 ? filteredData.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="p-5 text-zinc-400 font-medium">
                        {item.Date ? new Date(item.Date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'}) : '-'}
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-bold border border-zinc-700">
                          {item['Expense Category']}
                        </span>
                      </td>
                      <td className="p-5 text-zinc-300 font-medium">{item.Description}</td>
                      <td className="p-5">
                        <span className={`text-[10px] font-black ${item['Added By'] === 'Husband' ? 'text-red-500' : 'text-zinc-100'}`}>
                          {item['Added By']?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-5 text-right font-bold text-white group-hover:text-red-500 transition-colors">
                        Rs. {Number(item['Amount Spend']).toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-zinc-600 font-medium italic tracking-widest">
                        No transactions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
