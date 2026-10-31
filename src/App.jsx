import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import OwnerRoute from "./routes/OwnerRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import AddMember from "./pages/AddMember";
import SearchMembers from "./pages/SearchMembers";
import MemberDetail from "./pages/MemberDetail";
import PendingFees from "./pages/PendingFees";
import FeesDashboard from "./pages/FeesDashboard";
import Analytics from "./pages/Analytics";
import Employees from "./pages/Employees";
import ActivityLog from "./pages/ActivityLog";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Routes with Main Shell Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/search" replace />} />
                <Route path="/search" element={<SearchMembers />} />
                <Route path="/add" element={<AddMember />} />
                <Route path="/fees" element={<FeesDashboard />} />
                <Route path="/member/:id" element={<MemberDetail />} />
                <Route path="/pending" element={<PendingFees />} />

                {/* Owner Only Protected Routes */}
                <Route element={<OwnerRoute />}>
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
