import React, { useState } from 'react';
import { IndianRupee, TrendingUp, Users, Award, BookOpen, Megaphone, ShieldCheck } from 'lucide-react';
import KhataTable from '../components/KhataTable';
import BroadcastPanel from '../components/BroadcastPanel';
import CreditScoreCard from '../components/CreditScoreCard';

export default function ErpDashboardPage({ dashboard, refreshDashboard }) {
  const [activeTab, setActiveTab] = useState('khata');

  const customers = dashboard?.customers || [];
  const transactions = dashboard?.transactions || [];
  const broadcasts = dashboard?.broadcasts || [];
  const creditScore = dashboard?.credit_score || {
    score: 764,
    max_score: 900,
    rating_tier: "EXCELLENT (Gold Merchant)",
  };

  const summary = dashboard?.summary_metrics || {};

  // 1. Today's Total Sales
  const total_daily_sales = Number(summary.today_total_sales ?? 4000);
  const total_upi_sales = Number(summary.today_upi_sales ?? 3450);
  const total_unsettled_udhaar = Number(
    summary.total_active_udhaar ?? summary.today_udhaar_sales ?? 550
  );

  // 2. #1 Top-Selling Item Today
  let topItemName = "Aashirvaad Aata";
  let topItemAmount = 2170;
  if (typeof summary.top_selling_item === "object" && summary.top_selling_item !== null) {
    topItemName = summary.top_selling_item.item_name || "Aashirvaad Aata";
    topItemAmount = summary.top_selling_item.total_amount || 2170;
  } else if (typeof summary.top_selling_item === "string" && summary.top_selling_item) {
    topItemName = summary.top_selling_item;
    const itemMap = {};
    transactions.forEach((tx) => {
      itemMap[tx.item_name] = (itemMap[tx.item_name] || 0) + Number(tx.amount || 0);
    });
    if (itemMap[topItemName]) {
      topItemAmount = itemMap[topItemName];
    }
  }

  // 3. Unsettled Customers Count
  const unsettled_customers_count =
    summary.active_udhaar_customer_count ??
    customers.filter((c) => Number(c.total_udhaar_balance || 0) > 0).length ??
    3;

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

      {/* Top KPI Metric Strip (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Total Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Today's Total Sales</span>
            <div className="text-xl font-black text-slate-100">
              ₹{total_daily_sales.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">
              ₹{total_upi_sales.toLocaleString('en-IN')} UPI + ₹{total_unsettled_udhaar.toLocaleString('en-IN')} Udhaar
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: #1 Top-Selling Item Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">#1 Top-Selling Item Today</span>
            <div className="text-lg font-black text-slate-100 truncate max-w-[155px]" title={topItemName}>
              {topItemName}
            </div>
            <div className="text-[11px] text-[#00BAF2] font-mono">
              ₹{topItemAmount.toLocaleString('en-IN')} Verified Inflow
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#00BAF2] shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Total Active Udhaar to Recover */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Active Udhaar to Recover</span>
            <div className="text-xl font-black text-rose-400">
              ₹{total_unsettled_udhaar.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400">
              Across {unsettled_customers_count} customers
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Paytm Creditworthiness Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Paytm Creditworthiness Score</span>
            <div className="text-xl font-black text-amber-400">
              {creditScore.score} / 900
            </div>
            <div className="text-[11px] text-emerald-400 font-bold truncate max-w-[150px]">
              {creditScore.rating_tier || "EXCELLENT (Gold Merchant)"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3-Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('khata')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'khata'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📒 Voice Khata & Regular Customer Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'broadcast'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>📢 Regular Customer Discount Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('credit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'credit'
              ? 'border-[#00BAF2] text-[#00BAF2]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🏦 Working Capital & Creditworthiness Score</span>
        </button>
      </div>

      {/* Tab Content Panels */}
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
