import React, { useState } from 'react';
import {
  Terminal,
  Zap,
  Key,
  Database,
  Cpu,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Moon,
  Radio,
  Send,
  Sparkles
} from 'lucide-react';

export default function TelemetryLog({ telemetryLogs = [] }) {
  const [filter, setFilter] = useState('ALL');
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Filter logs
  const filteredLogs = telemetryLogs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'VOICE') return log.event_type === 'VOICE_PROCESSED';
    if (filter === 'UPI') return log.event_type === 'UPI_PAYMENT_RECEIVED';
    if (filter === 'BRIEF') return log.event_type === 'NIGHTLY_BRIEF';
    if (filter === 'BROADCAST') return log.event_type === 'BROADCAST_SENT';
    return true;
  });

  const handleCopyJson = (log, idx) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'VOICE_PROCESSED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-[#00BAF2] border border-[#00BAF2]/40 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00BAF2]" />
            VOICE_PROCESSED
          </span>
        );
      case 'UPI_PAYMENT_RECEIVED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            UPI_PAYMENT_RECEIVED
          </span>
        );
      case 'NIGHTLY_BRIEF':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <Moon className="w-3 h-3 text-purple-400" />
            NIGHTLY_BRIEF
          </span>
        );
      case 'BROADCAST_SENT':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
            <Send className="w-3 h-3 text-sky-400" />
            BROADCAST_SENT
          </span>
        );
      case 'DEMO_RESET':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Database className="w-3 h-3 text-amber-400" />
            DEMO_RESET
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {type || 'EVENT'}
          </span>
        );
    }
  };

  const getSessionBadge = (state) => {
    switch (state) {
      case 'AWAITING_DISAMBIGUATION':
        return (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
            STATE: AWAITING_DISAMBIGUATION
          </span>
        );
      case 'AWAITING_NEW_CUSTOMER_PHONE':
        return (
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30">
            STATE: AWAITING_NEW_CUSTOMER_PHONE
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            STATE: IDLE
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[460px]">
      
      {/* Top Console Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Console Title */}
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#00BAF2]" />
          <div>
            <h2 className="font-mono text-xs font-bold text-slate-100 flex items-center gap-2">
              Paytm Edge IoT Telemetry & Multi-Key LLM Stream
              <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE WS
              </span>
            </h2>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
          {['ALL', 'VOICE', 'UPI', 'BRIEF', 'BROADCAST'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === cat
                  ? 'bg-[#00BAF2] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Terminal Content Feed */}
      <div className="p-4 font-mono text-xs overflow-y-auto space-y-3 flex-1 max-h-[500px]">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-16 flex flex-col items-center justify-center space-y-2">
            <Radio className="w-8 h-8 text-slate-700 animate-pulse" />
            <p className="text-xs">
              Listening for real-time Edge WebSocket events (Voice commands, Telegram UPI settlements, Nightly Briefs)...
            </p>
            <p className="text-[11px] text-slate-700">
              Click any quick preset button above or hold the microphone to trigger a live telemetry stream.
            </p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const groqIdx = log.parsed_intent?._meta?.groq_key_index || 1;
            const modelUsed = log.parsed_intent?._meta?.model_used || 'llama-3.3-70b-versatile';
            const sarvamIdx = log.sarvam_key_index || 1;
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })
              : new Date().toLocaleTimeString('en-US', { hour12: false });

            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 text-slate-300 space-y-2.5 hover:border-slate-700 transition-colors shadow-lg"
              >
                
                {/* Event Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {getEventBadge(log.event_type)}
                    <span className="text-[11px] text-slate-400 font-semibold">{timeStr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Multi-Key Pool Metadata */}
                    <span className="text-[10px] font-mono text-cyan-300/90 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                      <Key className="w-2.5 h-2.5 text-cyan-400" />
                      Sarvam Key #{sarvamIdx} • Groq Key #{groqIdx} [{modelUsed}]
                    </span>

                    {/* Copy Raw JSON button */}
                    <button
                      onClick={() => handleCopyJson(log, idx)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                      title="Copy JSON Payload"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Spoken Voice STT Transcript */}
                {log.transcript && (
                  <div className="text-amber-300 text-xs flex items-start gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      🗣️ STT Transcript:
                    </span>
                    <span className="font-semibold italic">"{log.transcript}"</span>
                  </div>
                )}

                {/* Special Card for Incoming Telegram UPI Settlement */}
                {log.event_type === 'UPI_PAYMENT_RECEIVED' && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>📱 Telegram Instant Settlement Webhook:</span>
                      <span className="text-sm font-black">₹{log.amount} RECEIVED</span>
                    </div>
                    <div className="text-[11px] text-emerald-200/80">
                      Customer: <span className="font-bold text-white">{log.customer_name || 'Customer'}</span> (ID #{log.customer_id}) • Remaining Khata Balance: <span className="font-bold text-white">₹{log.remaining_balance ?? 0}</span>
                    </div>
                    {log.credit_score && (
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Paytm Credit Score Recalculated: {log.credit_score.score} ({log.credit_score.rating_tier})</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Nightly Briefing Aggregates */}
                {log.event_type === 'NIGHTLY_BRIEF' && (
                  <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-3 text-purple-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-purple-300">
                      <span>🌙 End-of-Day Store Summary:</span>
                      <span className="text-sm font-black text-white">Total: ₹{log.total_daily_sales?.toLocaleString('en-IN') ?? 4250}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex flex-wrap gap-x-4">
                      <span>UPI Sales: <strong className="text-emerald-400">₹{log.total_upi_sales?.toLocaleString('en-IN') ?? 3450}</strong></span>
                      <span>Unsettled Udhaar: <strong className="text-amber-400">₹{log.total_unsettled_udhaar?.toLocaleString('en-IN') ?? 800}</strong></span>
                      <span>Top Item: <strong className="text-cyan-400">{log.top_item || log.top_item_name || 'Aashirvaad Aata'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Syntax-Formatted LLM JSON Output */}
                {log.parsed_intent && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
                    <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-1 font-bold">
                      Parsed Intent Structure (Groq LLM):
                    </div>
                    <pre className="text-emerald-300 leading-relaxed font-mono">
                      {JSON.stringify(log.parsed_intent, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Spoken Reply Text & Multi-turn Session State */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50">
                  {log.reply_text && (
                    <div className="text-sky-300 text-xs flex items-center gap-1">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        🔊 Soundbox Reply:
                      </span>
                      <span className="italic">"{log.reply_text}"</span>
                    </div>
                  )}

                  {log.conversation_session_state && (
                    <div>{getSessionBadge(log.conversation_session_state)}</div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
