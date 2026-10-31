import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  PhoneCall,
  UserCheck,
  Send,
  Zap,
  Radio,
  ShoppingBag,
  MessageSquare,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import SoundboxDevice from '../components/SoundboxDevice';
import TelemetryLog from '../components/TelemetryLog';
import { processVoiceText } from '../lib/api';

export default function SoundboxPage({
  soundboxState,
  setSoundboxState,
  sessionState,
  telemetryLogs = [],
  lastReplyText,
  refreshDashboard
}) {
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract latest dynamic QR & TTS audio from telemetry stream
  const latestEvent = telemetryLogs.length > 0 ? telemetryLogs[0] : null;
  const qrPreviewBase64 = latestEvent?.qr_preview_base64 || null;
  const ttsAudioBase64 = latestEvent?.tts_audio_base64 || null;

  const handleQuickPreset = async (text) => {
    if (!text || isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (setSoundboxState) setSoundboxState('PROCESSING');
      await processVoiceText(text, 'SOUNDBOX');
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('[Preset] Execution error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCustomText = (e) => {
    e?.preventDefault();
    if (!customText.trim()) return;
    const toSend = customText.trim();
    setCustomText('');
    handleQuickPreset(toSend);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00BAF2]/10 border border-[#00BAF2]/30 text-[#00BAF2]">
              <Volume2 className="w-6 h-6 text-[#00BAF2]" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                Live IoT Soundbox Hardware Simulator
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic Paytm Soundbox replica with 360° animated LED ring, real-time Sarvam STT/TTS, and multi-turn state machine.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Chip */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Edge Hardware:</span>
            <strong className="text-emerald-400 font-bold uppercase">{soundboxState}</strong>
          </span>
        </div>
      </div>

      {/* Multi-Turn Session State Banner */}
      {sessionState === 'AWAITING_DISAMBIGUATION' ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Multi-Turn Loop Active
              </span>
              <h2 className="text-sm font-bold text-slate-100 mt-1">
                Disambiguation Required: "Khata mein do Ramesh hain — Ramesh Sharma ya Ramesh Verma?"
              </h2>
              <p className="text-xs text-slate-400">
                The AI detected multiple matching khata accounts. Speak surname or click an answer below:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleQuickPreset('Sharma')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>1. "Ramesh Sharma" (Khata: ₹150)</span>
            </button>
            <button
              onClick={() => handleQuickPreset('Verma')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>2. "Ramesh Verma" (Khata: ₹0)</span>
            </button>
          </div>
        </div>
      ) : sessionState === 'AWAITING_NEW_CUSTOMER_PHONE' ? (
        <div className="bg-purple-500/10 border-2 border-purple-500/50 rounded-2xl p-4 shadow-[0_0_25px_rgba(168,85,247,0.25)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                New Customer Voice Onboarding
              </span>
              <h2 className="text-sm font-bold text-slate-100 mt-1">
                Phone Number Required: "Naya grahak Munna khata mein darj nahi hai. Unka 10-digit number boliye:"
              </h2>
              <p className="text-xs text-slate-400">
                VoiceVyapar automatically creates a new customer profile and opens their voice khata ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleQuickPreset('9810012345')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Speak: "9810012345"</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">
              Session State: <strong className="text-emerald-400 font-mono">IDLE</strong> — Ready for natural Hindi/Hinglish merchant utterances.
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
            Conversational State Machine v1.0
          </span>
        </div>
      )}

      {/* Main Grid: Left Column Soundbox Hardware Replica, Right Column Quick Voice Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D Soundbox Hardware Replica */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <SoundboxDevice
            soundboxState={soundboxState}
            setSoundboxState={setSoundboxState}
            sessionState={sessionState}
            lastReplyText={lastReplyText}
            qrPreviewBase64={qrPreviewBase64}
            ttsAudioBase64={ttsAudioBase64}
            refreshDashboard={refreshDashboard}
          />
        </div>

        {/* Right Column: Hackathon Failsafe Quick-Voice Presets (Exact PRD Section 9.2.2) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00BAF2]" />
              <div>
                <h2 className="text-base font-black text-slate-100 tracking-tight">
                  Hackathon Failsafe Quick-Voice Presets
                </h2>
                <p className="text-[11px] text-slate-400">
                  Instant 1-click execution cards to demonstrate live features without microphone interference.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00BAF2]/10 text-[#00BAF2] border border-[#00BAF2]/30">
              PRD 9.2.2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preset 1: Disambiguation Flow */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Preset 1 • Disambiguation
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">2-Step Flow</span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-2">
                  "Ramesh ko 250 ka tel udhaar diya"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers Soundbox question: <em>"Khata mein do Ramesh hain — Sharma ya Verma?"</em>
                </p>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <button
                  onClick={() => handleQuickPreset('Ramesh ko 250 ka tel udhaar diya')}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                >
                  <span>1A. 🗣️ Say "Ramesh ko 250 ka tel udhaar diya"</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickPreset('Sharma')}
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg font-bold border border-amber-500/40 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    1B. 🗣️ "Sharma"
                  </button>
                  <button
                    onClick={() => handleQuickPreset('Verma')}
                    disabled={isSubmitting}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg font-medium border border-slate-700 transition-colors active:scale-95 disabled:opacity-50"
                  >
                    1C. 🗣️ "Verma"
                  </button>
                </div>
              </div>
            </div>

            {/* Preset 2: New Customer Voice Phone Onboarding */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                    Preset 2 • New Customer
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Voice Onboarding</span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-2">
                  "Munna ko 120 ka doodh udhaar diya"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Customer not found in DB. Soundbox asks for 10-digit mobile number.
                </p>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <button
                  onClick={() => handleQuickPreset('Munna ko 120 ka doodh udhaar diya')}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                >
                  <span>2A. 🗣️ Say "Munna ko 120 ka doodh udhaar diya"</span>
                </button>
                <button
                  onClick={() => handleQuickPreset('9810012345')}
                  disabled={isSubmitting}
                  className="w-full py-1.5 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 text-xs rounded-lg font-bold border border-purple-500/40 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>2B. 🗣️ Speak Phone: "9810012345"</span>
                </button>
              </div>
            </div>

            {/* Preset 3: Regular Customer Discount Broadcast */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-sky-500/40 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                    Preset 3 • Promo Campaign
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Telegram Alert</span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-2">
                  "Aaj Aashirvaad Aata par 20 rupaye ki chhoot hai, sabhi pakke grahako ko message bhej do"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dispatches Telegram broadcast to regular shoppers & confirms via voice.
                </p>
              </div>

              <div className="pt-1 border-t border-slate-800/60">
                <button
                  onClick={() =>
                    handleQuickPreset(
                      'Aaj Aashirvaad Aata par 20 rupaye ki chhoot hai, sabhi pakke grahako ko message bhej do'
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full py-2 bg-sky-600/80 hover:bg-sky-600 text-white text-xs rounded-xl font-bold border border-sky-500 flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>3. 🗣️ Broadcast Offer to Regulars</span>
                </button>
              </div>
            </div>

            {/* Preset 4: Cash / UPI Item Sale */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Preset 4 • Instant Sale
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Score Bump</span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-2">
                  "500 rupaye ka Fortune tel becha"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Logs cash/UPI sale, recalculates daily metrics & dynamically upgrades credit score.
                </p>
              </div>

              <div className="pt-1 border-t border-slate-800/60">
                <button
                  onClick={() => handleQuickPreset('500 rupaye ka Fortune tel becha')}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs rounded-xl font-bold border border-emerald-500 flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>4. 🗣️ Log ₹500 Sale</span>
                </button>
              </div>
            </div>

          </div>

          {/* Custom Hinglish Voice Command Input Bar */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#00BAF2]" />
                Custom Hinglish Voice Command Input:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Typed Fallback</span>
            </div>

            <form onSubmit={handleSendCustomText} className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type any custom Hinglish voice command (e.g., 'Sunita Devi ka hisaab batao')..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BAF2] focus:ring-1 focus:ring-[#00BAF2]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !customText.trim()}
                className="px-4 py-2 bg-[#00BAF2] hover:bg-[#00a2d3] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Send</span>
              </button>
            </form>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
              <span className="text-slate-500 text-[10px]">Try:</span>
              {[
                'Sunita Devi ka kitna hisaab baaki hai?',
                'Aaj ki bikri batao',
                '200 rupaye ki chini bechi'
              ].map((query, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPreset(query)}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700/80 hover:border-[#00BAF2] transition-colors"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Panel: Real-Time Edge Telemetry Console */}
      <div className="w-full">
        <TelemetryLog telemetryLogs={telemetryLogs} />
      </div>

    </div>
  );
}
