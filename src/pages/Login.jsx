import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const data = await login(username, password);
      toast.success(data.message || "Logged in successfully!");
      navigate("/search");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-200">
        {/* Left Side: Health Gym Branding Banner */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-3">
              HEALTH GYM
            </h1>
            <p className="text-blue-100 font-medium text-sm sm:text-base leading-relaxed">
              Fast, simple gym & fee punch card management software for daily reception counter speed.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-3 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <ShieldCheck className="w-4 h-4" /> Quick Demo Logins
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@gmail.com", "admin123")}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-all cursor-pointer"
              >
                Owner: admin@gmail.com / admin123
              </button>
              <button
                type="button"
                onClick={() => fillDemo("staff", "staff123")}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-all cursor-pointer"
              >
                Staff: staff / staff123
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to Health Gym management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@gmail.com or staff"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base transition-all bg-slate-50/50 min-h-[48px]"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-base transition-all bg-slate-50/50 min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Health Gym Staff & Owner Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
