import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, RefreshCw, Volume2, LayoutDashboard, Bot } from 'lucide-react';
import { resetDemoData } from '../lib/api';

export default function Navbar({ wsConnected, apiPoolStatus, refreshDashboard }) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetDemoData();
      if (refreshDashboard) {
        await refreshDashboard();
      }
    } catch (err) {
      console.error('Demo reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <header className="bg-[#002970] text-white border-b border-[#001844] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00BAF2] flex items-center justify-center font-black text-slate-950 shadow-md tracking-tighter text-sm">
            PAYTM
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>Paytm VoiceVyapar — AI Merchant Copilot</span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#00BAF2]/20 text-[#00BAF2] border border-[#00BAF2]/30">
                Track 1
              </span>
            </h1>
            <p className="text-[11px] text-slate-300">Voice-First Indian Kirana CFO & IoT Soundbox Engine</p>
          </div>
        </div>

        {/* Page Switcher Pills */}
        <nav className="flex items-center gap-1.5 bg-[#001844] p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <NavLink
            to="/soundbox"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>🔊 Page 1: Live IoT Soundbox</span>
          </NavLink>
          <NavLink
            to="/erp"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>📊 Page 2: Merchant Growth ERP</span>
          </NavLink>
        </nav>

        {/* Status Badges & Demo Reset Action */}
        <div className="flex items-center gap-2.5">
          {/* Live WS / Simulator Status */}
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
              wsConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
            title={wsConnected ? 'Connected to live FastAPI backend' : 'Backend offline: Running in high-fidelity browser simulator mode'}
          >
            <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
            <span>{wsConnected ? '🟢 Edge Connected' : '🟡 Simulator Ready'}</span>
          </div>


          {/* Telegram Bot Live Status */}
          <div
            className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium"
            title="Async Telegram bot listening for /link and UPI settlement callbacks"
          >
            <Bot className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span>📱 Telegram Bot Active</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-transform active:scale-95 border border-rose-500 shadow-sm disabled:opacity-50"
            title="Resets SQLite / Simulator database to pristine baseline seed data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : '🔄 Reset Demo Data'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
