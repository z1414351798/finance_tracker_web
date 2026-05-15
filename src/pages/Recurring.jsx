import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { RefreshCw, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

const defaultForm = {
  name: '',
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  frequency: 'MONTHLY',
  startDate: new Date().toISOString().slice(0, 10),
};

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = () => localStorage.getItem('token');

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring', {
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Failed to load recurring transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
    fetch('/api/categories/getAllByUserId', {
      headers: { 'Authorization': `Bearer ${token()}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleToggleActive = async (item) => {
    try {
      await fetch(`/api/recurring/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({ active: !item.active }),
      });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring transaction?')) return;
    try {
      await fetch(`/api/recurring/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      fetchRecurring();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setForm(defaultForm);
        fetchRecurring();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to create recurring transaction.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const freqBadgeColor = {
    DAILY: 'bg-purple-50 text-purple-700',
    WEEKLY: 'bg-blue-50 text-blue-700',
    MONTHLY: 'bg-indigo-50 text-indigo-700',
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw size={22} className="text-blue-600" /> Recurring
        </h1>
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger asChild>
            <button
              onClick={() => { setForm(defaultForm); setError(''); }}
              className="flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Add Recurring</span><span className="sm:hidden">Add</span>
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-xl font-bold text-gray-800">New Recurring Transaction</Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-gray-300 hover:text-gray-500"><X size={22} /></button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Netflix subscription"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Amount</label>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Type</label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-100">
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, type: 'EXPENSE' }))}
                        className={`flex-1 py-2.5 text-xs font-bold transition ${form.type === 'EXPENSE' ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-400'}`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, type: 'INCOME' }))}
                        className={`flex-1 py-2.5 text-xs font-bold transition ${form.type === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'}`}
                      >
                        Income
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">No category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {error && <p className="text-rose-500 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? 'Creating…' : 'Create Recurring Transaction'}
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="p-20 text-center text-gray-400 italic">No recurring transactions yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-5">Name</th>
                <th className="p-5">Type</th>
                <th className="p-5">Frequency</th>
                <th className="p-5">Next Run</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-center">Active</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="p-5 font-semibold text-gray-800">{item.name}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${freqBadgeColor[item.frequency] || 'bg-gray-50 text-gray-600'}`}>
                      {item.frequency}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-gray-500">
                    {item.nextRunDate ? new Date(item.nextRunDate).toLocaleDateString() : '—'}
                  </td>
                  <td className={`p-5 text-right font-mono font-bold ${item.type === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {item.type === 'EXPENSE' ? '-' : '+'}${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`transition ${item.active ? 'text-emerald-500 hover:text-emerald-700' : 'text-gray-300 hover:text-gray-500'}`}
                      title={item.active ? 'Deactivate' : 'Activate'}
                    >
                      {item.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-16 text-gray-400 italic">No recurring transactions yet.</p>
        ) : items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Next: {item.nextRunDate ? new Date(item.nextRunDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <p className={`font-mono font-bold text-base whitespace-nowrap ${item.type === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-600'}`}>
                {item.type === 'EXPENSE' ? '-' : '+'}${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {item.type}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${freqBadgeColor[item.frequency] || 'bg-gray-50 text-gray-600'}`}>
                  {item.frequency}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`transition ${item.active ? 'text-emerald-500 hover:text-emerald-700' : 'text-gray-300 hover:text-gray-500'}`}
                  title={item.active ? 'Deactivate' : 'Activate'}
                >
                  {item.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-gray-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
