import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  UserPlus,
  Search,
  Clock,
  BarChart3,
  Users,
  History,
  Settings as SettingsIcon,
  LogOut,
  Dumbbell,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
  ReceiptText,
  UserCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, isOwner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [tabletExpanded, setTabletExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    ...(isOwner ? [{ label: "Analytics", path: "/analytics", icon: BarChart3 }] : []),
    { label: "Search Members", path: "/search", icon: Search },
    { label: "Add Member", path: "/add", icon: UserPlus },
    { label: "Fee Records", path: "/fees", icon: ReceiptText },
    { label: "Pending Fees", path: "/pending", icon: Clock },
    ...(isOwner
      ? [
          { label: "Employees", path: "/employees", icon: Users },
          { label: "Activity Log", path: "/activity", icon: History },
          { label: "Settings", path: "/settings", icon: SettingsIcon },
        ]
      : []),
  ];

  // Primary items for mobile bottom bar
  const mobileNavItems = [
    { label: "Search", path: "/search", icon: Search },
    { label: "Fees", path: "/fees", icon: ReceiptText },
    { label: "Add", path: "/add", icon: UserPlus },
    { label: "Pending", path: "/pending", icon: Clock },
    ...(isOwner ? [{ label: "Analytics", path: "/analytics", icon: BarChart3 }] : []),
  ];

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith("/member/")) return "Member Profile";
    if (p === "/search") return "Search Members";
    if (p === "/add") return "Add New Member";
    if (p === "/fees") return "Today's Fees & Payment History";
    if (p === "/pending") return "Pending Fees & Reminders";
    if (p === "/analytics") return "Gym Analytics & Revenue";
    if (p === "/employees") return "Staff & Employees";
    if (p === "/activity") return "Staff Activity Log";
    if (p === "/settings") return "Gym Settings";
    return "Health Gym Dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* ============================================================ */}
      {/* 1. DESKTOP & TABLET SIDEBAR */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 z-30 transition-all duration-300 select-none ${
          tabletExpanded ? "lg:w-64 md:w-60" : "lg:w-64 md:w-20"
        } sticky top-0 h-screen`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-18 flex items-center px-4 border-b border-slate-100 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className={`transition-opacity duration-200 ${!tabletExpanded ? "md:hidden lg:block" : "block"}`}>
              <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight truncate">
                HEALTH GYM
              </h1>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Management System
              </p>
            </div>
          </div>

          <button
            onClick={() => setTabletExpanded(!tabletExpanded)}
            className="hidden md:flex lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Expand menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className={`truncate ${!tabletExpanded ? "md:hidden lg:inline" : "inline"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className={`overflow-hidden ${!tabletExpanded ? "md:hidden lg:block" : "block"}`}>
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  isOwner ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isOwner ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium text-sm transition-colors min-h-[44px] ${
              !tabletExpanded ? "md:justify-center lg:justify-start" : "justify-start"
            }`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={!tabletExpanded ? "md:hidden lg:inline" : "inline"}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMoreOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
              title="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile Gym Icon */}
            <div className="md:hidden w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* User info & quick action pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shadow-2xs">
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:flex md:hidden p-2 rounded-lg text-rose-600 hover:bg-rose-50"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg">
        <div className="grid grid-flow-col auto-cols-fr gap-1 items-center">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[50px] ${
                  isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[50px] ${
              mobileMoreOpen ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* 4. MOBILE NAVIGATION DRAWER */}
      {/* ============================================================ */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMoreOpen(false)}
          />

          <aside className="relative flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{user?.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm min-h-[48px] ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMoreOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm text-left min-h-[48px]"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;
