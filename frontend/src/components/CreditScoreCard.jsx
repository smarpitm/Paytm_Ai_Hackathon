import React, { useState } from 'react';
import { Award, Zap, CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function CreditScoreCard({ creditScore }) {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanDisbursed, setLoanDisbursed] = useState(false);

  const score = creditScore?.score || 764;
  const maxScore = creditScore?.max_score || 900;
  const tier = creditScore?.rating_tier || 'EXCELLENT (Gold Merchant)';
  const loanAmount = creditScore?.pre_approved_loan_amount || 35000;
  const factors = creditScore?.factors || [
    { label: 'Daily UPI Inflow Velocity', impact: '+115 pts', detail: '₹3,700 verified digital inflow today' },
    { label: 'Udhaar Recovery Ratio', impact: '+84 pts', detail: '78% of voice khata dues recovered within 7 days' },
    { label: 'Active Voice Bookkeeping', impact: '+35 pts', detail: '14 structured voice ledger entries logged' },
    { label: 'Repeat Customer Graph', impact: '+30 pts', detail: '5 verified repeat Paytm QR shoppers' },
  ];

  // Gauge calculation (percentage between 300 and 900)
  const pct = Math.min(100, Math.max(0, ((score - 300) / (maxScore - 300)) * 100));

  const handleDisburse = () => {
    setLoanDisbursed(true);
    setTimeout(() => {
      setShowLoanModal(false);
      setLoanDisbursed(false);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Radial/Linear Gauge & Overview */}
      <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col items-center text-center justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 w-full justify-center mb-6">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Paytm Creditworthiness Score</h2>
          </div>

          {/* Score Badge */}
          <div className="relative my-4 flex flex-col items-center">
            <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center relative bg-slate-950 shadow-inner">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#00BAF2]">
                {score}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5">/ {maxScore}</span>
            </div>
            
            <span className="mt-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {tier}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2 px-2">
            Calculated dynamically from real-time UPI transaction velocity and voice-logged Khata recovery.
          </p>
        </div>

        {/* Pre-Approved Loan Offer Button */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowLoanModal(true)}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-[#00BAF2] hover:opacity-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Pre-Approved ₹{loanAmount.toLocaleString()} Loan</span>
          </button>
        </div>
      </div>

      {/* Explainable Score Breakdown */}
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00BAF2]" />
              <h2 className="text-base font-bold text-slate-100">Explainable Scoring Factors</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">100% Deterministic</span>
          </div>

          <div className="space-y-3">
            {factors.map((f, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{f.label}</div>
                  <div className="text-[11px] text-slate-400">{f.detail}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {f.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>No credit bureau pull required. Underwritten instantly on Paytm Merchant payment graph.</span>
        </div>
      </div>

      {/* Loan Disbursal Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00BAF2]" />
              Paytm Merchant Working Capital Advance
            </h3>

            <p className="text-xs text-slate-300 mt-2">
              Zero-paperwork collateral-free credit line instantly credited to your linked Paytm Merchant Bank Account.
            </p>

            <div className="my-5 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pre-Approved Limit:</span>
                <span className="font-bold text-emerald-400 text-sm">₹{loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Interest:</span>
                <span className="font-semibold text-slate-200">1.25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Repayment Mechanism:</span>
                <span className="font-semibold text-slate-200">Auto-Deducted from daily Paytm QR</span>
              </div>
            </div>

            {loanDisbursed ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>₹{loanAmount.toLocaleString()} Disbursed to Bank Account!</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisburse}
                  className="flex-1 py-2.5 rounded-xl bg-[#00BAF2] hover:bg-[#00a2d3] text-slate-950 text-xs font-bold shadow-md"
                >
                  1-Click Disburse
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

