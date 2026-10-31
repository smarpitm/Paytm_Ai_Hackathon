import React, { useState } from 'react';
import { IndianRupee, TrendingUp, Users, Award, BookOpen, Megaphone, ShieldCheck } from 'lucide-react';
import KhataTable from '../components/KhataTable';
import BroadcastPanel from '../components/BroadcastPanel';
import CreditScoreCard from '../components/CreditScoreCard';

export default function ErpDashboardPage({ dashboard, refreshDashboard }) {
  const [activeTab, setActiveTab] = useState('khata');

  const metrics = dashboard?.summary_metrics || {
    today_total_sales: 4000.0,
    today_upi_sales: 3450.0,
    today_udhaar_sales: 550.0,
    top_selling_item: 'Aashirvaad Aata',
    total_active_udhaar: 550.0,
    active_udhaar_customer_count: 3
  };

  const customers = dashboard?.customers || [];
  const transactions = dashboard?.transactions || [];
  const broadcasts = dashboard?.broadcasts || [];
  const creditScore = dashboard?.credit_score || { score: 764, max_score: 900 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <span className="text-[#00BAF2]">Sharma Kirana Store</span> — Merchant Growth ERP
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ledger, automated payment recovery loops, promotional broadcasts, and instant working capital credit.
          </p>
        </div>
      </div>

      {/* Top KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Total Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Today's Total Sales</span>
            <div className="text-xl font-black text-slate-100 mt-1">
              ₹{metrics.today_total_sales.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
              ₹{metrics.today_upi_sales.toLocaleString()} UPI + ₹{metrics.today_udhaar_sales.toLocaleString()} Udhaar
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Top Selling Item */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">#1 Top-Selling Item</span>
            <div className="text-lg font-black text-slate-100 mt-1 truncate max-w-[140px]">
              {metrics.top_selling_item}
            </div>
            <div className="text-[11px] text-sky-400 font-mono mt-0.5">
              High Velocity SKU
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#00BAF2]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Total Active Udhaar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Udhaar Dues</span>
            <div className="text-xl font-black text-rose-400 mt-1">
              ₹{metrics.total_active_udhaar.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {metrics.active_udhaar_customer_count} customers
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Paytm Credit Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Paytm Credit Score</span>
            <div className="text-xl font-black text-amber-400 mt-1">
              {creditScore.score} / {creditScore.max_score}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              Gold Tier (Pre-Approved)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('khata')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'khata'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Voice Khata & Customer Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'broadcast'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Customer Discount Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('credit')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'credit'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Working Capital & Credit Score</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'khata' && (
        <KhataTable
          customers={customers}
          transactions={transactions}
          refreshDashboard={refreshDashboard}
        />
      )}

      {activeTab === 'broadcast' && (
        <BroadcastPanel
          broadcasts={broadcasts}
          refreshDashboard={refreshDashboard}
        />
      )}

      {activeTab === 'credit' && (
        <CreditScoreCard
          creditScore={creditScore}
        />
      )}

    </div>
  );
}

