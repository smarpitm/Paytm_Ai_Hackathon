import React, { useState } from 'react';
import { Award, Zap, CheckCircle2, TrendingUp, AlertCircle, ShieldCheck, ArrowUpRight, Building2, Landmark, X } from 'lucide-react';

export default function CreditScoreCard({ creditScore }) {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanDisbursed, setLoanDisbursed] = useState(false);

  const score = creditScore?.score || 764;
  const maxScore = creditScore?.max_score || 900;
  const tier = creditScore?.rating_tier || 'EXCELLENT (Gold Merchant)';
  const loanAmount = creditScore?.pre_approved_loan_amount || 35000;
  const monthlyRate = creditScore?.interest_rate_monthly || '1.25%';
  const origFee = creditScore?.origination_fee_pct || '1.0%';

  const factors = creditScore?.factors || [
    { label: 'Daily UPI Inflow Velocity', impact: '+115 pts', detail: '₹3,700 verified digital inflow today' },
    { label: 'Udhaar Recovery Ratio', impact: '+84 pts', detail: '78% of voice khata dues recovered within 7 days' },
    { label: 'Active Voice Bookkeeping', impact: '+35 pts', detail: '14 structured voice ledger entries logged' },
    { label: 'Repeat Customer Graph', impact: '+30 pts', detail: '5 verified repeat Paytm QR shoppers' },
  ];

  // Radial Gauge Math: 300 to 900 (span = 600)
  // Arc radius = 85, length = PI * 85 ~= 267.04
  const clampedScore = Math.min(900, Math.max(300, score));
  const normalizedFraction = (clampedScore - 300) / 600; // 0.0 to 1.0
  const needleAngle = normalizedFraction * 180; // 0 to 180 degrees (left to right)

  const handleDisburseClick = () => {
    setLoanDisbursed(true);
  };

  const handleCloseModal = () => {
    setShowLoanModal(false);
    setLoanDisbursed(false);
  };

  return (
    <div className="space-y-6">

      {/* Main Grid: Gauge & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Visual Radial Gauge Card (300 to 900) */}
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-slate-100">Paytm Credit Score</h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Range: 300 – 900
              </span>
            </div>

            {/* SVG Semi-Circular Radial Gauge */}
            <div className="relative flex flex-col items-center justify-center my-2">
              <svg viewBox="0 0 240 145" className="w-56 h-36">
                <defs>
                  <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BAF2" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Base background track */}
                <path
                  d="M 30,120 A 90,90 0 0,1 210,120"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                {/* Zone 1: Red (<550) -> span 250 (41.67% of 282.74 = 117.8) */}
                <path
                  d="M 30,120 A 90,90 0 0,1 210,120"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="16"
                  strokeDasharray="117.8 283"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />

                {/* Zone 2: Amber (550–700) -> span 150 (25% of 282.74 = 70.7) */}
                <path
                  d="M 30,120 A 90,90 0 0,1 210,120"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="16"
                  strokeDasharray="70.7 283"
                  strokeDashoffset="-117.8"
                />

                {/* Zone 3: Emerald Green (700–900) -> span 200 (33.33% of 282.74 = 94.2) */}
                <path
                  d="M 30,120 A 90,90 0 0,1 210,120"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="16"
                  strokeDasharray="94.2 283"
                  strokeDashoffset="-188.5"
                  strokeLinecap="round"
                />

                {/* Needle Indicator */}
                <g transform={`rotate(${needleAngle - 90}, 120, 120)`}>
                  <line
                    x1="120"
                    y1="120"
                    x2="120"
                    y2="42"
                    stroke="url(#needleGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="120" cy="120" r="7" fill="#00BAF2" />
                  <circle cx="120" cy="120" r="3" fill="#020617" />
                </g>

                {/* Scale Axis Labels */}
                <text x="24" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">300</text>
                <text x="96" y="70" fill="#f59e0b" fontSize="9" fontWeight="semibold" fontFamily="monospace">550</text>
                <text x="146" y="70" fill="#10b981" fontSize="9" fontWeight="semibold" fontFamily="monospace">700</text>
                <text x="202" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">900</text>
              </svg>

              {/* Large Numeric Score Badge */}
              <div className="-mt-6 text-center">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00BAF2] to-sky-400">
                  {score} <span className="text-sm font-normal text-slate-400 font-mono">/ {maxScore}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tier}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 px-1 leading-relaxed">
              Calculated dynamically from real-time Daily UPI Inflow Velocity, Udhaar Recovery Ratio, and Voice Bookkeeping.
            </p>
          </div>

          {/* Color Legend Strip */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px] font-mono">
            <div className="flex items-center justify-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>&lt;550 High Risk</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>550–700 Fair</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>700–900 Prime</span>
            </div>
          </div>
        </div>

        {/* 2. Explainable Score Breakdown List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00BAF2]" />
                <h2 className="text-base font-bold text-slate-100">Explainable Scoring Factors</h2>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                100% Deterministic & Auditable
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              No black-box ML or bureau hard inquiry. Underwritten purely on transparent kirana cash flow metrics:
            </p>

            <div className="space-y-3">
              {factors.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{f.label}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {f.detail}
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-block shadow-sm">
                      {f.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#00BAF2]" />
              Zero bureau pull. Powered by Paytm Merchant QR cash flow underwriting.
            </span>
            <span className="font-mono text-slate-500 text-[10px]">Updated Every Transaction</span>
          </div>
        </div>

      </div>

      {/* 3. Unlocked Pre-Qualified Loan Offer Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#002970]/50 rounded-2xl border-2 border-emerald-500/40 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Instant Capital Pre-Approved</span>
            </div>

            <h3 className="text-xl font-black text-slate-100 tracking-tight">
              Pre-Qualified Paytm Merchant Cash Advance: ₹{loanAmount.toLocaleString('en-IN')}
            </h3>

            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-3xl">
              Collateral-Free • 1.25% Monthly • 1.0% Origination Fee • Instant Settlement to Paytm Merchant Bank Account
            </p>
          </div>

          <button
            onClick={() => setShowLoanModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-[#00BAF2] hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>⚡ 1-Click Instant Disbursal Demo</span>
          </button>
        </div>
      </div>

      {/* Instant Disbursal Confirmation Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Paytm Merchant Cash Advance</h4>
                  <p className="text-[11px] text-slate-400">Instant Working Capital Disbursal</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terms Summary Strip */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Approved Loan Capital:</span>
                <span className="font-black text-emerald-400 text-base font-mono">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Monthly Interest Rate:</span>
                <span className="font-semibold text-slate-200 font-mono">{monthlyRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Origination Fee:</span>
                <span className="font-semibold text-slate-200 font-mono">{origFee} (One-Time)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Repayment Mechanism:</span>
                <span className="font-semibold text-slate-200">Daily Auto-Sweep via Paytm Soundbox QR</span>
              </div>
            </div>

            {/* Confirmation Banner when Disbursed */}
            {loanDisbursed ? (
              <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>₹{loanAmount.toLocaleString('en-IN')} Credited to Sharma Kirana Store (A/c XXXX-4821)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 pl-7 space-y-0.5">
                  <p>UTR #PYTM20269912 • Status: Disbursed & Settled</p>
                  <p className="text-slate-400">Repayment: Daily Auto-Sweep via Paytm Soundbox QR</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00BAF2] shrink-0" />
                <span>Simulates live RBI-compliant NBFC merchant disbursal in 1-click.</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {loanDisbursed ? 'Close' : 'Cancel'}
              </button>

              {!loanDisbursed && (
                <button
                  onClick={handleDisburseClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00BAF2] hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs shadow-lg transition-transform flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Confirm Disbursal</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
