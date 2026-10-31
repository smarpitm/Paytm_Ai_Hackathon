import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RefreshCw, Volume2, LayoutDashboard, Bot } from 'lucide-react';
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
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* 1. Far Left: Paytm VoiceVyapar Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#00BAF2] flex items-center justify-center font-black text-[#002970] shadow-md tracking-tighter text-xs">
            paytm
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                Paytm VoiceVyapar
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00BAF2]/20 text-[#00BAF2] border border-[#00BAF2]/30 leading-none">
                Track 1
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium leading-tight">
              AI Merchant Copilot & IoT Soundbox
            </span>
          </div>
        </div>

        {/* 2. Center: Aligned Tab Switcher */}
        <nav className="flex items-center gap-1 bg-[#001844] p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <NavLink
            to="/soundbox"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-[#002970] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 IoT Soundbox</span>
          </NavLink>
          <NavLink
            to="/erp"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-[#002970] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>📊 Merchant ERP</span>
          </NavLink>
        </nav>

        {/* 3. Far Right: Phone Connect & Reset Demo Button */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          {/* Telegram Phone Connect Link */}
          <a
            href="https://t.me/Paytm_01bot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 font-semibold transition-all hover:scale-105 shadow-sm"
            title="Click to open @Paytm_01bot on Telegram and link your phone"
          >
            <Bot className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span>📱 Connect Phone</span>
          </a>

          {/* Reset Demo Data Button on Far Right */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all active:scale-95 border border-rose-400/40 shadow-sm disabled:opacity-50"
            title="Resets SQLite / Simulator database to pristine baseline seed data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : '🔄 Reset Demo'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
