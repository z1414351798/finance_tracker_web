import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PlusCircle, ArrowRight } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getUsernameFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'there';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.username || payload.name || 'there';
  } catch {
    return 'there';
  }
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');

      const summaryRes = await fetch('/api/transactions/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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

  const username = getUsernameFromToken();

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-900">
            {getGreeting()}, {username}!
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Here is what's happening with your money.</p>
        </div>
        <Link
          to="/record"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 text-sm"
        >
          <PlusCircle size={18}/> New Entry
        </Link>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Balance"
          amount={summary.balance}
          icon={<Wallet size={22} className="text-white" />}
          gradient="from-blue-500 to-indigo-600"
          shadow="shadow-blue-200"
        />
        <StatCard
          title="Total Income"
          amount={summary.income}
          icon={<ArrowUpCircle size={22} className="text-white" />}
          gradient="from-emerald-400 to-green-600"
          shadow="shadow-emerald-200"
        />
        <StatCard
          title="Total Expense"
          amount={summary.expense}
          icon={<ArrowDownCircle size={22} className="text-white" />}
          gradient="from-rose-400 to-red-600"
          shadow="shadow-rose-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Link to="/history" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map(t => (
              <div
                key={t.id}
                className={`flex justify-between items-center p-4 rounded-2xl transition border-l-4 bg-gray-50/60 hover:bg-gray-100/60 ${
                  t.type === 'INCOME' ? 'border-emerald-400' : 'border-rose-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                    {t.type === 'INCOME' ? <ArrowUpCircle size={18}/> : <ArrowDownCircle size={18}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.text}</p>
                    <p className="text-xs text-gray-400">{t.category} • {t.date}</p>
                  </div>
                </div>
                <p className={`font-black text-sm ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                </p>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-center py-10 text-gray-400 italic">No recent transactions.</p>
            )}
          </div>
        </div>

        {/* Financial Tip */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4">Financial Tip</h3>
          <p className="text-slate-300 mb-6 text-sm leading-relaxed">
            "Small daily expenses add up. You spent most of your money on <b>Food</b> this week. Try to reduce dining out by 10% to save an extra $150 this month."
          </p>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-medium border border-white/20 text-sm"
          >
            See Deep Insights
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, gradient, shadow }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-3xl shadow-xl ${shadow} text-white flex items-center gap-5`}>
      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-2xl font-black">${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
}
