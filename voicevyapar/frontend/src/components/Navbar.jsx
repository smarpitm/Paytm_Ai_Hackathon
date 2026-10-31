import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, RefreshCw, Volume2, LayoutDashboard, Cpu, Bot } from 'lucide-react';
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

  const sarvamActive = apiPoolStatus?.sarvam_active_index || 1;
  const sarvamTotal = apiPoolStatus?.sarvam_total_keys || 3;
  const groqActive = apiPoolStatus?.groq_active_index || 1;
  const groqTotal = apiPoolStatus?.groq_total_keys || 3;

  return (
    <header className="bg-[#002970] text-white border-b border-[#001844] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00BAF2] flex items-center justify-center font-bold text-slate-900 shadow-sm">
            VV
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
              Paytm VoiceVyapar
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00BAF2]/20 text-[#00BAF2] border border-[#00BAF2]/30">
                Track 1
              </span>
            </h1>
            <p className="text-xs text-slate-300">AI-Powered Merchant CFO & Soundbox Copilot</p>
          </div>
        </div>

        {/* Page Switcher Pills */}
        <nav className="flex items-center gap-2 bg-[#001844] p-1 rounded-xl border border-slate-700/50">
          <NavLink
            to="/soundbox"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Volume2 className="w-4 h-4" />
            <span>Soundbox Simulator</span>
          </NavLink>
          <NavLink
            to="/erp"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#00BAF2] text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Merchant ERP</span>
          </NavLink>
        </nav>

        {/* Status Indicators & Reset Action */}
        <div className="flex items-center gap-3">
          {/* WS Edge Status */}
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              wsConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title={wsConnected ? 'Connected to Edge WebSocket' : 'Disconnected from Edge WebSocket'}
          >
            <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{wsConnected ? 'Edge Connected' : 'Offline'}</span>
          </div>

          {/* Key Pool Status */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span>Sarvam #{sarvamActive}/{sarvamTotal} • Groq #{groqActive}/{groqTotal}</span>
          </div>

          {/* Telegram Status */}
          <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300">
            <Bot className="w-3.5 h-3.5" />
            <span>Telegram Bot Active</span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border border-rose-500 shadow-sm disabled:opacity-50"
            title="Reset SQLite DB and session to fresh Kirana state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}

