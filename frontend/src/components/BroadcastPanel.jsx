import React, { useState } from 'react';
import { Megaphone, Send, Sparkles, History, Users, Zap, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { sendDiscountBroadcast, processVoiceText } from '../lib/api';

export default function BroadcastPanel({ broadcasts = [], refreshDashboard }) {
  const [itemName, setItemName] = useState('Aashirvaad Aata (5kg)');
  const [discountText, setDiscountText] = useState('₹20 off today');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVoiceTriggering, setIsVoiceTriggering] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);

  // Trigger voice command via Soundbox engine
  const handleTriggerVoiceBroadcast = async () => {
    try {
      setIsVoiceTriggering(true);
      const voiceUtterance = "Aaj chini par 5 rupaye chhoot hai, sabhi pakke grahako ko message bhej do";
      await processVoiceText(voiceUtterance, "SOUNDBOX");
      setStatusNotification({
        type: 'success',
        text: '🎙️ Voice command executed on Soundbox! Promotional broadcast sent to 5 regular customers.',
      });
      if (refreshDashboard) {
        await refreshDashboard();
      }
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (err) {
      console.error('Failed to trigger voice broadcast:', err);
      setStatusNotification({
        type: 'error',
        text: 'Failed to process voice broadcast. Check backend connection.',
      });
      setTimeout(() => setStatusNotification(null), 4000);
    } finally {
      setIsVoiceTriggering(false);
    }
  };

  // Interactive Form Submission
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!itemName || !discountText) return;

    try {
      setIsSending(true);
      await sendDiscountBroadcast(itemName, discountText, customMessage || "");
      setStatusNotification({
        type: 'success',
        text: `📢 Promotional broadcast for "${itemName}" dispatched to 5 Regular Customers via Telegram!`,
      });
      setItemName('');
      setDiscountText('');
      setCustomMessage('');
      if (refreshDashboard) {
        await refreshDashboard();
      }
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (err) {
      console.error('Failed to send discount broadcast:', err);
      setStatusNotification({
        type: 'error',
        text: 'Failed to dispatch broadcast campaign.',
      });
      setTimeout(() => setStatusNotification(null), 4000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Voice Command Prompt Guide Banner (Highlighted Paytm Cyan card) */}
      <div className="bg-gradient-to-r from-[#002970]/90 to-slate-900 border-2 border-[#00BAF2] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#00BAF2]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#00BAF2]/20 border border-[#00BAF2]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#00BAF2]">
              <Sparkles className="w-5 h-5 text-[#00BAF2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00BAF2] bg-[#00BAF2]/10 px-2 py-0.5 rounded-full border border-[#00BAF2]/30">
                  Voice-Triggered Campaign
                </span>
                <span className="text-[11px] text-slate-400">Zero-Typing Marketing</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-1">
                🎙️ Say on Soundbox: <span className="text-[#00BAF2] font-mono italic">"Aaj chini par 5 rupaye chhoot hai, sabhi pakke grahako ko message bhej do"</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                The Soundbox parses item, discount amount, and broadcasts instant Telegram cards to all regular shoppers.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerVoiceBroadcast}
            disabled={isVoiceTriggering}
            className="px-4 py-2.5 rounded-xl bg-[#00BAF2] hover:bg-[#009fd0] active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform shrink-0 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{isVoiceTriggering ? 'Executing on Soundbox...' : '⚡ Trigger This Voice Broadcast Now'}</span>
          </button>
        </div>

        {statusNotification && (
          <div className={`mt-3 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
            statusNotification.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusNotification.text}</span>
          </div>
        )}
      </div>

      {/* Grid: Creator Form & Campaign History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Interactive Discount Broadcast Creator Form */}
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
              <Megaphone className="w-5 h-5 text-[#00BAF2]" />
              <h2 className="text-base font-bold text-slate-100">Send Discount Broadcast</h2>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instantly broadcast flash sales, clearance alerts, or festive discounts directly to your verified regular customers on Telegram.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Item Name <span className="text-[#00BAF2]">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Aashirvaad Aata (5kg)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BAF2] focus:ring-1 focus:ring-[#00BAF2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Discount Offer <span className="text-[#00BAF2]">*</span>
                </label>
                <input
                  type="text"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  placeholder="e.g. ₹20 off today"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BAF2] focus:ring-1 focus:ring-[#00BAF2]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Message <span className="text-slate-500 font-normal">(Optional Hindi Greeting)</span>
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Namaste Sharma Kirana ke pakke grahak! Aaj ke din vishesh chhoot..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00BAF2] focus:ring-1 focus:ring-[#00BAF2] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !itemName || !discountText}
                className="w-full mt-2 py-3 bg-[#00BAF2] hover:bg-[#00a2d3] active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>{isSending ? 'Dispatching to Telegram...' : '📢 Send Discount Broadcast to Regular Customers'}</span>
              </button>
            </form>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00BAF2]" />
            <span>Targeting: <strong className="text-slate-200">5 Regular Customers</strong> linked on Telegram</span>
          </div>
        </div>

        {/* 3. Campaign History Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#00BAF2]" />
                <h2 className="text-base font-bold text-slate-100">Campaign History</h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium font-mono">
                {broadcasts.length} campaigns executed
              </span>
            </div>

            <div className="space-y-3">
              {broadcasts.length === 0 ? (
                <div className="text-center py-16 text-slate-500 italic text-xs">
                  No promotional broadcasts recorded yet. Say a voice offer command or use the form on the left.
                </div>
              ) : (
                broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100">{b.item_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {b.discount_offer}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-mono leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                        {b.message_text}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] font-semibold">
                        <Users className="w-3.5 h-3.5 text-[#00BAF2]" />
                        <span>👥 {b.recipients_count || 5} Regular Customers</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] mt-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{b.created_at ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Synchronized with Telegram bot channel for Sharma Kirana Store</span>
            <span className="text-[#00BAF2] font-semibold font-mono">100% Delivery Rate</span>
          </div>
        </div>

      </div>

    </div>
  );
}
