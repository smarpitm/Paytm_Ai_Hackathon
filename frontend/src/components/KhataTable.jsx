import React, { useState } from 'react';
import { Send, CheckCircle, UserCheck, Phone, Clock, Star, QrCode, X, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';
import { sendKhataReminder, simulateUpiSettlement } from '../lib/api';

export default function KhataTable({ customers = [], transactions = [], refreshDashboard }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [qrModalData, setQrModalData] = useState(null); // { customer, amount, caption, qrBase64, delivered }

  const handleRemind = async (customer) => {
    try {
      setLoadingAction(`remind-${customer.id}`);
      const res = await sendKhataReminder(customer.id);
      
      const amt = customer.total_udhaar_balance || 150.0;
      setQrModalData({
        customer,
        amount: amt,
        caption: res?.caption || `🙏 Namaste ${customer.name} ji!\nSharma Kirana Store par aapka naya udhaar darj hua hai:\n🛒 Item: Kirana Dues\n💰 Amount: ₹${amt.toFixed(2)}\n📊 Kul Baaki Udhaar: ₹${amt.toFixed(2)}\n\nScan the Paytm QR above or tap the button below to pay instantly:`,
        qrBase64: res?.qr_base64 || '',
        delivered: res?.delivered ?? true,
      });

      if (refreshDashboard) refreshDashboard();
    } catch (err) {
      console.error('Failed to send reminder:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSettle = async (customer, balance) => {
    const amt = balance || customer.total_udhaar_balance || 150.0;
    try {
      setLoadingAction(`settle-${customer.id}`);
      await simulateUpiSettlement(customer.id, amt);
      if (qrModalData && qrModalData.customer?.id === customer.id) {
        setQrModalData(null);
      }
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
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium font-mono">
            {customers.length} Regular Customers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone & Onboarding Source</th>
                <th className="px-6 py-3">Telegram Demo Link</th>
                <th className="px-6 py-3 text-right">Udhaar Balance</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    No customers found. Click 'Reset Demo Data' on top right to seed sample kirana records.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isAutoSynced = (c.visit_count ?? 1) > 1;
                  const firstName = (c.name || 'Customer').split(' ')[0];

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Customer Name & Regular Badge */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{c.name}</span>
                          {c.is_regular && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>⭐ Regular Customer</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          Visits: {c.visit_count ?? 1} • Lifetime: ₹{(c.total_lifetime_spend ?? 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Phone & Source Badge */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#00BAF2]" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="mt-1">
                          {isAutoSynced ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              📱 {c.phone} • Auto-Synced via Paytm QR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              📱 {c.phone} • 🎙️ Added via Voice
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Telegram Live Link Status */}
                      <td className="px-6 py-3.5">
                        {c.telegram_chat_id ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>🟢 Phone Linked</span>
                          </span>
                        ) : (
                          <a
                            href={`https://t.me/Paytm_01bot?start=link_${firstName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-[11px] font-mono transition-colors"
                            title="Click to open @Paytm_01bot and link this customer on your phone Telegram"
                          >
                            <span>📱 Link {firstName}</span>
                          </a>
                        )}
                      </td>

                      {/* Udhaar Balance */}
                      <td className="px-6 py-3.5 text-right">
                        {c.total_udhaar_balance > 0 ? (
                          <span className="inline-block font-black text-sm px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                            ₹{c.total_udhaar_balance.toFixed(2)} Due
                          </span>
                        ) : (
                          <span className="inline-block font-semibold text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Settled (₹0)
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.total_udhaar_balance > 0 ? (
                            <>
                              <button
                                onClick={() => handleRemind(c)}
                                disabled={loadingAction === `remind-${c.id}`}
                                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                                title="Generate Paytm UPI QR and dispatch Telegram payment reminder"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>📲 Send Telegram QR Reminder</span>
                              </button>

                              <button
                                onClick={() => handleSettle(c, c.total_udhaar_balance)}
                                disabled={loadingAction === `settle-${c.id}`}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                                title="Simulate Instant UPI Settlement from judge dashboard"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>✅ Simulate UPI Settlement</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-xs italic">All dues settled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive QR Reminder Preview Modal */}
      {qrModalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#002970] border border-[#00BAF2] flex items-center justify-center text-[#00BAF2]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Paytm UPI QR Payment Reminder</h3>
                  <p className="text-[11px] text-slate-400">Live Telegram dispatch to {qrModalData.customer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setQrModalData(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery Status Indicator & Quick Connect */}
            <div className="flex flex-col gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Telegram Destination:</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${qrModalData.delivered ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{qrModalData.delivered ? '🟢 Dispatched to Phone' : '🟡 Demo Channel Ready (Tap to Link)'}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">Link your phone for live alerts:</span>
                <a
                  href={`https://t.me/Paytm_01bot?start=link_${encodeURIComponent(qrModalData.customer.name.split(' ')[0])}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#00BAF2] hover:bg-[#00a3d4] text-[#002970] font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all shadow-sm"
                >
                  <span>📱 Open @Paytm_01bot on Telegram</span>
                </a>
              </div>
            </div>

            {/* Generated Paytm Navy Blue UPI QR Image */}
            <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-inner">
              <div className="w-full text-center pb-2 mb-2 border-b border-slate-200">
                <span className="font-black tracking-tight text-xs text-[#002970]">Paytm Accepted Here</span>
              </div>
              {qrModalData.qrBase64 ? (
                <img
                  src={qrModalData.qrBase64}
                  alt="Paytm Dynamic UPI QR"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
              <div className="mt-2 text-center">
                <span className="font-mono text-xs font-bold text-slate-900">
                  Amount: ₹{qrModalData.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Hindi Caption Text Box */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {qrModalData.caption}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQrModalData(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleSettle(qrModalData.customer, qrModalData.amount)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simulate Phone Pay</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Live Transaction Feed (Below Customer Table) */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00BAF2]" />
            <h3 className="text-sm font-bold text-slate-100">
              Live Voice & Edge Transaction Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} transactions recorded
          </span>
        </div>

        <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No transactions recorded today.
            </div>
          ) : (
            transactions.map((tx) => {
              const channel = tx.source_channel || 'SOUNDBOX';

              return (
                <div key={tx.id} className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Transaction Type Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.tx_type === 'UPI_SALE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.tx_type === 'UDHAAR_GIVEN'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/10 text-[#00BAF2] border border-[#00BAF2]/30'
                        }`}
                      >
                        {tx.tx_type}
                      </span>

                      {/* Source Channel Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          channel === 'TELEGRAM'
                            ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {channel === 'TELEGRAM' ? '📱 TELEGRAM' : '🔊 SOUNDBOX'}
                      </span>

                      <span className="font-semibold text-xs text-slate-100">{tx.item_name}</span>
                      {tx.quantity_text && (
                        <span className="text-slate-400 font-mono text-[11px]">({tx.quantity_text})</span>
                      )}
                      {tx.customer_name && (
                        <span className="text-slate-300 text-[11px] font-medium">• {tx.customer_name}</span>
                      )}
                    </div>

                    {/* Raw Voice Transcript */}
                    {tx.raw_voice_transcript && (
                      <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
                        <span>🎙️</span>
                        <span>"{tx.raw_voice_transcript}"</span>
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0">
                    <div className="font-bold text-sm text-slate-100">
                      ₹{Number(tx.amount || 0).toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        tx.is_settled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.is_settled ? 'Settled' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
