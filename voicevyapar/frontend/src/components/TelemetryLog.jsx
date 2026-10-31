import React from 'react';
import { Terminal, ShieldCheck, Zap, Database } from 'lucide-react';

export default function TelemetryLog({ telemetryLogs = [] }) {
  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[380px]">
      
      {/* Console Header */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00BAF2]" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            Edge IoT & Multi-Key Telemetry Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-[10px] text-slate-400">LIVE FEED</span>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-4 font-mono text-xs overflow-y-auto space-y-3 flex-1 flex flex-col-reverse">
        {telemetryLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-12 italic">
            Waiting for voice events, Telegram callbacks, or WebSocket triggers...
          </div>
        ) : (
          telemetryLogs.map((log, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-slate-300 space-y-1 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-800/40">
                <span className="text-[#00BAF2] font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {log.event_type || 'EVENT'}
                </span>
                <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}</span>
              </div>

              {log.transcript && (
                <div className="text-amber-300">
                  <span className="text-slate-500">STT: </span>"{log.transcript}"
                </div>
              )}

              {log.parsed_intent && (
                <div className="bg-slate-950 p-2 rounded border border-slate-800/60 text-[11px] text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(log.parsed_intent, null, 2)}</pre>
                </div>
              )}

              {log.reply_text && (
                <div className="text-sky-300">
                  <span className="text-slate-500">REPLY: </span>{log.reply_text}
                </div>
              )}

              {log.conversation_session_state && (
                <div className="text-[10px] text-purple-400">
                  <span className="text-slate-500">STATE: </span>{log.conversation_session_state}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

