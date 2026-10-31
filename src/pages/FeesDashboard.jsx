import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  User,
  RefreshCw,
  Sparkles,
  Download,
  AlertCircle,
  Eye,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/currency";

const FeesDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("today"); // "today" | "history"

  // Today Tab state
  const [todayData, setTodayData] = useState({
    date: new Date().toISOString().split("T")[0],
    totalRevenue: 0,
    cashTotal: 0,
    onlineTotal: 0,
    totalTransactions: 0,
    breakdown: { monthlyCount: 0, regCount: 0, cardCount: 0 },
    payments: [],
  });
  const [todayLoading, setTodayLoading] = useState(true);

  // History Tab state
  const [historyPayments, setHistoryPayments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyStats, setHistoryStats] = useState({ totalAmount: 0, count: 0, byMethod: {} });
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState(() => {
    // Default to first day of current month
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterType, setFilterType] = useState("range"); // "single" | "range"
  const [searchMember, setSearchMember] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  // Fetch Today's fee summary
  const fetchTodayFees = useCallback(async () => {
    try {
      setTodayLoading(true);
      const res = await api.get("/payments/daily-summary");
      if (res.data.success) {
        setTodayData(res.data);
      }
    } catch (err) {
      console.error("Failed to load today's fees:", err);
      toast.error("Failed to fetch today's fee collections");
    } finally {
      setTodayLoading(false);
    }
  }, [toast]);

  // Fetch History fees
  const fetchHistoryFees = useCallback(async () => {
    try {
      setHistoryLoading(true);
      let queryUrl = "/payments?";
      if (filterType === "single" && selectedDate) {
        queryUrl += `date=${selectedDate}`;
      } else if (filterType === "range") {
        if (startDate) queryUrl += `startDate=${startDate}&`;
        if (endDate) queryUrl += `endDate=${endDate}`;
      }

      const res = await api.get(queryUrl);
      if (res.data.success) {
        setHistoryPayments(res.data.payments || []);
        setHistoryStats({
          totalAmount: res.data.totalAmount || 0,
          count: res.data.count || 0,
          byMethod: res.data.byMethod || {},
        });
      }
    } catch (err) {
      console.error("Failed to load fee history:", err);
      toast.error("Failed to load fee history");
    } finally {
      setHistoryLoading(false);
    }
  }, [filterType, selectedDate, startDate, endDate, toast]);

  useEffect(() => {
    fetchTodayFees();
  }, [fetchTodayFees]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistoryFees();
    }
  }, [activeTab, fetchHistoryFees]);

  // Filter history items by search input & method
  const filteredHistory = historyPayments.filter((p) => {
    const matchesSearch =
      !searchMember.trim() ||
      (p.memberName && p.memberName.toLowerCase().includes(searchMember.toLowerCase())) ||
      (p.memberRegNo && p.memberRegNo.toLowerCase().includes(searchMember.toLowerCase())) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(searchMember.toLowerCase()));

    const matchesMethod =
      methodFilter === "all" ||
      (p.method || "").toLowerCase() === methodFilter.toLowerCase();

    return matchesSearch && matchesMethod;
  });

  const filteredHistoryTotal = filteredHistory.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card with Quick Today Metric */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Counter Fee Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Fee Collections & Payment History
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Real-time daily collection records and full date-wise audit history for Health Gym.
            </p>
          </div>

          {/* Quick Counter Today Stat Pill */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Today's Collection ({new Date().toLocaleDateString("en-GB")})
              </p>
              <h2 className="text-2xl font-black text-white mt-0.5">
                {formatCurrency(todayData.totalRevenue)}
              </h2>
              <p className="text-xs text-blue-200 font-medium">
                {todayData.totalTransactions} student/member payments recorded
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="relative z-10 flex gap-2 mt-6 pt-5 border-t border-white/20">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "today"
                ? "bg-white text-blue-700 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today's Fees ({todayData.totalTransactions})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-blue-700 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>History of Fees</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TODAY'S FEES VIEW                                 */}
      {/* ======================================================== */}
      {activeTab === "today" && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Collected Today
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(todayData.totalRevenue)}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {todayData.totalTransactions} Total Payments
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cash in Counter
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(todayData.cashTotal)}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Physical Cash
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Online / Digital (Easypaisa/JazzCash)
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(todayData.onlineTotal)}
                </h3>
                <span className="inline-block mt-1 text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Bank / Wallets
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Today's Payment Records Table Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Today's Student / Member Fee Receipts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Payments received at reception on {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTodayFees}
                disabled={todayLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${todayLoading ? "animate-spin" : ""}`} />
                <span>Refresh Today</span>
              </button>
            </div>

            {todayLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Loading today's payments...</p>
              </div>
            ) : todayData.payments.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Banknote className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">No Payments Recorded Today Yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  When members pay their fees today, their details and amounts will automatically show up here.
                </p>
                <Link
                  to="/search"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  <span>Go to Members & Punch Fee</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">REG No</th>
                      <th className="py-3 px-4">Fee Type</th>
                      <th className="py-3 px-4">Months / Year</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Handled By</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {todayData.payments.map((p) => {
                      const mId = p.member || p.memberId;
                      return (
                        <tr key={p._id || p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{p.memberName}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-md">
                              {p.memberRegNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.type === "monthly"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.type === "registration"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {p.type || "Monthly"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                            {p.months && p.months.length > 0
                              ? `Month(s): ${p.months.join(", ")} (${p.year || new Date().getFullYear()})`
                              : `${p.year || new Date().getFullYear()}`}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {p.method || "Cash"}
                            </span>
                            {p.transactionId && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                                {p.transactionId}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                            {p.handleBy || p.receivedBy?.name || "Staff"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {mId ? (
                              <Link
                                to={`/member/${mId}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Profile</span>
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: HISTORY OF FEES (DATE-WISE AUDIT)                  */}
      {/* ======================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Filter Bar Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Fee Records by Date</span>
              </div>

              {/* Mode switch (Single Date vs Date Range) */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterType("range")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === "range"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Date Range
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("single")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === "single"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Specific Single Date
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              {filterType === "single" ? (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Specific Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Payment Method filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash Only</option>
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Search Member input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Search Member
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Name or REG No..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Strip */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Collection in Selected Period
              </p>
              <h3 className="text-2xl font-black text-amber-400 mt-0.5">
                {formatCurrency(filteredHistoryTotal)}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-slate-800 px-3 py-1.5 rounded-xl font-bold border border-slate-700">
                {filteredHistory.length} Transactions
              </span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
            {historyLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Searching payment history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-base font-bold text-slate-800">No Records Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try selecting a different date range or clearing the search filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">REG No</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Fee Month</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Received By</th>
                      <th className="py-3 px-4 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredHistory.map((p) => {
                      const mId = p.member || p.memberId;
                      const dateFormatted = new Date(p.paymentDate || p.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr key={p._id || p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold whitespace-nowrap">
                            {dateFormatted}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {p.memberName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-md">
                              {p.memberRegNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.type === "monthly"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.type === "registration"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {p.type || "Monthly"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                            {p.months && p.months.length > 0
                              ? `M: ${p.months.join(", ")} (${p.year})`
                              : `${p.year || "—"}`}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {p.method || "Cash"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {p.handleBy || p.receivedBy?.name || "Staff"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {mId && (
                              <Link
                                to={`/member/${mId}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesDashboard;
