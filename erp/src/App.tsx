import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "@/modules/overview/pages/Dashboard";
import LeadsPage from "@/modules/crm/pages/LeadsPage";
import DealsPage from "@/modules/crm/pages/DealsPage";

import EmployeeList from "./modules/hrm/pages/EmployeeList";
import InvoiceList from "./modules/finance/pages/InvoiceList";

import LeadDetailsPage from "@/modules/crm/pages/LeadDetailsPage";

import DealDetailsPage from "@/modules/crm/pages/DealDetailsPage";

// import CRMDashboard from "@/modules/crm/pages/CRMDashboard";

import CustomersPage from "@/modules/crm/pages/CustomersPage";
import CustomerDetailsPage from "@/modules/crm/pages/CustomerDetailsPage";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/auth/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crm/leads" element={<LeadsPage />} />
              <Route path="/crm/leads/:id" element={<LeadDetailsPage />} />
              <Route path="/crm/customers" element={<CustomersPage />} />
              <Route path="/crm/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/crm/deals" element={<DealsPage />} />
              <Route path="/crm/deals/:id" element={<DealDetailsPage />} />
              <Route path="/hrm/employees" element={<EmployeeList />} />
              <Route path="/finance/invoices" element={<InvoiceList />} />
              <Route path="/users" element={<div>Users Page (Placeholder)</div>} />
              <Route path="/settings" element={<div>Settings Page (Placeholder)</div>} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
