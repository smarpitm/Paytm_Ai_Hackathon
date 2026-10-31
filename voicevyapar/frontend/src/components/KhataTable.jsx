import React, { useState } from 'react';
import { Send, CheckCircle, UserCheck, Phone, ArrowUpRight, Clock, Star } from 'lucide-react';
import { sendKhataReminder, simulateUpiSettlement } from '../lib/api';

export default function KhataTable({ customers = [], transactions = [], refreshDashboard }) {
  const [loadingAction, setLoadingAction] = useState(null);

  const handleRemind = async (customerId) => {
    try {
      setLoadingAction(`remind-${customerId}`);
      await sendKhataReminder(customerId);
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Failed to send reminder:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSettle = async (customerId, balance) => {
    try {
      setLoadingAction(`settle-${customerId}`);
      await simulateUpiSettlement(customerId, balance || 100);
      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Failed to settle UPI:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Customers Udhaar Ledger */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#00BAF2]" />
              Voice Khata & Regular Customer Directory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Udhaar ledger automatically synchronized via Soundbox voice commands and Paytm QR scans
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            {customers.length} Customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone & UPI</th>
                <th className="px-6 py-3">Telegram Demo Link</th>
                <th className="px-6 py-3 text-right">Udhaar Balance</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    No customers found. Click 'Reset Demo' on top right to seed sample data.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">{c.name}</span>
                        {c.is_regular && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Star className="w-2.5 h-2.5" /> Regular
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Visits: {c.visit_count}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {c.upi_vpa || 'Auto-Synced via Paytm'}
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      {c.telegram_chat_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Phone Linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                          Send /link {c.name.split(' ')[0]} to Bot
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {c.total_udhaar_balance > 0 ? (
                        <span className="font-bold text-sm text-rose-400">
                          ₹{c.total_udhaar_balance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-medium text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Settled (₹0)
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.total_udhaar_balance > 0 && (
                          <>
                            <button
                              onClick={() => handleRemind(c.id)}
                              disabled={loadingAction === `remind-${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Send Telegram UPI QR Payment Reminder"
                            >
                              <Send className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                            <button
                              onClick={() => handleSettle(c.id, c.total_udhaar_balance)}
                              disabled={loadingAction === `settle-${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Simulate Instant UPI Settlement"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Settle</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00BAF2]" />
            Recent Voice & UPI Transactions
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} entries today
          </span>
        </div>

        <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 italic text-xs">
              No transactions recorded today.
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-3 flex items-center justify-between text-xs hover:bg-slate-800/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.tx_type === 'UPI_SALE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : tx.tx_type === 'UDHAAR_GIVEN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {tx.tx_type}
                    </span>
                    <span className="font-semibold text-slate-200">{tx.item_name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({tx.quantity_text})</span>
                  </div>
                  {tx.raw_voice_transcript && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{tx.raw_voice_transcript}"
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-slate-100">
                    ₹{tx.amount.toFixed(2)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      tx.is_settled ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.is_settled ? 'Settled' : 'Pending'}
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

