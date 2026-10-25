import React, { useState, useEffect } from "react";
import {
  UserPlus,
  CreditCard,
  Calendar,
  Phone,
  User,
  Home,
  Banknote,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/currency";

const AddMember = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingReg, setFetchingReg] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [joiningDate, setJoiningDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(2000);
  const [registrationFee, setRegistrationFee] = useState(1000);
  const [registrationPaymentMethod, setRegistrationPaymentMethod] = useState("Cash");
  const [registrationTransactionId, setRegistrationTransactionId] = useState("");

  // Card Issued Toggle (1st Card Free on Admission)
  const [cardIssued, setCardIssued] = useState(true);
  const [cardFee, setCardFee] = useState(100);

  const fetchDefaults = async () => {
    setFetchingReg(true);
    try {
      const [regRes, setRes] = await Promise.allSettled([
        api.get("/members/next-reg"),
        api.get("/settings"),
      ]);

      if (regRes.status === "fulfilled" && regRes.value.data.nextReg) {
        setRegNo(regRes.value.data.nextReg);
      }

      if (setRes.status === "fulfilled" && setRes.value.data.settings) {
        const s = setRes.value.data.settings;
        if (s.defaultMonthlyFee) setMonthlyFee(s.defaultMonthlyFee);
        if (s.defaultRegistrationFee !== undefined) setRegistrationFee(s.defaultRegistrationFee);
        if (s.cardFee) setCardFee(s.cardFee);
      }
    } catch (err) {
      console.error("Error loading defaults:", err);
    } finally {
      setFetchingReg(false);
    }
  };

  useEffect(() => {
    fetchDefaults();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = mobile.replace(/[\s-]/g, "");
    if (!/^\d{10,11}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10 or 11 digit mobile number");
      return;
    }

    if (!name.trim()) {
      toast.error("Member name is required");
      return;
    }

    if (!regNo.trim()) {
      toast.error("Registration (REG) number is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        regNo: regNo.trim().toUpperCase(),
        joiningDate,
        fatherName: fatherName.trim(),
        address: address.trim(),
        mobile: cleanPhone,
        monthlyFee: Number(monthlyFee),
        registrationFee: Number(registrationFee) || 0,
        registrationPaymentMethod: Number(registrationFee) > 0 ? registrationPaymentMethod : undefined,
        registrationTransactionId: Number(registrationFee) > 0 ? registrationTransactionId.trim() : undefined,
        cardIssued,
      };

      const res = await api.post("/members", payload);
      toast.success(res.data.message || `Member ${name} registered successfully in Health Gym!`);

      // Clear Form and get next REG
      setName("");
      setFatherName("");
      setAddress("");
      setMobile("");
      setRegistrationTransactionId("");
      setCardIssued(true);
      fetchDefaults();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to add member. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Register New Gym Member
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Health Gym member registration with personal details and monthly fee rate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Handle by: {user?.name || "Staff"}</span>
            </div>

            <button
              type="button"
              onClick={fetchDefaults}
              disabled={fetchingReg}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              title="Refresh next registration number"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingReg ? "animate-spin" : ""}`} />
              <span>Auto-Gen REG</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Member Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Member Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Registration No (REG) <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-blue-600 font-semibold lowercase">Must be unique</span>
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                  placeholder="REG-001"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Mobile Number <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400">10-11 digits</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="03001234567"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Joining Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Father Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father / Guardian Name"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Monthly Fee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Monthly Fee (PKR) <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400">Regular Package</span>
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  placeholder="2000"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Registration / Admission Fee */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Admission / Registration Fee (PKR)</span>
                <span className="text-[11px] text-blue-600 font-semibold">One-time Fee</span>
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-bold focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>

            {/* Registration Fee Payment Method (if registration fee > 0) */}
            {Number(registrationFee) > 0 && (
              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Registration Fee Payment Method ({formatCurrency(registrationFee)}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {["Cash", "Easypaisa", "JazzCash", "Bank Transfer", "Other Online"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRegistrationPaymentMethod(m)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all min-h-[42px] ${
                        registrationPaymentMethod === m
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {registrationPaymentMethod !== "Cash" && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Fee Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={registrationTransactionId}
                      onChange={(e) => setRegistrationTransactionId(e.target.value)}
                      placeholder="e.g. REG-TXN-102938"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Residential Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Address / Area
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Street / Area or Colony"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-base font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/60 min-h-[48px]"
                />
              </div>
            </div>
          </div>

          {/* Membership Card Issued (1st Card Free on Admission) */}
          <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-blue-50/70 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Physical Health Gym Card
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                      1st Card 100% Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    First membership card is <strong>FREE</strong> with admission. (If lost later, replacement card fee is {formatCurrency(cardFee)}).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCardIssued(!cardIssued)}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  cardIssued ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    cardIssued ? "translate-x-9" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {cardIssued && (
              <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Physical membership card will be issued to this member for FREE on registration!</span>
              </div>
            )}
          </div>

          {/* Big Action Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-3 min-h-[56px] disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Save Member (Handle by: {user?.name || "Staff"})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
