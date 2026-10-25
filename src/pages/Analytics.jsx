import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Banknote,
  Users,
  CreditCard,
  UserPlus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/currency";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COLORS = ["#2563eb", "#10b981", "#6366f1", "#f59e0b", "#64748b"];

const Analytics = () => {
  const toast = useToast();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [memberListTab, setMemberListTab] = useState("paid");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics?year=${selectedYear}&month=${selectedMonth}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Aggregating Health Gym revenue statistics...</p>
      </div>
    );
  }

  const {
    summary,
    revenueByMethod,
    monthlyTrends,
    paidMembersList,
    pendingMembersList,
    newMembersThisMonthList,
  } = data;

  const currentMonthName = MONTH_NAMES[selectedMonth - 1];

  return (
    <div className="space-y-6">
      {/* Header and Month/Year Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Health Gym Revenue & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Financial reports and membership insights powered by Firebase Cloud Firestore.
              </p>
            </div>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold bg-slate-50 min-h-[44px]"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold bg-slate-50 min-h-[44px]"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <button
              onClick={fetchStats}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. LIFETIME OVERALL REVENUE METRICS                       */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
              <TrendingUp className="w-3.5 h-3.5" /> All-Time Lifetime Performance
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Health Gym Overall Revenue
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Total cumulative income across all registered members, admissions, and card fees.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
              Total Payments Recorded
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-400">
              {summary.overallPaymentsCount || 0} Transactions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Card 1: Grand Total Revenue */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Lifetime Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                Rs
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(summary.totalRevenueOverall)}
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              Grand total of all collections
            </p>
          </div>

          {/* Card 2: Overall Monthly Fees */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Lifetime Monthly Fees
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(summary.overallMonthlyRevenue)}
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              From monthly member fee packages
            </p>
          </div>

          {/* Card 3: Overall Admission / Reg Fees */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Lifetime Admission Fees
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
              {formatCurrency(summary.overallRegistrationRevenue)}
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              From new member registrations
            </p>
          </div>

          {/* Card 4: Overall Card Fees */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Lifetime Card Fees
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-300">
              {formatCurrency(summary.overallCardRevenue)}
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              From physical card issuances
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SELECTED MONTH PERFORMANCE METRICS                     */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Monthly Breakdown ({currentMonthName} {selectedYear})</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Year {selectedYear} Total: <strong className="text-slate-800">{formatCurrency(summary.yearTotalRevenue)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Members */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Members
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900">{summary.totalMembers}</h2>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-emerald-600">{summary.activeMembers}</strong> active • {summary.inactiveMembers || 0} inactive
            </p>
          </div>

          {/* New Members This Month */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                New In {currentMonthName}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-blue-600">{summary.newMembersCount}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Joined in {currentMonthName} {selectedYear}
            </p>
          </div>

          {/* Monthly Fee Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fee Revenue ({currentMonthName})
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-emerald-600">
              {formatCurrency(summary.monthlyFeeRevenue)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Admission: <strong className="text-blue-600">{formatCurrency(summary.registrationRevenue)}</strong> • Card: {formatCurrency(summary.cardRevenue)}
            </p>
          </div>

          {/* Total Month Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Month Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              {formatCurrency(summary.totalRevenueThisMonth)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pending Dues: <strong className="text-rose-500">{formatCurrency(summary.totalPendingAmount)}</strong> ({summary.pendingCount} unpaid)
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Monthly Revenue & Membership Trends ({selectedYear})
            </h3>
            <span className="text-xs font-semibold text-slate-400">PKR</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [
                    name === "revenue" ? formatCurrency(val) : val,
                    name === "revenue" ? "Total Revenue" : "New Members",
                  ]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Total Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="newMembers" name="New Members" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">
            Payment Methods ({currentMonthName})
          </h3>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByMethod.filter((m) => m.total > 0)}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {revenueByMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Amount"]}
                  contentStyle={{ borderRadius: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {revenueByMethod.map((item, idx) => (
              <div key={item.method} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-700">{item.method}</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MEMBER LIST BREAKDOWN WITH HANDLE BY */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Health Gym Member Breakdown for {currentMonthName} {selectedYear}
            </h3>
            <p className="text-xs text-slate-500">
              Collected: <strong className="text-emerald-600">{formatCurrency(summary.monthlyFeeRevenue)}</strong> ({summary.paidCount} members) • 
              Pending: <strong className="text-rose-600">{formatCurrency(summary.totalPendingAmount)}</strong> ({summary.pendingCount} members)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setMemberListTab("paid")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                memberListTab === "paid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid ({paidMembersList.length})
            </button>
            <button
              onClick={() => setMemberListTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                memberListTab === "pending"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingMembersList.length})
            </button>
            <button
              onClick={() => setMemberListTab("new")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                memberListTab === "new"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New Members ({newMembersThisMonthList.length})
            </button>
          </div>
        </div>

        {memberListTab === "paid" && (
          <div className="space-y-2">
            {paidMembersList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No fees collected yet for this month.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paidMembersList.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.regNo} • {m.method}</p>
                      <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                        Handle by: {m.handleBy || "Staff"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-sm">Rs. {m.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {memberListTab === "pending" && (
          <div className="space-y-2">
            {pendingMembersList.length === 0 ? (
              <p className="text-xs text-emerald-600 py-4 font-bold">All members have cleared their dues for this month!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingMembersList.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.regNo} • {m.mobile}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Handle by: {m.handleBy || "Staff"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600 text-sm">Rs. {m.monthlyFee}</p>
                      <span className="text-[10px] text-rose-600 font-bold uppercase">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {memberListTab === "new" && (
          <div className="space-y-2">
            {newMembersThisMonthList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No new members registered in this month.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {newMembersThisMonthList.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.regNo} • {m.mobile}</p>
                      <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                        Handle by: {m.handleBy || "Staff"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">Rs. {m.monthlyFee}</p>
                      <span className="text-[10px] text-blue-600 font-bold">
                        {new Date(m.joiningDate || m.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
