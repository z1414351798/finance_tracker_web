import React, { useState, useEffect } from 'react';
import { Plus, Move, CheckCircle2, X, CalendarDays } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// RADIX PRIMITIVES
import * as Toast from '@radix-ui/react-toast';
import * as Dialog from '@radix-ui/react-dialog';

export default function Record() {
  const [formData, setFormData] = useState({
    text: '',
    amount: '',
    categoryId: '',
    type: 'EXPENSE',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');

  // RADIX STATES
  const [toastOpen, setToastOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    const res = await fetch(`/api/categories?type=${formData.type}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setAvailableCategories(await res.json());
  };

  useEffect(() => { fetchCategories(); }, [formData.type]);

  const handleDragEnd = (event) => {
    if (event.over) {
      const overId = event.over.id.toString();
      // Toggle logic: If dragging onto the already selected category, deselect it
      setFormData(prev => ({
        ...prev,
        categoryId: prev.categoryId === overId ? '' : overId
      }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newCatName, type: formData.type }),
    });
    if (res.ok) {
      await fetchCategories();
      setNewCatName('');
      setDialogOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.categoryId) return;
    const finalAmount = formData.type === 'EXPENSE' ? -Math.abs(formData.amount) : Math.abs(formData.amount);

    const res = await fetch('/api/transactions/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...formData, amount: finalAmount }),
    });

    if (res.ok) {
      setToastOpen(true);
      setFormData({ text: '', amount: '', categoryId: '', type: formData.type, note: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="max-w-4xl mx-auto p-4 md:p-10 font-sans">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 1. INPUTS SIDE */}
            <div className="p-5 md:p-8 rounded-[2.5rem] shadow-2xl space-y-6 h-fit" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>1. DETAILS</h2>

              {/* Updated Toggle: Centered and Larger */}
              <div className="flex gap-2 p-2 rounded-2xl w-full" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                {['EXPENSE', 'INCOME'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t, categoryId: '' })}
                    className={`flex-1 py-3 rounded-xl font-black text-sm tracking-widest transition-all ${formData.type === t
                        ? 'shadow-md text-blue-600 scale-[1.02]'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                    style={formData.type === t ? { backgroundColor: 'var(--bg-card)' } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <input type="number" placeholder="0.00" value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full text-4xl md:text-5xl font-black outline-none placeholder:text-gray-100 dark:placeholder:text-gray-700 focus:text-blue-600 transition-colors dark:text-gray-100"
                  style={{ background: 'none' }}
                />
                <input placeholder="What is this for?" value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  className="w-full p-4 rounded-2xl outline-none border-none font-bold dark:text-gray-100"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <DraggableTransaction text={formData.text} amount={formData.amount} type={formData.type} />

              {/* NOTE FIELD */}
              <textarea
                placeholder="Add a note..."
                className="w-full p-4 rounded-2xl h-24 outline-none text-sm border-none resize-none font-medium dark:text-gray-300"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
              />

              {/* DATE PICKER */}
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Date
                </label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none border-none font-bold text-sm appearance-none dark:text-gray-100"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!formData.categoryId}
                className={`w-full py-5 rounded-2xl font-black text-white transition-all transform active:scale-95 ${!formData.categoryId ? 'bg-gray-200 dark:bg-[#334155]' : formData.type === 'EXPENSE' ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-100 shadow-xl' : 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-green-100 shadow-xl'
                  }`}>
                CONFIRM & SAVE
              </button>
            </div>

            {/* 2. CATEGORY SIDE */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>2. CATEGORY</h2>

                <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                  <Dialog.Trigger asChild>
                    <button className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 p-3 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-90 transition-all"><Plus size={20} /></button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 rounded-[3rem] shadow-2xl w-96 z-[101] outline-none" style={{ backgroundColor: 'var(--bg-card)' }}>
                      <Dialog.Title className="text-2xl font-black mb-6 uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>New Group</Dialog.Title>
                      <input autoFocus placeholder="Name..." value={newCatName} onChange={e => setNewCatName(e.target.value)}
                        className="w-full p-5 rounded-2xl mb-8 outline-none font-bold text-lg dark:text-gray-100"
                        style={{ backgroundColor: 'var(--bg-input)' }}
                      />
                      <div className="flex gap-4">
                        <Dialog.Close className="flex-1 font-bold text-gray-300">Cancel</Dialog.Close>
                        <button onClick={handleAddCategory} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black">CREATE</button>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableCategories.map(cat => (
                  <CategoryPad
                    key={cat.id}
                    cat={cat}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      categoryId: prev.categoryId == cat.id ? '' : cat.id.toString()
                    }))}
                    isSelected={formData.categoryId == cat.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </DndContext>

        {/* TOAST SYSTEM */}
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className="rounded-3xl shadow-2xl p-5 flex items-center gap-4 animate-slide-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="bg-green-500 text-white p-2 rounded-full"><CheckCircle2 size={20} /></div>
          <div className="flex-1">
            <Toast.Title className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>SUCCESS</Toast.Title>
            <Toast.Description className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Record Added</Toast.Description>
          </div>
          <Toast.Close style={{ color: 'var(--text-muted)' }} className="hover:text-gray-600"><X size={18} /></Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-96 max-w-[100vw] z-[200] outline-none" />
      </div>
    </Toast.Provider>
  );
}

// --- Draggable Transaction Stamp ---
function DraggableTransaction({ text, amount, type }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'active-transaction' });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`p-6 rounded-[2rem] border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${type === 'EXPENSE' ? 'border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10' : 'border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'
        } ${isDragging ? 'shadow-2xl scale-105 z-50 bg-white dark:bg-[#1e293b] border-blue-400 ring-4 ring-blue-500/10' : 'shadow-sm'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Stamp</span>
        <Move size={14} style={{ color: 'var(--border)' }} />
      </div>
      <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{text || "New Entry"}</p>
      <p className={`text-3xl font-black ${type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
        ${amount || "0.00"}
      </p>
    </div>
  );
}

// --- Droppable Category Pad ---
function CategoryPad({ cat, isSelected, onClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: cat.id.toString() });
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`h-28 rounded-3xl border-2 transition-all flex flex-col items-center justify-center relative cursor-pointer ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-110 z-10 shadow-xl' :
          isSelected ? 'border-gray-900 dark:border-gray-100 shadow-md' : 'border-gray-100 dark:border-[#334155]'
        }`}
      style={!isOver && !isSelected ? { backgroundColor: 'var(--bg-input)' } : !isOver && isSelected ? { backgroundColor: 'var(--bg-card)' } : {}}
    >
      {isSelected && <CheckCircle2 size={16} className="absolute top-3 right-3" style={{ color: 'var(--text-primary)' }} />}
      <span className={`text-[10px] font-black uppercase tracking-widest text-center px-2`} style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {cat.name}
      </span>
    </div>
  );
}
