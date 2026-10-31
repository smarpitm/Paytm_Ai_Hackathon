import React from 'react';
import { Volume2, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import SoundboxDevice from '../components/SoundboxDevice';
import TelemetryLog from '../components/TelemetryLog';
import { processVoiceText } from '../lib/api';

export default function SoundboxPage({
  soundboxState,
  setSoundboxState,
  sessionState,
  telemetryLogs,
  lastReplyText,
  refreshDashboard
}) {
  const handleQuickPreset = async (text) => {
    try {
      if (setSoundboxState) setSoundboxState('PROCESSING');
      await processVoiceText(text, 'SOUNDBOX');
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Error running preset command:', err);
    } finally {
      if (setSoundboxState) setSoundboxState('IDLE');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Volume2 className="w-7 h-7 text-[#00BAF2]" />
            Paytm Soundbox IoT Simulator & Edge Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulates the authentic physical Paytm Soundbox hardware with real-time multi-key STT, Groq intent parsing, and LED feedback.
          </p>
        </div>
      </div>

      {/* Main Grid: Device Simulator on Left, Quick Presets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Device Column */}
        <div className="lg:col-span-5 flex justify-center">
          <SoundboxDevice
            soundboxState={soundboxState}
            setSoundboxState={setSoundboxState}
            sessionState={sessionState}
            lastReplyText={lastReplyText}
            refreshDashboard={refreshDashboard}
          />
        </div>

        {/* Quick Voice Presets Column */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00BAF2]" />
              <h2 className="text-base font-bold text-slate-100">Live Hackathon Voice Presets</h2>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              1-Click Audio Sim
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Use these 1-click test cards to simulate voice commands during live presentations without microphone interference:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Preset 1: Disambiguation */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Disambiguation Flow
                </span>
                <p className="text-xs text-slate-200 font-medium mt-2">
                  "Ramesh ko 250 ka tel udhaar diya"
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Triggers "Sharma ya Verma?" voice prompt.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickPreset('Ramesh ko 250 ka tel udhaar diya')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold border border-slate-700 flex items-center justify-center gap-1"
                >
                  <span>1. Say Command</span>
                </button>
                <button
                  onClick={() => handleQuickPreset('Sharma')}
                  className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg font-semibold border border-amber-500/40"
                  title="Answer disambiguation"
                >
                  2. "Sharma"
                </button>
              </div>
            </div>

            {/* Preset 2: New Customer Phone Capture */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                  New Customer Onboarding
                </span>
                <p className="text-xs text-slate-200 font-medium mt-2">
                  "Munna ko 120 ka doodh udhaar diya"
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prompts for 10-digit mobile number.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickPreset('Munna ko 120 ka doodh udhaar diya')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-semibold border border-slate-700 flex items-center justify-center gap-1"
                >
                  <span>1. Say Command</span>
                </button>
                <button
                  onClick={() => handleQuickPreset('9810012345')}
                  className="py-1.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded-lg font-semibold border border-purple-500/40"
                  title="Speak 10-digit number"
                >
                  2. "9810012345"
                </button>
              </div>
            </div>

            {/* Preset 3: Discount Broadcast */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                  Discount Broadcast
                </span>
                <p className="text-xs text-slate-200 font-medium mt-2">
                  "Aaj Aashirvaad Aata par 20 rupaye ki chhoot hai, sabhi pakke grahako ko message bhej do"
                </p>
              </div>

              <button
                onClick={() =>
                  handleQuickPreset(
                    'Aaj Aashirvaad Aata par 20 rupaye ki chhoot hai, sabhi pakke grahako ko message bhej do'
                  )
                }
                className="w-full py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white text-xs rounded-lg font-semibold border border-sky-500 flex items-center justify-center gap-1"
              >
                <span>Broadcast to Regulars</span>
              </button>
            </div>

            {/* Preset 4: Cash / UPI Sale */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Cash / UPI Sale
                </span>
                <p className="text-xs text-slate-200 font-medium mt-2">
                  "500 rupaye ka Fortune tel becha"
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Logs cash sale & updates credit score.
                </p>
              </div>

              <button
                onClick={() => handleQuickPreset('500 rupaye ka Fortune tel becha')}
                className="w-full py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs rounded-lg font-semibold border border-emerald-500 flex items-center justify-center gap-1"
              >
                <span>Log Instant Sale</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Panel: Telemetry Console */}
      <div className="w-full">
        <TelemetryLog telemetryLogs={telemetryLogs} />
      </div>

    </div>
  );
}

