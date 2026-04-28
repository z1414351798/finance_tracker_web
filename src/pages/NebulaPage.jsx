import React from 'react';
import SpendingNebula from '../components/SpendingNebula';
import { ArrowLeft, Maximize2, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NebulaPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      
      {/* 1. TOP NAVIGATION BAR (Overlay) */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-center bg-gradient-to-b from-slate-900/50 to-transparent backdrop-blur-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        
        <div className="text-center">
          <h1 className="text-blue-400 font-mono text-xs tracking-[0.3em] uppercase">System Status: Active</h1>
          <h2 className="text-white text-xl font-black tracking-tighter">FINANCIAL NEURAL MESH</h2>
        </div>

        <div className="flex gap-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                <ShieldCheck size={14}/> SECURE_ENCRYPTION_ON
            </div>
        </div>
      </div>

      {/* 2. THE 3D NEBULA (Full Screen) */}
      <div className="w-full h-full">
        {/* We pass a custom height style to the Nebula wrapper if needed, 
            but the component we built handles its own container. */}
        <SpendingNebula />
      </div>

      {/* 3. SIDE HUD ELEMENTS (Visual Flair) */}
      <div className="absolute bottom-10 left-10 z-20 space-y-4 pointer-events-none">
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Live Data Feed</p>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-white text-xs font-mono">SYNCING_WITH_BANK_CORE...</span>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 z-20 text-right pointer-events-none">
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Visualization Mode</p>
            <p className="text-blue-400 text-sm font-bold">SPHERICAL_FORCE_GRAPH_v1.2</p>
        </div>
      </div>

    </div>
  );
}