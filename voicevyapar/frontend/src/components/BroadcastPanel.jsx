import React, { useState } from 'react';
import { Megaphone, Send, Sparkles, History, Users } from 'lucide-react';
import { sendDiscountBroadcast } from '../lib/api';

export default function BroadcastPanel({ broadcasts = [], refreshDashboard }) {
  const [itemName, setItemName] = useState('Aashirvaad Aata');
  const [discountText, setDiscountText] = useState('₹20 off per 5kg pack');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!itemName || !discountText) return;

    try {
      setIsSending(true);
      await sendDiscountBroadcast(itemName, discountText, customMessage || null);
      setItemName('');
      setDiscountText('');
      setCustomMessage('');
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Failed to send broadcast:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Broadcast Creator Form */}
      <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
            <Megaphone className="w-5 h-5 text-[#00BAF2]" />
            <h2 className="text-base font-bold text-slate-100">Send Discount Broadcast</h2>
          </div>

          {/* Voice Prompt Tip */}
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 text-xs text-sky-200 mb-4 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#00BAF2] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#00BAF2]">Voice-Triggered Campaign:</span>
              <p className="italic mt-0.5 text-slate-300">
                "Aaj chini par ₹5 chhoot hai, sabhi pakke grahako ko message bhej do"
              </p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Item Name</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Fortune Tel, Aashirvaad Aata"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00BAF2]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Discount Offer</label>
              <input
                type="text"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                placeholder="e.g. ₹20 off, 10% discount"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00BAF2]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Custom Message (Optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                placeholder="Localized promotional greeting for Telegram..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00BAF2]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-2 py-3 bg-[#00BAF2] hover:bg-[#00a2d3] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isSending ? 'Broadcasting...' : 'Broadcast to Regulars'}</span>
            </button>
          </form>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Broadcasts reach customers marked as Regular on Telegram</span>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00BAF2]" />
            <h2 className="text-base font-bold text-slate-100">Campaign History</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {broadcasts.length} broadcasts sent
          </span>
        </div>

        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic text-xs">
              No promotional broadcasts recorded yet. Say an offer command or use the form on the left.
            </div>
          ) : (
            broadcasts.map((b) => (
              <div
                key={b.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{b.item_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {b.discount_offer}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{b.message_text}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {b.created_at ? new Date(b.created_at).toLocaleTimeString() : 'Today'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-medium mt-1">
                    <Users className="w-3 h-3" /> {b.recipients_count || 5} Regulars
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

