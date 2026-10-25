import React, { useState, useEffect } from "react";
import {
  History,
  User,
  ShieldCheck,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const ActivityLog = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/activity?page=${p}&limit=15`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setPage(res.data.page);
        setPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (err) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const formatTimestamp = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Health Gym Staff Audit Trail
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track every member registration, payment received, card issue, and system edit in Firestore.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchLogs(page)}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No activity logged yet</h3>
            <p className="text-xs text-slate-400 mt-1">Actions taken by staff or owner will appear here.</p>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const logId = log._id || log.id;
                const handleByName = log.handleBy || log.user?.name || "Staff";

                return (
                  <div
                    key={logId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          log.user?.role === "owner"
                            ? "bg-blue-100 text-blue-700 font-bold"
                            : "bg-emerald-100 text-emerald-700 font-bold"
                        }`}
                      >
                        {log.user?.role === "owner" ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {handleByName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.user?.role === "owner"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {log.user?.role || "Staff"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium mt-1 leading-snug">
                          {log.action}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold self-end sm:self-auto shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(log.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {pages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Showing page {page} of {pages} ({total} total actions)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
