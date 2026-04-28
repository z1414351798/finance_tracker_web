import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendChart() {
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({ range: 'DAY', type: 'EXPENSE' });

  useEffect(() => {
    const fetchTrends = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions/trends?range=${config.range}&type=${config.type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    };
    fetchTrends();
  }, [config]);

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Financial Trends</h3>
        
        <div className="flex gap-2">
          {/* Range Selector */}
          <select 
            value={config.range} 
            onChange={e => setConfig({...config, range: e.target.value})}
            className="p-2 bg-gray-50 border rounded-lg text-sm font-medium outline-none"
          >
            <option value="DAY">Daily</option>
            <option value="MONTH">Monthly</option>
            <option value="YEAR">Yearly</option>
          </select>

          {/* Type Selector */}
          <select 
            value={config.type} 
            onChange={e => setConfig({...config, type: e.target.value})}
            className={`p-2 border rounded-lg text-sm font-bold outline-none ${config.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'}`}
          >
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Incomes</option>
          </select>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="timeLabel" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="top" align="right" height={36}/>
            <Line 
              type="monotone" 
              dataKey="total" 
              name={config.type === 'EXPENSE' ? "Spent" : "Earned"}
              stroke={config.type === 'EXPENSE' ? '#ef4444' : '#10b981'} 
              strokeWidth={4}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}