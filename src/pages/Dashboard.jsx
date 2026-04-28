import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PlusCircle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      // 1. Fetch Summary for the top cards
      const summaryRes = await fetch('/api/transactions/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 2. Fetch only the 5 most recent transactions
      const historyRes = await fetch('/api/transactions/history?page=0&size=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (summaryRes.ok && historyRes.ok) {
        const sData = await summaryRes.json();
        const hData = await historyRes.json();
        
        setSummary({
          income: sData.cashFlow.totalIncome || 0,
          expense: sData.cashFlow.totalExpense || 0,
          balance: (sData.cashFlow.totalIncome || 0) - (sData.cashFlow.totalExpense || 0)
        });
        setRecentTransactions(hData.content);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-500">Here is what's happening with your money.</p>
        </div>
        <Link to="/record" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          <PlusCircle size={20}/> New Entry
        </Link>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Balance" amount={summary.balance} icon={<Wallet className="text-blue-600"/>} color="bg-blue-50" />
        <StatCard title="Total Income" amount={summary.income} icon={<ArrowUpCircle className="text-green-600"/>} color="bg-green-50" />
        <StatCard title="Total Expense" amount={summary.expense} icon={<ArrowDownCircle className="text-red-600"/>} color="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Link to="/history" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'INCOME' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                  </div>
                  <div>
                    <p className="font-bold">{t.text}</p>
                    <p className="text-xs text-gray-400">{t.category} • {t.date}</p>
                  </div>
                </div>
                <p className={`font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                </p>
              </div>
            ))}
            {recentTransactions.length === 0 && <p className="text-center py-10 text-gray-400 italic">No recent transactions.</p>}
          </div>
        </div>

        {/* Quick Tips or Small Insight */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4">Financial Tip</h3>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            "Small daily expenses add up. You spent most of your money on <b>Food</b> this week. Try to reduce dining out by 10% to save an extra $150 this month."
          </p>
          <button onClick={() => navigate('/analytics')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-medium border border-white/20">
            See Deep Insights
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Small Component for Top Stats
function StatCard({ title, amount, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-black">${amount}</p>
      </div>
    </div>
  );
}