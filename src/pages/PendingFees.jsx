import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowRight,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/currency";

const PendingFees = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [filter, setFilter] = useState("current");
  const [data, setData] = useState({
    defaulters: [],
    totalPendingAmount: 0,
    currentMonth: "",
    count: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDefaulters = async (f = filter) => {
    try {
      setLoading(true);
      const res = await api.get(`/members/pending-fees?filter=${f}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load defaulters:", err);
      toast.error("Failed to load pending fees list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters(filter);
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const generateWhatsAppLink = (d) => {
    let clean = String(d.mobile || "").replace(/[^\d]/g, "");
    if (clean.startsWith("0")) {
      clean = "92" + clean.slice(1);
    } else if (!clean.startsWith("92")) {
      clean = "92" + clean;
    }
    const monthsText = d.dueMonths.join(", ");
    const text = `Assalam o Alaikum ${d.name}, your Health Gym fee for ${monthsText} (Total: ${formatCurrency(d.totalDue)}) is pending. Kindly submit your dues at the gym counter or via online transfer. Thank you!`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Health Gym Pending Fees & Reminders
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                One-tap reminder calls and WhatsApp notices for members with pending dues.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchDefaulters(filter)}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => handleFilterChange("current")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              filter === "current"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Current Month ({data.currentMonth || "Due"})
          </button>
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
              filter === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Overdue Months
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Members with Pending Fee
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
              {data.count}
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 col-span-1 sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Total Pending Receivables
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
              {formatCurrency(data.totalPendingAmount)}
            </h3>
          </div>
        </div>
      </div>

      {/* Defaulters Content */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Scanning fee records...</p>
        </div>
      ) : data.defaulters.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">All Clear! No Pending Dues</h3>
          <p className="text-xs text-slate-400 mt-1">
            Every member has paid their fees for the selected period.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-3">
            {data.defaulters.map((d) => {
              const dId = d._id || d.id;

              return (
                <div
                  key={dId}
                  className="bg-white p-4 rounded-2xl shadow-xs border border-rose-200/80 space-y-3"
                >
                  <div
                    onClick={() => navigate(`/member/${dId}`)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {d.name}
                      </h3>
                      <p className="text-xs font-bold text-blue-600">{d.regNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600">
                        {formatCurrency(d.totalDue)}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {d.dueMonths.length} mo overdue
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {d.dueMonths.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span>Handle by:</span>
                    <strong className="text-slate-700">{d.handleBy || "Staff"}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${d.mobile.replace(/[\s-]/g, "")}`}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs min-h-[44px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call ({d.mobile})</span>
                    </a>

                    <a
                      href={generateWhatsAppLink(d)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs min-h-[44px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <button
                    onClick={() => navigate(`/member/${dId}`)}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Open Fee Card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-4 px-6">Member</th>
                    <th className="py-4 px-4">REG #</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Due Months</th>
                    <th className="py-4 px-4">Total Due</th>
                    <th className="py-4 px-4">Handle By</th>
                    <th className="py-4 px-6 text-right">Instant Reminders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {data.defaulters.map((d) => {
                    const dId = d._id || d.id;

                    return (
                      <tr
                        key={dId}
                        onClick={() => navigate(`/member/${dId}`)}
                        className="hover:bg-rose-50/30 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{d.name}</p>
                          <p className="text-xs text-slate-400">{formatCurrency(d.monthlyFee)}/month</p>
                        </td>

                        <td className="py-4 px-4 font-bold text-blue-600 whitespace-nowrap">
                          {d.regNo}
                        </td>

                        <td className="py-4 px-4 text-slate-700 font-semibold whitespace-nowrap">
                          {d.mobile}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {d.dueMonths.map((m) => (
                              <span
                                key={m}
                                className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-black text-rose-600 whitespace-nowrap text-base">
                          {formatCurrency(d.totalDue)}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <UserCheck className="w-3 h-3 text-blue-600" />
                            <span>{d.handleBy || "Staff"}</span>
                          </span>
                        </td>

                        <td
                          className="py-4 px-6 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`tel:${d.mobile.replace(/[\s-]/g, "")}`}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                              title="Call member"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>

                            <a
                              href={generateWhatsAppLink(d)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5 text-xs font-bold shadow-xs"
                              title="Send WhatsApp notice"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
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
    </div>
  );
};

export default PendingFees;
