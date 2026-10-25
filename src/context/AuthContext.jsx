import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("gym_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("gym_auth_token") || "");
  const [loading, setLoading] = useState(true);

  // Check current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("gym_auth_token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("gym_user", JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem("gym_auth_token", receivedToken);
      localStorage.setItem("gym_user", JSON.stringify(receivedUser));
      return res.data;
    }
    throw new Error(res.data.message || "Login failed");
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("gym_auth_token");
    localStorage.removeItem("gym_user");
  };

  const isOwner = user?.role === "owner";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOwner,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
