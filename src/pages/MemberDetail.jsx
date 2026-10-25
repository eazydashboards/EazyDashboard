import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MessageCircle,
  Calendar,
  CreditCard,
  CheckCircle,
  Check,
  AlertCircle,
  ArrowLeft,
  Banknote,
  Edit,
  X,
  History,
  ShieldAlert,
  Info,
  UserCheck,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
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

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const toast = useToast();

  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Year selector
  const currentSystemYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentSystemYear);

  // Settings
  const [settings, setSettings] = useState({ gymName: "Health Gym", cardFee: 100, defaultMonthlyFee: 2000 });

  // Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMonthsToPay, setSelectedMonthsToPay] = useState([]);
  const [payAmount, setPayAmount] = useState(2000);
  const [payMethod, setPayMethod] = useState("Cash");
  const [payTxnId, setPayTxnId] = useState("");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Paid Month Detail Modal
  const [paidDetailModal, setPaidDetailModal] = useState({ open: false, data: null, monthName: "" });

  // Card Issue Modal
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardMethod, setCardMethod] = useState("Cash");
  const [cardTxnId, setCardTxnId] = useState("");
  const [issuingCard, setIssuingCard] = useState(false);

  // Edit Member Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    address: "",
    monthlyFee: 2000,
    status: "active",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      setLoading(true);
      const [mRes, setRes] = await Promise.all([
        api.get(`/members/${id}?year=${selectedYear}`),
        api.get("/settings"),
      ]);

      if (mRes.data.success) {
        setMember(mRes.data.member);
        setPayments(mRes.data.payments || []);
        setEditForm({
          name: mRes.data.member.name,
          fatherName: mRes.data.member.fatherName || "",
          mobile: mRes.data.member.mobile,
          address: mRes.data.member.address || "",
          monthlyFee: mRes.data.member.monthlyFee,
          status: mRes.data.member.status,
        });
      }

      if (setRes.data.success && setRes.data.settings) {
        setSettings(setRes.data.settings);
      }
    } catch (err) {
      console.error("Failed to load member detail:", err);
      toast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  }, [id, selectedYear, toast]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  if (loading || !member) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading member profile & fee card...</p>
      </div>
    );
  }

  const joinDate = new Date(member.joiningDate || member.createdAt);
  const joinYear = joinDate.getFullYear();
  const joinMonth = joinDate.getMonth() + 1;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Map payments for selectedYear
  const monthPaymentMap = {};
  payments
    .filter((p) => p.type === "monthly" && Number(p.year) === Number(selectedYear))
    .forEach((p) => {
      if (Array.isArray(p.months)) {
        p.months.forEach((m) => {
          monthPaymentMap[Number(m)] = p;
        });
      }
    });

  const monthsStatus = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const isPaid = !!monthPaymentMap[monthNum];
    const paymentRecord = monthPaymentMap[monthNum] || null;

    const isBeforeJoining =
      selectedYear < joinYear || (selectedYear === joinYear && monthNum < joinMonth);

    let isDue = false;
    let isUpcoming = false;

    if (!isPaid && !isBeforeJoining) {
      if (selectedYear < currentYear) {
        isDue = true;
      } else if (selectedYear === currentYear) {
        if (monthNum <= currentMonth) {
          isDue = true;
        } else {
          isUpcoming = true;
        }
      } else {
        isUpcoming = true;
      }
    }

    return {
      monthNum,
      monthName: MONTH_NAMES[i],
      shortName: MONTH_SHORT[i],
      isBeforeJoining,
      isPaid,
      isDue,
      isUpcoming,
      paymentRecord,
    };
  });

  const handleMonthClick = (m) => {
    if (m.isBeforeJoining) return;

    if (m.isPaid) {
      setPaidDetailModal({
        open: true,
        data: m.paymentRecord,
        monthName: m.monthName,
      });
      return;
    }

    setSelectedMonthsToPay([m.monthNum]);
    setPayAmount(member.monthlyFee);
    setPayMethod("Cash");
    setPayTxnId("");
    setPayDate(new Date().toISOString().split("T")[0]);
    setPaymentModalOpen(true);
  };

  const toggleMonthSelection = (mNum) => {
    let next;
    if (selectedMonthsToPay.includes(mNum)) {
      next = selectedMonthsToPay.filter((x) => x !== mNum);
    } else {
      next = [...selectedMonthsToPay, mNum].sort((a, b) => a - b);
    }
    setSelectedMonthsToPay(next);
    setPayAmount(next.length * member.monthlyFee);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (selectedMonthsToPay.length === 0) {
      toast.error("Please select at least one month");
      return;
    }

    setSubmittingPayment(true);
    try {
      const memberDocId = member._id || member.id;
      const res = await api.post("/payments", {
        memberId: memberDocId,
        months: selectedMonthsToPay,
        year: selectedYear,
        amount: Number(payAmount),
        method: payMethod,
        transactionId: payTxnId,
        paymentDate: payDate,
      });

      toast.success(res.data.message || "Fee payment recorded!");
      setPaymentModalOpen(false);
      fetchMember();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCardToggle = async () => {
    const memberDocId = member._id || member.id;
    if (member.cardIssued) {
      if (!window.confirm(`Revoke physical card for ${member.name}?`)) return;
      try {
        await api.post(`/members/${memberDocId}/toggle-card`, { cardIssued: false });
        toast.info("Card status marked as Not Issued");
        fetchMember();
      } catch (err) {
        toast.error("Failed to update card status");
      }
    } else {
      setCardMethod("Cash");
      setCardTxnId("");
      setCardModalOpen(true);
    }
  };

  const submitIssueCard = async (e) => {
    e.preventDefault();
    setIssuingCard(true);
    try {
      const memberDocId = member._id || member.id;
      const res = await api.post(`/members/${memberDocId}/toggle-card`, {
        cardIssued: true,
        paymentMethod: cardMethod,
        transactionId: cardTxnId,
      });
      toast.success(res.data.message || "Card issued successfully!");
      setCardModalOpen(false);
      fetchMember();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue card");
    } finally {
      setIssuingCard(false);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const memberDocId = member._id || member.id;
      const res = await api.put(`/members/${memberDocId}`, editForm);
      toast.success(res.data.message || "Member details updated");
      setEditModalOpen(false);
      fetchMember();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member");
    } finally {
      setSavingEdit(false);
    }
  };

  // Format phone numbers reliably for Mobile Dialer and WhatsApp
  const rawMobile = String(member.mobile || "").replace(/[^\d+]/g, "");
  const callUrl = `tel:${rawMobile}`;

  let waNumber = rawMobile.replace(/[^\d]/g, "");
  if (waNumber.startsWith("0")) {
    waNumber = "92" + waNumber.slice(1);
  } else if (!waNumber.startsWith("92")) {
    waNumber = "92" + waNumber;
  }

  // Calculate unpaid month names for current year to include in WhatsApp reminder
  const unpaidMonthNames = monthsStatus
    .filter((m) => !m.isBeforeJoining && !m.isPaid && m.monthNum <= currentMonth)
    .map((m) => m.shortName);

  const duesMsg =
    unpaidMonthNames.length > 0
      ? `Assalam o Alaikum ${member.name}, this is Health Gym reception. Your gym fee for ${unpaidMonthNames.join(", ")} (${selectedYear}) is pending (Rs. ${unpaidMonthNames.length * (member.monthlyFee || 0)}). Kindly submit your fee at the gym counter. Thank you!`
      : `Assalam o Alaikum ${member.name}, this is Health Gym reception. We hope you are having great workout sessions!`;

  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(duesMsg)}`;

  const handleByName = member.handleBy || member.addedBy?.name || "Health Gym Staff";

  return (
    <div className="space-y-6">
      {/* Back button & page header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/search")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </button>

        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all min-h-[44px]"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Side-by-Side on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: MEMBER DETAILS */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              {member.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-black text-slate-900 leading-tight truncate">
                {member.name}
              </h1>
              <p className="text-sm font-extrabold text-blue-600">{member.regNo}</p>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  member.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>

          {/* Quick Call & WhatsApp Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={callUrl}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all min-h-[48px]"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all min-h-[48px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Member Metadata List with Handle By clearly displayed */}
          <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Monthly Fee:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(member.monthlyFee)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Registration Fee:</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(member.registrationFee)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Handle By:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                {handleByName}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Father Name:</span>
              <span className="font-semibold text-slate-800">{member.fatherName || "—"}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Mobile:</span>
              <span className="font-semibold text-slate-800">{member.mobile}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Joined Date:</span>
              <span className="font-semibold text-slate-800">
                {new Date(member.joiningDate || member.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 font-medium">Address:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">
                {member.address || "—"}
              </span>
            </div>
          </div>

          {/* Physical Membership Card Status & Lost Card Reissue */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Physical Gym Card</p>
                  <p className="text-[11px] text-slate-500">
                    {member.cardIssued ? "Issued & Active (1st Free)" : "Not issued / Lost"}
                  </p>
                </div>
              </div>

              {member.cardIssued ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Active ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardMethod("Cash");
                      setCardTxnId("");
                      setCardModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="If member lost card, reissue for Rs. 100"
                  >
                    Lost? Reissue
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCardToggle}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all min-h-[36px]"
                >
                  + Issue Card (Rs. {settings.cardFee || 100})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: DIGITAL MONTHLY FEE PUNCH CARD */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Health Gym Fee Card: Jan – Dec {selectedYear}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Digital recreation of the physical punch card. Tap any unpaid month to receive fee.
              </p>
            </div>

            {/* Year Selector Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
              {[currentSystemYear - 1, currentSystemYear, currentSystemYear + 1].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
              <span>Paid (Tap to inspect)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 animate-pulse" />
              <span>Due / Overdue (Tap to punch)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-200" />
              <span>Upcoming</span>
            </div>
          </div>

          {/* 12-BOX MONTH GRID */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {monthsStatus.map((m) => {
              if (m.isBeforeJoining) {
                return (
                  <div
                    key={m.monthNum}
                    className="p-3 sm:p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 opacity-40 select-none flex flex-col items-center justify-center min-h-[90px] text-center"
                  >
                    <span className="text-xs font-bold text-slate-400">{m.shortName}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Pre-join</span>
                  </div>
                );
              }

              if (m.isPaid) {
                return (
                  <button
                    key={m.monthNum}
                    onClick={() => handleMonthClick(m)}
                    className="p-3 sm:p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 active:scale-95 transition-all flex flex-col items-center justify-center min-h-[90px] text-center shadow-xs hover:shadow-md cursor-pointer group"
                    title={`Paid: ${formatCurrency(m.paymentRecord?.amount || member.monthlyFee)}. Tap to view receipt.`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-tight">{m.shortName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 mt-0.5">PAID</span>
                  </button>
                );
              }

              if (m.isDue) {
                return (
                  <button
                    key={m.monthNum}
                    onClick={() => handleMonthClick(m)}
                    className="p-3 sm:p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-900 active:scale-95 transition-all flex flex-col items-center justify-center min-h-[90px] text-center shadow-xs hover:shadow-md cursor-pointer animate-in fade-in"
                    title="Payment Due! Tap to punch fee."
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center mb-1">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-tight">{m.shortName}</span>
                    <span className="text-[10px] font-extrabold text-rose-600 mt-0.5">DUE</span>
                  </button>
                );
              }

              return (
                <button
                  key={m.monthNum}
                  onClick={() => handleMonthClick(m)}
                  className="p-3 sm:p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 active:scale-95 transition-all flex flex-col items-center justify-center min-h-[90px] text-center cursor-pointer"
                  title="Upcoming month. Tap to pay in advance."
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{m.shortName}</span>
                  <span className="text-[10px] text-slate-400 mt-1">Upcoming</span>
                </button>
              );
            })}
          </div>

          {/* Quick Pay Multiple Months Banner */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Need to record multiple months at once (advance or bulk dues)?
            </p>
            <button
              onClick={() => {
                const unpaid = monthsStatus.filter((m) => !m.isPaid && !m.isBeforeJoining);
                setSelectedMonthsToPay(unpaid.slice(0, 1).map((m) => m.monthNum));
                setPayAmount(member.monthlyFee);
                setPayMethod("Cash");
                setPayTxnId("");
                setPayDate(new Date().toISOString().split("T")[0]);
                setPaymentModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto min-h-[40px]"
            >
              + Multi-Month Payment
            </button>
          </div>

          {/* Payment History Log */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Recent Payment Records (Health Gym)</span>
            </h3>

            {payments.length === 0 ? (
              <p className="text-xs text-slate-400">No payment history recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.slice(0, 6).map((p) => {
                  const pId = p._id || p.id;
                  const staffName = p.handleBy || p.receivedBy?.name || "Staff";

                  return (
                    <div
                      key={pId}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span>
                            {p.type === "card"
                              ? "Membership Card Fee"
                              : p.type === "registration"
                              ? "Admission / Registration Fee"
                              : `Fee for ${p.months?.map((m) => MONTH_SHORT[m - 1]).join(", ")} ${p.year}`}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                            {p.method}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <strong className="text-blue-700">Handle by: {staffName}</strong> on{" "}
                          {new Date(p.paymentDate || p.createdAt).toLocaleDateString("en-GB")}
                          {p.transactionId ? ` • Ref: ${p.transactionId}` : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: RECEIVE FEE POPUP */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Receive Fee Payment</h3>
                  <p className="text-xs text-slate-500">
                    {member.name} ({member.regNo}) • <span className="text-blue-600 font-bold">Handle by: {user?.name || "Staff"}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Month(s) for {selectedYear}:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {monthsStatus
                    .filter((m) => !m.isBeforeJoining && !m.isPaid)
                    .map((m) => {
                      const isSelected = selectedMonthsToPay.includes(m.monthNum);
                      return (
                        <button
                          key={m.monthNum}
                          type="button"
                          onClick={() => toggleMonthSelection(m.monthNum)}
                          className={`py-2 px-1 rounded-xl text-xs font-extrabold border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {m.shortName}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex justify-between">
                  <span>Fee Amount (PKR)</span>
                  <span className="text-[11px] text-slate-400">
                    {selectedMonthsToPay.length} month(s) selected
                  </span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-extrabold bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["Cash", "Easypaisa", "JazzCash", "Bank Transfer", "Other Online"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                        payMethod === m
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod !== "Cash" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Transaction ID / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={payTxnId}
                    onChange={(e) => setPayTxnId(e.target.value)}
                    placeholder="e.g. TID-1002934"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingPayment || selectedMonthsToPay.length === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 min-h-[52px] disabled:opacity-50"
                >
                  {submittingPayment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Confirm & Save Payment ({formatCurrency(payAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PAID MONTH RECEIPT DETAIL MODAL */}
      {paidDetailModal.open && paidDetailModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span>Health Gym Fee Receipt</span>
              </div>
              <button
                onClick={() => setPaidDetailModal({ open: false, data: null, monthName: "" })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-950 text-center">
                <p className="text-xs font-semibold text-emerald-700">Punched For</p>
                <h4 className="text-xl font-black">{paidDetailModal.monthName} {paidDetailModal.data.year}</h4>
                <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(paidDetailModal.data.amount)}</p>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-slate-800">{paidDetailModal.data.method}</span>
                </div>
                {paidDetailModal.data.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Txn Ref:</span>
                    <span className="font-bold text-slate-800">{paidDetailModal.data.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Paid:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(paidDetailModal.data.paymentDate || paidDetailModal.data.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Handle By:</span>
                  <span className="font-bold text-blue-700">{paidDetailModal.data.handleBy || paidDetailModal.data.receivedBy?.name || "Staff"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPaidDetailModal({ open: false, data: null, monthName: "" })}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: ISSUE PHYSICAL CARD */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <CreditCard className="w-5 h-5" />
                <span>Issue Replacement Card (Lost Card)</span>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitIssueCard} className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-950 text-center">
                <p className="text-xs font-semibold text-blue-700">Lost Card Replacement Fee</p>
                <h4 className="text-2xl font-black text-blue-600">{formatCurrency(settings.cardFee || 100)}</h4>
                <p className="text-xs text-slate-500 mt-1">Reissue physical card for {member.name} ({member.regNo})</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Easypaisa", "JazzCash", "Bank Transfer", "Other Online"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCardMethod(m)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                        cardMethod === m
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {cardMethod !== "Cash" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={cardTxnId}
                    onChange={(e) => setCardTxnId(e.target.value)}
                    placeholder="e.g. TID-CARD-001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={issuingCard}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {issuingCard ? "Issuing..." : `Record Payment & Issue Card`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT MEMBER PROFILE */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Member Profile</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Father Name</label>
                <input
                  type="text"
                  value={editForm.fatherName}
                  onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  required
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (PKR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={editForm.monthlyFee}
                  onChange={(e) => setEditForm({ ...editForm, monthlyFee: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetail;
