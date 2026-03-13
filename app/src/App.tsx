/* eslint-disable @typescript-eslint/no-explicit-any */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Referrer Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import WalletPage from "./pages/dashboard/WalletPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import NewLeadPage from "./pages/dashboard/NewLeadPage";

// Admin Pages moved to ERP

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public Routes */}
          <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route element={session ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Referrer Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leads/new" element={<NewLeadPage />} />

            {/* Admin Routes moved to ERP */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
