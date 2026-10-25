import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  X,
} from "lucide-react";
import api from "../api/axios";
import { formatCurrency } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SearchMembers = () => {
  const navigate = useNavigate();
  const { isOwner } = useAuth();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, member: null });
  const [deleting, setDeleting] = useState(false);

  // Filter and Sort states
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [feeFilter, setFeeFilter] = useState("all"); // "all" | "paid" | "pending"
  const [cardFilter, setCardFilter] = useState("all"); // "all" | "issued" | "not_issued"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "name_asc" | "name_desc" | "reg_asc" | "fee_desc"
  const [showFilters, setShowFilters] = useState(false);

  const fetchMembers = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/members?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.error("Fetch members error:", err);
      toast.error("Failed to load members list");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMembers(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchMembers]);

  const confirmDelete = async () => {
    if (!deleteModal.member) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/members/${deleteModal.member._id || deleteModal.member.id}`);
      toast.success(res.data.message || "Member deleted");
      setDeleteModal({ open: false, member: null });
      fetchMembers(searchQuery);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter and Sort Calculations
  const totalCount = members.length;
  const pendingCount = members.filter((m) => !m.isCurrentMonthPaid).length;
  const paidCount = members.filter((m) => m.isCurrentMonthPaid).length;
  const activeCount = members.filter((m) => m.status === "active").length;
  const cardCount = members.filter((m) => m.cardIssued).length;

  const isFiltered =
    statusFilter !== "all" ||
    feeFilter !== "all" ||
    cardFilter !== "all" ||
    sortBy !== "newest" ||
    searchQuery.trim() !== "";

  const resetAllFilters = () => {
    setStatusFilter("all");
    setFeeFilter("all");
    setCardFilter("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  const filteredMembers = members
    .filter((m) => {
      // Status Filter
      if (statusFilter !== "all" && m.status !== statusFilter) return false;

      // Fee Filter (Current Month)
      if (feeFilter === "paid" && !m.isCurrentMonthPaid) return false;
      if (feeFilter === "pending" && m.isCurrentMonthPaid) return false;

      // Card Filter
      if (cardFilter === "issued" && !m.cardIssued) return false;
      if (cardFilter === "not_issued" && m.cardIssued) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "reg_asc") return (a.regNo || "").localeCompare(b.regNo || "");
      if (sortBy === "fee_desc") return (Number(b.monthlyFee) || 0) - (Number(a.monthlyFee) || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Health Gym Members
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Total {members.length} registered member{members.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={() => navigate("/add")}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

        {/* Big Search Input with Debounce */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name, REG, Phone, or Father Name..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-300 text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 min-h-[50px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-200 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* QUICK FILTER PILLS / CHIPS                                */}
        {/* ========================================================= */}
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {/* All Chip */}
            <button
              type="button"
              onClick={() => {
                setFeeFilter("all");
                setStatusFilter("all");
                setCardFilter("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] ${
                feeFilter === "all" && statusFilter === "all" && cardFilter === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All ({totalCount})
            </button>

            {/* Fee Due Chip */}
            <button
              type="button"
              onClick={() => {
                setFeeFilter("pending");
                setStatusFilter("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                feeFilter === "pending"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Fee Due ({pendingCount})</span>
            </button>

            {/* Paid This Month Chip */}
            <button
              type="button"
              onClick={() => {
                setFeeFilter("paid");
                setStatusFilter("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                feeFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid ({paidCount})</span>
            </button>

            {/* Active Chip */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setFeeFilter("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] ${
                statusFilter === "active" && feeFilter === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Active ({activeCount})
            </button>

            {/* Card Issued Chip */}
            <button
              type="button"
              onClick={() => {
                setCardFilter(cardFilter === "issued" ? "all" : "issued");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px] flex items-center gap-1.5 ${
                cardFilter === "issued"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card ({cardCount})</span>
            </button>
          </div>

          {/* Toggle More Filters */}
          <div className="flex items-center gap-2 ml-auto">
            {isFiltered && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showFilters || isFiltered
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters & Sort</span>
              {isFiltered && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPANDABLE FILTER CONTROLS                                */}
        {/* ========================================================= */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
            {/* Fee Status Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Fee Status (This Month)
              </label>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 min-h-[38px]"
              >
                <option value="all">All Fee Statuses</option>
                <option value="pending">⚠️ Fee Due / Pending</option>
                <option value="paid">✅ Paid This Month</option>
              </select>
            </div>

            {/* Member Status Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Membership Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 min-h-[38px]"
              >
                <option value="all">All Members</option>
                <option value="active">Active Members Only</option>
                <option value="inactive">Inactive Members Only</option>
              </select>
            </div>

            {/* Physical Card Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Gym Card
              </label>
              <select
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 min-h-[38px]"
              >
                <option value="all">All (Card & No Card)</option>
                <option value="issued">Physical Card Issued</option>
                <option value="not_issued">No Card Yet</option>
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 min-h-[38px]"
              >
                <option value="newest">Newest Registered</option>
                <option value="oldest">Oldest Registered</option>
                <option value="name_asc">Name (A → Z)</option>
                <option value="name_desc">Name (Z → A)</option>
                <option value="reg_asc">REG Number (Low → High)</option>
                <option value="fee_desc">Fee Rate (High → Low)</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Results Summary Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>
            Showing <strong className="text-slate-800">{filteredMembers.length}</strong> of {members.length} members
            {isFiltered && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                Filtered
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Searching records...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No members found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No member records matched "${searchQuery}". Try a different keyword.`
              : "No members registered yet. Click 'Add Member' to create your first member."}
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No matching members</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            No member records match the selected filters or search query.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================== */}
          {/* 1. MOBILE VIEW: Thumb-friendly interactive cards (< 768px) */}
          {/* ========================================================== */}
          <div className="md:hidden space-y-3">
            {filteredMembers.map((m) => {
              const mId = m._id || m.id;
              const handleByName = m.handleBy || m.addedBy?.name || "Staff";

              return (
                <div
                  key={mId}
                  onClick={() => navigate(`/member/${mId}`)}
                  className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 active:scale-[0.99] transition-all cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {m.name}
                        </h3>
                        <p className="text-xs font-bold text-blue-600">{m.regNo}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col items-end gap-1">
                      {m.isCurrentMonthPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Fee Due
                        </span>
                      )}

                      {m.cardIssued ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          <CreditCard className="w-2.5 h-2.5 text-slate-500" /> Card Issued
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">No Card</span>
                      )}
                    </div>
                  </div>

                  {/* Handle by employee pill */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{m.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <span>Handle by:</span>
                      <strong className="text-slate-800">{handleByName}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================== */}
          {/* 2. DESKTOP VIEW: Full Data Table (>= 768px)                */}
          {/* ========================================================== */}
          <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-4 px-6">Member Name</th>
                    <th className="py-4 px-4">REG #</th>
                    <th className="py-4 px-4">Father Name</th>
                    <th className="py-4 px-4">Mobile</th>
                    <th className="py-4 px-4">Joined</th>
                    <th className="py-4 px-4">Card Status</th>
                    <th className="py-4 px-4">This Month Fee</th>
                    <th className="py-4 px-4">Handle By</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredMembers.map((m) => {
                    const mId = m._id || m.id;
                    const handleByName = m.handleBy || m.addedBy?.name || "Staff";

                    return (
                      <tr
                        key={mId}
                        onClick={() => navigate(`/member/${mId}`)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{m.name}</p>
                              <p className="text-xs text-slate-400">{formatCurrency(m.monthlyFee)}/month</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-bold text-blue-600 whitespace-nowrap">
                          {m.regNo}
                        </td>

                        <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                          {m.fatherName || "—"}
                        </td>

                        <td className="py-4 px-4 text-slate-800 font-semibold whitespace-nowrap">
                          {m.mobile}
                        </td>

                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {formatDate(m.joiningDate)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {m.cardIssued ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              <CreditCard className="w-3.5 h-3.5 text-slate-600" /> Issued
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No Card</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {m.isCurrentMonthPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Fee Due
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <UserCheck className="w-3 h-3 text-blue-600" />
                            <span>{handleByName}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/member/${mId}`)}
                              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View / Punch Fees"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => setDeleteModal({ open: true, member: m })}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Member (Owner only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (Owner Only) */}
      {deleteModal.open && deleteModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Delete Member Record?
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">{deleteModal.member.name}</strong> (
              {deleteModal.member.regNo}) and all associated payment history from Health Gym? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, member: null })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 min-h-[44px]"
              >
                {deleting ? "Deleting..." : "Yes, Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMembers;
