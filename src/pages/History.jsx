import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, RotateCcw, ChevronLeft, ChevronRight,
  Hash, Tag, Edit2, Check, X, Calendar, DollarSign, Trash2, Upload, ImageIcon
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">

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
      
      {/* 1. RESTORED FILTER PANEL */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Filter size={20} className="text-blue-600" /> Advanced Search
          </h2>
          <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-red-500 transition flex items-center gap-1">
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>

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

      {/* 2. DATA TABLE WITH INLINE EDITING */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
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

        {/* 3. PAGINATION */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-bold uppercase ml-2 tracking-widest">Total: {totalRows}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronLeft size={18}/></button>
            <div className="flex items-center px-4 text-xs font-bold text-gray-500 uppercase tracking-tighter">Page {page + 1} / {totalPages || 1}</div>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm transition"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}