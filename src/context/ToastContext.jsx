import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast floating container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-sm w-[90%] sm:w-auto pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              t.type === "success"
                ? "bg-white text-emerald-800 border-emerald-200 shadow-emerald-500/10"
                : t.type === "error"
                ? "bg-white text-rose-800 border-rose-200 shadow-rose-500/10"
                : "bg-white text-slate-800 border-slate-200 shadow-slate-500/10"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              {t.type === "info" && <Info className="w-5 h-5 text-orange-500 shrink-0" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
