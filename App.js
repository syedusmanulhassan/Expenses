import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, Wallet, Calendar, User, LogOut, ChevronDown } from 'lucide-react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_BPxsn0u2QizcghH6YV2vUsZCQ4B3Rq8V1H1U5r7V16W96v3zEiBqGEH6_UROj2pP/exec';
const BUDGET_LIMIT = 150000;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(''); // Format: "Month YYYY"
  
  // Form State
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
      setData(json);
      // Default to current month
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      setSelectedMonth(currentMonth);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'UK123') setIsAuthenticated(true);
    else alert('Incorrect Password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dayName = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
    const payload = { ...formData, day: dayName };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setFormData({ ...formData, description: '', amount: '' });
      fetchData();
    } catch (err) {
      alert("Error saving data");
    }
  };

  // Logic: Grouping and Filtering
  const monthsList = useMemo(() => {
    const months = data.map(item => {
      const d = new Date(item.Date);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    });
    return [...new Set(months)].filter(m => m !== "Invalid Date");
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const d = new Date(item.Date);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [data, selectedMonth]);

  const totalSpent = filteredData.reduce((acc, curr) => acc + Number(curr['Amount Spend'] || 0), 0);
  
  const chartData = useMemo(() => {
    const categories = {};
    filteredData.forEach(item => {
      const cat = item['Expense Category'];
      categories[cat] = (categories[cat] || 0) + Number(item['Amount Spend']);
    });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  }, [filteredData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-900 border border-crimson p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-red-600 px-3 py-1 text-white font-bold text-xl">UK</div>
            <div className="text-white font-light text-xl ml-1">| Finances</div>
          </div>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-black border border-gray-700 text-white p-3 rounded mb-4 focus:border-red-600 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition">ACCESS DASHBOARD</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-6 gap-4">
        <div className="flex items-center">
          <div className="bg-red-600 px-3 py-1 text-white font-bold text-2xl">UK</div>
          <div className="text-white font-light text-2xl ml-2">Finances</div>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="bg-gray-900 border border-gray-700 p-2 rounded text-sm outline-none focus:border-red-600"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button 
            onClick={() => setSelectedMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))}
            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded uppercase tracking-wider"
          >
            Current
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="text-gray-500 hover:text-red-600"><LogOut size={20}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-900 p-6 rounded-xl border-l-4 border-red-600">
              <p className="text-gray-400 text-sm uppercase">Total Spent</p>
              <h2 className="text-3xl font-bold text-white">Rs. {totalSpent.toLocaleString()}</h2>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border-l-4 border-white">
              <p className="text-gray-400 text-sm uppercase">Remaining Budget</p>
              <h2 className={`text-3xl font-bold ${BUDGET_LIMIT - totalSpent < 0 ? 'text-red-500' : 'text-white'}`}>
                Rs. {(BUDGET_LIMIT - totalSpent).toLocaleString()}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-red-600"/> Add Expense</h3>
            <div className="space-y-4">
              <input type="date" className="w-full bg-black border border-gray-700 p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <select className="w-full bg-black border border-gray-700 p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Food</option><option>Rent</option><option>Utilities</option><option>Transport</option><option>Entertainment</option><option>Shopping</option>
              </select>
              <input type="text" placeholder="Description" className="w-full bg-black border border-gray-700 p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              <input type="number" placeholder="Amount" className="w-full bg-black border border-gray-700 p-2 rounded" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <div className="flex bg-black p-1 rounded border border-gray-700">
                <button type="button" onClick={() => setFormData({...formData, addedBy: 'Husband'})} className={`flex-1 py-1 rounded ${formData.addedBy === 'Husband' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>Husband</button>
                <button type="button" onClick={() => setFormData({...formData, addedBy: 'Wife'})} className={`flex-1 py-1 rounded ${formData.addedBy === 'Wife' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>Wife</button>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded mt-2 shadow-lg shadow-red-900/20">SAVE ENTRY</button>
            </div>
          </form>
        </div>

        {/* Right Column: Visuals & Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-64">
             <h3 className="text-sm uppercase text-gray-400 mb-4">Spending by Category</h3>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #444'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#dc2626' : '#ffffff'} />)}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold">Monthly Ledger</h3>
              <span className="text-xs text-gray-500">{filteredData.length} Entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black text-gray-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredData.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-800/50 transition">
                      <td className="p-4">{item.Date ? new Date(item.Date).toLocaleDateString() : '-'}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-gray-800 rounded text-xs">{item['Expense Category']}</span></td>
                      <td className="p-4 text-gray-400">{item.Description}</td>
                      <td className="p-4 font-mono text-white">Rs. {Number(item['Amount Spend']).toLocaleString()}</td>
                      <td className="p-4"><span className={item['Added By'] === 'Husband' ? 'text-red-400' : 'text-blue-400'}>{item['Added By']}</span></td>
                    </tr>
                  ))}
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
