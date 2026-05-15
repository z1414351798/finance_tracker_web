import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, RotateCcw, ChevronLeft, ChevronRight,
  Hash, Tag, Edit2, Check, X, Calendar, DollarSign, Trash2, Upload, ImageIcon, ChevronDown, Download
} from 'lucide-react';

export default function History() {
  // --- Data & Pagination State ---
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const size = 15;

  // --- Inline Editing State ---
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // --- Delete State ---
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // --- Receipt Image State ---
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const uploadInputRef = useRef(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const toggleFlip = (id) => setFlippedCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // --- Filter State ---
  const [filters, setFilters] = useState({
    text: '',
    categoryId: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    note: ''
  });

  // --- Mobile filter panel collapsed state ---
  const [filtersOpen, setFiltersOpen] = useState(false);

  // --- 1. Load Categories on Mount ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/getAllByUserId', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const catList = await res.json();
          setCategories(catList);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // --- 2. Load Transactions (Triggered by Page or Filter change) ---
  const fetchHistory = async () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );

    const params = new URLSearchParams({
      page: page,
      size: size,
      ...activeFilters
    });

    try {
      const res = await fetch(`/api/transactions/history?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.content || []);
        setTotalRows(result.totalElements || 0);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filters]);

  // --- Inline Edit Actions ---
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditFormData({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/transactions/update/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (res.ok) {
        setEditingId(null);
        fetchHistory();
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
    }
  };

  // --- Delete Action ---
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/transactions/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        fetchHistory();
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  // --- Receipt Upload ---
  const handleReceiptUpload = async (id, file) => {
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`/api/transactions/${id}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Error uploading receipt:", err);
    } finally {
      setUploadingId(null);
    }
  };

  // --- Filter Helpers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      text: '', categoryId: '', type: '', minAmount: '',
      maxAmount: '', startDate: '', endDate: '', note: ''
    });
    setPage(0);
  };

  const totalPages = Math.ceil(totalRows / size);

  const handleExportCsv = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/transactions/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <img src={lightboxUrl} alt="Receipt" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Delete Transaction?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-3xl shadow-sm border border-blue-100 space-y-4 md:space-y-6">
        {/* Header row — always visible */}
        <div className="flex items-center justify-between border-b border-blue-100 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Filter size={20} className="text-blue-600" /> Advanced Search
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-red-500 transition flex items-center gap-1">
              <RotateCcw size={14} /> Reset
            </button>
            {/* Mobile toggle button */}
            <button
              className="md:hidden flex items-center gap-1 text-sm text-blue-600 font-medium"
              onClick={() => setFiltersOpen(prev => !prev)}
            >
              Filters <ChevronDown size={16} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter grid — always shown on md+, toggled on mobile */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Keyword */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input name="text" value={filters.text} onChange={handleFilterChange} placeholder="Description..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition">
                <option value="">All Types</option>
                <option value="INCOME">Income (+)</option>
                <option value="EXPENSE">Expense (-)</option>
              </select>
            </div>

            {/* Notes Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Notes</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input name="note" value={filters.note} onChange={handleFilterChange} placeholder="Search notes..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition" />
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Amount ($)</label>
              <div className="flex items-center gap-2">
                <input type="number" name="minAmount" placeholder="Min" value={filters.minAmount} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                <input type="number" name="maxAmount" placeholder="Max" value={filters.maxAmount} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                <span className="text-gray-300">to</span>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE — desktop only */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-5">Date</th>
                <th className="p-5">Transaction / Notes</th>
                <th className="p-5">Category</th>
                <th className="p-5 text-center">Receipt</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length > 0 ? data.map(row => (
                <tr key={row.id} className="hover:bg-blue-50/10 transition-colors">
                  {editingId === row.id ? (
                    // --- EDIT MODE ROW ---
                    <>
                      <td className="p-4">
                        <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                      </td>
                      <td className="p-4 space-y-2">
                        <input type="text" name="text" value={editFormData.text} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none" />
                        <input type="text" name="note" value={editFormData.note} onChange={handleEditChange} placeholder="Notes..." className="w-full p-2 border border-blue-100 rounded-lg text-xs outline-none text-gray-500" />
                      </td>
                      <td className="p-4">
                        <select name="categoryId" value={editFormData.categoryId} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none">
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <label className="cursor-pointer inline-flex flex-col items-center gap-1 text-blue-500 hover:text-blue-700">
                          {uploadingId === row.id ? (
                            <span className="text-xs text-gray-400">Uploading…</span>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span className="text-[10px] font-bold uppercase">Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files[0]) handleReceiptUpload(row.id, e.target.files[0]);
                            }}
                          />
                        </label>
                      </td>
                      <td className="p-4">
                        <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm text-right outline-none" />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={saveEdit} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Check size={16}/></button>
                          <button onClick={cancelEdit} className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"><X size={16}/></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // --- VIEW MODE ROW ---
                    <>
                      <td className="p-5 text-sm text-gray-500 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="p-5">
                        <div className="font-semibold text-gray-800">{row.text}</div>
                        {row.note && <div className="text-xs text-gray-400 italic mt-1">"{row.note}"</div>}
                      </td>
                      <td className="p-5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                          {row.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        {(row.imagePresignedUrl || row.imageUrl) ? (
                          <button onClick={() => setLightboxUrl(row.imagePresignedUrl || row.imageUrl)}>
                            <img
                              src={row.imagePresignedUrl || row.imageUrl}
                              alt="Receipt"
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
                            />
                          </button>
                        ) : (
                          <span className="text-gray-200"><ImageIcon size={18} /></span>
                        )}
                      </td>
                      <td className={`p-5 text-right font-mono font-bold ${row.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {row.amount < 0 ? '-' : '+'}${Math.abs(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => startEdit(row)} className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(row.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-20 text-center text-gray-400 italic">No matches found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 font-bold uppercase ml-2 tracking-widest">Total: {totalRows}</p>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
            >
              <Download size={13}/> Export CSV
            </button>
          </div>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronLeft size={18}/></button>
            <div className="flex items-center px-4 text-xs font-bold text-gray-500 uppercase tracking-tighter">Page {page + 1} / {totalPages || 1}</div>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* MOBILE CARD LIST */}
      <div className="md:hidden space-y-3">
        {data.length > 0 ? data.map(row => (
          <div key={row.id} className={`rounded-2xl shadow-sm border overflow-hidden ${editingId === row.id ? 'bg-white border-gray-100 p-4 space-y-3' : flippedCards.has(row.id) ? 'border-slate-700' : 'bg-white border-gray-100 p-4'}`}>
            {editingId === row.id ? (
              // Mobile edit form
              <div className="space-y-3">
                <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none" />
                <input type="text" name="text" value={editFormData.text} onChange={handleEditChange} placeholder="Description" className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none" />
                <input type="text" name="note" value={editFormData.note} onChange={handleEditChange} placeholder="Notes..." className="w-full p-2 border border-blue-100 rounded-lg text-xs outline-none text-gray-500" />
                <select name="categoryId" value={editFormData.categoryId} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm outline-none">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} className="w-full p-2 border border-blue-200 rounded-lg text-sm text-right outline-none" />
                <label className="cursor-pointer flex items-center gap-2 text-blue-500 text-sm">
                  <Upload size={16} />
                  <span>{uploadingId === row.id ? 'Uploading…' : 'Upload Receipt'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) handleReceiptUpload(row.id, e.target.files[0]); }} />
                </label>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 flex items-center justify-center gap-1 text-sm font-medium"><Check size={15}/> Save</button>
                  <button onClick={cancelEdit} className="flex-1 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 flex items-center justify-center gap-1 text-sm font-medium"><X size={15}/> Cancel</button>
                </div>
              </div>
            ) : (
              // ── 3D Flip Card ───────────────────────────────────────
              <div
                style={{ perspective: '1000px', minHeight: '90px' }}
                onClick={() => toggleFlip(row.id)}
              >
                <div style={{
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4,0.2,0.2,1)',
                  transform: flippedCards.has(row.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '90px',
                }}>

                  {/* ── FRONT ─────────────────────────────────────── */}
                  <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{row.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(row.date).toLocaleDateString()}</p>
                      </div>
                      <p className={`font-mono font-bold text-base whitespace-nowrap ${row.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {row.amount < 0 ? '-' : '+'}${Math.abs(row.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                        {row.categoryName || 'General'}
                      </span>
                      <span className="text-xs text-gray-300 flex items-center gap-1">
                        {(row.imagePresignedUrl || row.imageUrl)
                          ? <ImageIcon size={13} className="text-blue-300" />
                          : <ImageIcon size={13} />}
                        tap to flip
                      </span>
                    </div>
                  </div>

                  {/* ── BACK ──────────────────────────────────────── */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Note</p>
                      <p className="text-sm text-white leading-relaxed">
                        {row.note || <span className="italic text-slate-500">No note added</span>}
                      </p>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      {(row.imagePresignedUrl || row.imageUrl) ? (
                        <button
                          onClick={e => { e.stopPropagation(); setLightboxUrl(row.imagePresignedUrl || row.imageUrl); }}
                          className="relative"
                        >
                          <img
                            src={row.imagePresignedUrl || row.imageUrl}
                            alt="Receipt"
                            className="w-14 h-14 object-cover rounded-xl border-2 border-slate-600 shadow-lg"
                          />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <ImageIcon size={9} className="text-white" />
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs italic">No receipt</span>
                      )}
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { toggleFlip(row.id); startEdit(row); }}
                          className="p-2 rounded-xl bg-slate-700 hover:bg-blue-600 transition-colors"
                        >
                          <Edit2 size={14} className="text-slate-300" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(row.id)}
                          className="p-2 rounded-xl bg-slate-700 hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 size={14} className="text-slate-300" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )) : (
          <p className="text-center py-16 text-gray-400 italic">No matches found.</p>
        )}

        {/* Mobile Pagination */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleExportCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition"
          >
            <Download size={15}/> Export All as CSV
          </button>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total: {totalRows}</p>
            <div className="flex gap-2 items-center">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronLeft size={18}/></button>
              <span className="text-xs font-bold text-gray-500">{page + 1} / {totalPages || 1}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
