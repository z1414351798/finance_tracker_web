import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendChart from '../components/TrendChart';

export default function Analytics() {
  const [data, setData] = useState({ income: 0, expense: 0, incomeCats: [], expenseCats: [] });
  const [viewType, setViewType] = useState('EXPENSE'); // State for the toggle
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await fetch('/api/transactions/summary', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData({
          income: result.cashFlow.totalIncome || 0,
          expense: result.cashFlow.totalExpense || 0,
          incomeCats: result.incomeCategories || [],
          expenseCats: result.expenseCategories || []
        });
      }
      setLoading(false);
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-10 text-center">Analysing your data...</div>;

  const barData = [{ name: 'Totals', Income: data.income, Expense: data.expense }];
  
  // Decide which data to show based on the toggle
  const activePieData = viewType === 'EXPENSE' ? data.expenseCats : data.incomeCats;
  const COLORS = viewType === 'EXPENSE' 
    ? ['#ef4444', '#f97316', '#f59e0b', '#7c3aed'] // Warm colors for expenses
    : ['#10b981', '#059669', '#34d399', '#064e3b']; // Green colors for income

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Financial Analytics</h1>

      {/* New Trend Chart spans the full width */}
      <TrendChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h3 className="font-bold mb-4">Inflow vs Outflow</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart with Filter */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Distribution</h3>
            
            {/* The Select Toggle */}
            <select 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXPENSE">Expense Breakdown</option>
              <option value="INCOME">Income Breakdown</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie 
                data={activePieData} 
                innerRadius={70} 
                outerRadius={100} 
                dataKey="value" 
                nameKey="name"
                animationDuration={800} // Smooth transition when switching
              >
                {activePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {activePieData.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No data for this type</p>
          )}
        </div>
      </div>
    </div>
  );
}