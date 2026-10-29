import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  CreditCard,
  Building,
  Save,
  Copy,
  Check,
  Share2,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const SettingsPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Security / Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both current and new password");
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success(res.data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password. Check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const [form, setForm] = useState({
    gymName: "Health Gym",
    defaultMonthlyFee: 2000,
    defaultRegistrationFee: 1000,
    cardFee: 100,
    paymentInfo: {
      easypaisaTitle: "",
      easypaisaNumber: "",
      jazzcashTitle: "",
      jazzcashNumber: "",
      bankName: "",
      bankAccountTitle: "",
      bankAccountNumber: "",
      bankIban: "",
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/settings");
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setForm({
          gymName: s.gymName || "Health Gym",
          defaultMonthlyFee: s.defaultMonthlyFee || 2000,
          defaultRegistrationFee: s.defaultRegistrationFee !== undefined ? s.defaultRegistrationFee : 1000,
          cardFee: s.cardFee || 100,
          paymentInfo: {
            easypaisaTitle: s.paymentInfo?.easypaisaTitle || "",
            easypaisaNumber: s.paymentInfo?.easypaisaNumber || "",
            jazzcashTitle: s.paymentInfo?.jazzcashTitle || "",
            jazzcashNumber: s.paymentInfo?.jazzcashNumber || "",
            bankName: s.paymentInfo?.bankName || "",
            bankAccountTitle: s.paymentInfo?.bankAccountTitle || "",
            bankAccountNumber: s.paymentInfo?.bankAccountNumber || "",
            bankIban: s.paymentInfo?.bankIban || "",
          },
        });
      }
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/settings", form);
      toast.success(res.data.message || "Health Gym settings updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const copyShareText = () => {
    const text = `🏋️ *${form.gymName} - Official Fee Payment Accounts* 🏋️\n\n` +
      `📱 *Easypaisa:*\n` +
      `Title: ${form.paymentInfo.easypaisaTitle || "N/A"}\n` +
      `Number: ${form.paymentInfo.easypaisaNumber || "N/A"}\n\n` +
      `📱 *JazzCash:*\n` +
      `Title: ${form.paymentInfo.jazzcashTitle || "N/A"}\n` +
      `Number: ${form.paymentInfo.jazzcashNumber || "N/A"}\n\n` +
      `🏦 *Bank Transfer:*\n` +
      `Bank: ${form.paymentInfo.bankName || "N/A"}\n` +
      `Account Title: ${form.paymentInfo.bankAccountTitle || "N/A"}\n` +
      `Account #: ${form.paymentInfo.bankAccountNumber || "N/A"}\n` +
      `IBAN: ${form.paymentInfo.bankIban || "N/A"}\n\n` +
      `_Please share your transaction screenshot or TID with the gym reception after sending._`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Payment details copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Health Gym Configuration & Payment Accounts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage fee defaults and online payment account numbers that can be shared with members.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: General Gym Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Health Gym Rates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Gym Brand Name
              </label>
              <input
                type="text"
                required
                value={form.gymName}
                onChange={(e) => setForm({ ...form, gymName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Monthly Fee (PKR)
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={form.defaultMonthlyFee}
                onChange={(e) =>
                  setForm({ ...form, defaultMonthlyFee: Number(e.target.value) })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Default Admission / Reg Fee (PKR)
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={form.defaultRegistrationFee}
                onChange={(e) =>
                  setForm({ ...form, defaultRegistrationFee: Number(e.target.value) })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Membership Card Fee (PKR)
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={form.cardFee}
                onChange={(e) => setForm({ ...form, cardFee: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[48px]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Payment Receiving Accounts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Receiving Accounts (Easypaisa / JazzCash / Bank)</span>
            </h2>

            <button
              type="button"
              onClick={copyShareText}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors self-start sm:self-auto min-h-[36px]"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy Shareable Info"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Easypaisa */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <h3 className="font-extrabold text-emerald-900 text-sm">Easypaisa Details</h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Account Title
                </label>
                <input
                  type="text"
                  value={form.paymentInfo.easypaisaTitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentInfo: { ...form.paymentInfo, easypaisaTitle: e.target.value },
                    })
                  }
                  placeholder="e.g. Health Gym Official"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Easypaisa Number
                </label>
                <input
                  type="text"
                  value={form.paymentInfo.easypaisaNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentInfo: { ...form.paymentInfo, easypaisaNumber: e.target.value },
                    })
                  }
                  placeholder="03001234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono"
                />
              </div>
            </div>

            {/* JazzCash */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
              <h3 className="font-extrabold text-amber-900 text-sm">JazzCash Details</h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Account Title
                </label>
                <input
                  type="text"
                  value={form.paymentInfo.jazzcashTitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentInfo: { ...form.paymentInfo, jazzcashTitle: e.target.value },
                    })
                  }
                  placeholder="e.g. Health Gym Official"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  JazzCash Number
                </label>
                <input
                  type="text"
                  value={form.paymentInfo.jazzcashNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentInfo: { ...form.paymentInfo, jazzcashNumber: e.target.value },
                    })
                  }
                  placeholder="03019876543"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <h3 className="font-extrabold text-blue-900 text-sm">Bank Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={form.paymentInfo.bankName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentInfo: { ...form.paymentInfo, bankName: e.target.value },
                      })
                    }
                    placeholder="e.g. Meezan Bank / HBL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={form.paymentInfo.bankAccountTitle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentInfo: { ...form.paymentInfo, bankAccountTitle: e.target.value },
                      })
                    }
                    placeholder="Official Gym Account Title"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={form.paymentInfo.bankAccountNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentInfo: { ...form.paymentInfo, bankAccountNumber: e.target.value },
                      })
                    }
                    placeholder="010203040506"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    IBAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.paymentInfo.bankIban}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentInfo: { ...form.paymentInfo, bankIban: e.target.value },
                      })
                    }
                    placeholder="PK45MEZN000..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Big Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 min-h-[52px]"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Health Gym Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security & Password Change Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Account Security & Password</h2>
            <p className="text-xs text-slate-500">
              Update your login password anytime if it gets compromised or you wish to change it.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {changingPassword ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
