import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "@/modules/overview/pages/Dashboard";
import AnalyticsPage from "@/modules/overview/pages/AnalyticsPage";
import LeadsPage from "@/modules/crm/pages/LeadsPage";
import DealsPage from "@/modules/crm/pages/DealsPage";

import EmployeeList from "./modules/hrm/pages/EmployeeList";
import EmployeeDetailsPage from "./modules/hrm/pages/EmployeeDetailsPage";
import AttendancePage from "./modules/hrm/pages/AttendancePage";
import InvoiceList from "./modules/finance/pages/InvoiceList";
import CreateInvoice from "./modules/finance/pages/CreateInvoice";
import InvoiceDetails from "./modules/finance/pages/InvoiceDetails";
import EditInvoice from "./modules/finance/pages/EditInvoice";
import ExpenseList from "./modules/finance/pages/ExpenseList";

import LeadDetailsPage from "@/modules/crm/pages/LeadDetailsPage";

import DealDetailsPage from "@/modules/crm/pages/DealDetailsPage";

// import CRMDashboard from "@/modules/crm/pages/CRMDashboard";

import CustomersPage from "@/modules/crm/pages/CustomersPage";
import CustomerDetailsPage from "@/modules/crm/pages/CustomerDetailsPage";

import ProjectsListPage from "@/modules/project-management/pages/ProjectsListPage";
import ProjectDetailsPage from "@/modules/project-management/pages/ProjectDetailsPage";

import UsersListPage from "@/modules/system/pages/UsersListPage";

import ProductListPage from "@/modules/marketplace/pages/ProductListPage";
import ProductDetailsPage from "@/modules/marketplace/pages/ProductDetailsPage";
import OrderListPage from "@/modules/marketplace/pages/OrderListPage";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/auth/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/crm/leads" element={<LeadsPage />} />
                <Route path="/crm/leads/:id" element={<LeadDetailsPage />} />
                <Route path="/crm/customers" element={<CustomersPage />} />
                <Route path="/crm/customers/:id" element={<CustomerDetailsPage />} />
                <Route path="/crm/deals" element={<DealsPage />} />
                <Route path="/crm/deals/:id" element={<DealDetailsPage />} />
                <Route path="/hrm/attendance" element={<AttendancePage />} />
                <Route path="/hrm/employees" element={<EmployeeList />} />
                <Route path="/hrm/employees/:id" element={<EmployeeDetailsPage />} />
                <Route path="/finance/invoices/create" element={<CreateInvoice />} />
                <Route path="/finance/invoices/:id/edit" element={<EditInvoice />} />
                <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
                <Route path="/finance/invoices" element={<InvoiceList />} />
                <Route path="/finance/expenses" element={<ExpenseList />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />

                {/* Marketplace Routes */}
                <Route path="/marketplace/products" element={<ProductListPage />} />
                <Route path="/marketplace/products/new" element={<ProductDetailsPage />} />
                <Route path="/marketplace/products/:id" element={<ProductDetailsPage />} />
                <Route path="/marketplace/orders" element={<OrderListPage />} />

                <Route path="/users" element={<UsersListPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
