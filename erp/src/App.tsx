import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ModuleProvider } from "@/context/ModuleContext";
import ModuleGuard from "@/components/auth/ModuleGuard";
import AdminGuard from "@/components/auth/AdminGuard";
import ComingSoonPage from "@/components/common/ComingSoonPage";
import Dashboard from "@/modules/overview/pages/Dashboard";
import AnalyticsPage from "@/modules/overview/pages/AnalyticsPage";
import LeadsPage from "@/modules/crm/pages/LeadsPage";
import DealsPage from "@/modules/crm/pages/DealsPage";

import EmployeeList from "./modules/hrm/pages/EmployeeList";
import EmployeeDetailsPage from "./modules/hrm/pages/EmployeeDetailsPage";
import OrgStructurePage from "./modules/hrm/pages/OrgStructurePage";
import AttendancePage from "./modules/hrm/pages/AttendancePage";
import PayrollPage from "./modules/hrm/pages/PayrollPage";
import PayrollRunDetails from "./modules/hrm/pages/PayrollRunDetails";
import InvoiceList from "./modules/finance/pages/InvoiceList";
import CreateInvoice from "./modules/finance/pages/CreateInvoice";
import InvoiceDetails from "./modules/finance/pages/InvoiceDetails";
import EditInvoice from "./modules/finance/pages/EditInvoice";
import ExpenseList from "./modules/finance/pages/ExpenseList";
import GeneralLedgerPage from "./modules/finance/pages/GeneralLedgerPage";
import CreateBill from "./modules/finance/pages/CreateBill";
import PayablesPage from "./modules/finance/pages/PayablesPage";
import BankList from "./modules/finance/pages/BankList";
import VendorList from "./modules/procurement/pages/VendorList";

import LeadDetailsPage from "@/modules/crm/pages/LeadDetailsPage";

import DealDetailsPage from "@/modules/crm/pages/DealDetailsPage";

// import CRMDashboard from "@/modules/crm/pages/CRMDashboard";

import CustomersPage from "@/modules/crm/pages/CustomersPage";
import CustomerDetailsPage from "@/modules/crm/pages/CustomerDetailsPage";

import ProjectsListPage from "@/modules/project-management/pages/ProjectsListPage";
import ProjectDetailsPage from "@/modules/project-management/pages/ProjectDetailsPage";

import CompanySettingsPage from "@/modules/system/pages/CompanySettingsPage";
import AuditLogsPage from "@/modules/system/pages/AuditLogsPage";
import UsersListPage from "@/modules/system/pages/UsersListPage";
import SecuritySettingsPage from "@/modules/system/pages/SecuritySettingsPage";

import ProductListPage from "@/modules/marketplace/pages/ProductListPage";
import ProductDetailsPage from "@/modules/marketplace/pages/ProductDetailsPage";
import OrderListPage from "@/modules/marketplace/pages/OrderListPage";



import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import ProfilePage from "@/pages/auth/ProfilePage";
import DepartmentModuleAccessPage from "@/pages/system/DepartmentModuleAccessPage";
import SettingsPage from "@/pages/SettingsPage";
import BankDetails from "./modules/finance/pages/BankDetails";
import BudgetList from "./modules/finance/pages/BudgetList";
import BudgetDetails from "./modules/finance/pages/BudgetDetails";
import AssetList from "./modules/finance/pages/AssetList";
import AssetDetails from "./modules/finance/pages/AssetDetails";
import TaxRates from "./modules/finance/pages/TaxRates";
import RecruitmentPage from "./modules/recruitment/pages/RecruitmentPage";
import { PublicJobLayout } from "./modules/recruitment/public/PublicJobLayout";
import PublicJobBoard from "./modules/recruitment/public/PublicJobBoard";
import PublicJobDetails from "./modules/recruitment/public/PublicJobDetails";

const TaxReportPage = lazy(() => import('./modules/finance/pages/TaxReportPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModuleProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Public Career Pages */}
              <Route element={<PublicJobLayout />}>
                <Route path="/careers/:orgId" element={<PublicJobBoard />} />
                <Route path="/careers/:orgId/jobs/:jobId" element={<PublicJobDetails />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />

                  {/* CRM Module */}
                  <Route element={<ModuleGuard moduleId="crm" />}>
                    <Route path="/crm/leads" element={<LeadsPage />} />
                    <Route path="/crm/leads/:id" element={<LeadDetailsPage />} />
                    <Route path="/crm/customers" element={<CustomersPage />} />
                    <Route path="/crm/customers/:id" element={<CustomerDetailsPage />} />
                    <Route path="/crm/deals" element={<DealsPage />} />
                    <Route path="/crm/deals/:id" element={<DealDetailsPage />} />
                    <Route path="/crm/*" element={<ComingSoonPage title="Sales & CRM" />} />
                  </Route>

                  {/* HRM Module */}
                  <Route element={<ModuleGuard moduleId="hrm" />}>
                    <Route path="/hrm/attendance" element={<AttendancePage />} />
                    <Route path="/hrm/employees" element={<EmployeeList />} />
                    <Route path="/hrm/employees/:id" element={<EmployeeDetailsPage />} />
                    <Route path="/hrm/org-structure" element={<OrgStructurePage />} />
                    <Route path="/hrm/payroll" element={<PayrollPage />} />
                    <Route path="/hrm/payroll/:id" element={<PayrollRunDetails />} />
                    <Route path="/hrm/recruitment" element={<RecruitmentPage />} />
                    <Route path="/hrm/*" element={<ComingSoonPage title="Human Resources" />} />
                  </Route>

                  {/* Finance Module */}
                  <Route element={<ModuleGuard moduleId="finance" />}>
                    import CreateBill from "./modules/finance/pages/CreateBill";
                    import PayablesPage from "./modules/finance/pages/PayablesPage";

                    <Route path="/finance/gl" element={<GeneralLedgerPage />} />
                    <Route path="/finance/invoices/create" element={<CreateInvoice />} />
                    <Route path="/finance/invoices/:id/edit" element={<EditInvoice />} />
                    <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/finance/invoices" element={<InvoiceList />} />
                    <Route path="/finance/payables/create" element={<CreateBill />} />
                    <Route path="/finance/payables" element={<PayablesPage />} />
                    <Route path="/finance/expenses" element={<ExpenseList />} />
                    <Route path="/finance/banking" element={<BankList />} />
                    <Route path="/finance/banking/:id" element={<BankDetails />} />
                    <Route path="/finance/budgeting" element={<BudgetList />} />
                    <Route path="/finance/budgeting/:id" element={<BudgetDetails />} />

                    <Route path="/finance/*" element={<ComingSoonPage title="Finance & Accounting" />} />
                  </Route>

                  import VendorList from "./modules/procurement/pages/VendorList";

                  {/* Procurement & Supply Chain */}
                  <Route element={<ModuleGuard moduleId="supply-chain" />}>
                    <Route path="/procurement/vendors" element={<VendorList />} />
                    <Route path="/procurement/*" element={<ComingSoonPage title="Procurement & Supply Chain" />} />
                  </Route>

                  {/* Manufacturing */}
                  <Route element={<ModuleGuard moduleId="manufacturing" />}>
                    <Route path="/manufacturing/*" element={<ComingSoonPage title="Manufacturing" />} />
                  </Route>

                  {/* Projects Module */}
                  <Route element={<ModuleGuard moduleId="projects" />}>
                    <Route path="/projects" element={<ProjectsListPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                    <Route path="/projects/*" element={<ComingSoonPage title="Project Management" />} />
                  </Route>

                  {/* Assets (EAM) */}
                  <Route element={<ModuleGuard moduleId="assets" />}>
                    <Route path="/finance/assets" element={<AssetList />} />
                    <Route path="/finance/assets/:id" element={<AssetDetails />} />
                  </Route>

                  {/* Logistics */}
                  <Route element={<ModuleGuard moduleId="logistics" />}>
                    <Route path="/logistics/*" element={<ComingSoonPage title="Logistics & Distribution" />} />
                  </Route>

                  {/* Quality */}
                  <Route element={<ModuleGuard moduleId="quality" />}>
                    <Route path="/quality/*" element={<ComingSoonPage title="Quality & Compliance" />} />
                  </Route>

                  {/* Tax & Compliance */}
                  <Route element={<ModuleGuard moduleId="finance" />}>
                    <Route path="/finance/tax" element={<TaxRates />} />
                  </Route>

                  {/* Tax & Compliance */}
                  {/* Tax & Compliance */}
                  <Route element={<ModuleGuard moduleId="finance" />}>
                    <Route path="/finance/tax" element={<TaxRates />} />
                    <Route path="/finance/tax/report" element={
                      <Suspense fallback={<div className="p-8">Loading report...</div>}>
                        <TaxReportPage />
                      </Suspense>
                    } />
                  </Route>

                  {/* Analytics */}
                  <Route element={<ModuleGuard moduleId="analytics" />}>
                    <Route path="/analytics/advanced" element={<ComingSoonPage title="Advanced Analytics" />} />
                    <Route path="/analytics/*" element={<ComingSoonPage title="BI & Analytics" />} />
                  </Route>

                  {/* Automation */}
                  <Route element={<ModuleGuard moduleId="automation" />}>
                    <Route path="/automation/*" element={<ComingSoonPage title="Workflow & Automation" />} />
                  </Route>

                  {/* Integrations */}
                  <Route element={<ModuleGuard moduleId="integrations" />}>
                    <Route path="/integrations/*" element={<ComingSoonPage title="API & Integrations" />} />
                  </Route>

                  {/* Industry Specific */}
                  <Route element={<ModuleGuard moduleId="retail" />}>
                    <Route path="/retail/*" element={<ComingSoonPage title="Retail & POS" />} />
                  </Route>
                  <Route element={<ModuleGuard moduleId="healthcare" />}>
                    <Route path="/healthcare/*" element={<ComingSoonPage title="Healthcare (HIS)" />} />
                  </Route>
                  <Route element={<ModuleGuard moduleId="construction" />}>
                    <Route path="/construction/*" element={<ComingSoonPage title="Construction" />} />
                  </Route>

                  {/* Marketplace Module */}
                  <Route element={<ModuleGuard moduleId="marketplace" />}>
                    <Route path="/marketplace/products" element={<ProductListPage />} />
                    <Route path="/marketplace/products/new" element={<ProductDetailsPage />} />
                    <Route path="/marketplace/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/marketplace/orders" element={<OrderListPage />} />
                    <Route path="/marketplace/*" element={<ComingSoonPage title="Marketplace & Add-ons" />} />
                  </Route>

                  {/* System Module (Settings & Users) */}
                  <Route element={<ModuleGuard moduleId="system" />}>
                    <Route element={<AdminGuard />}>
                      <Route path="/users" element={<UsersListPage />} />
                      <Route path="/system/company" element={<CompanySettingsPage />} />
                      <Route path="/system/audit" element={<AuditLogsPage />} />
                      <Route path="/system/security" element={<SecuritySettingsPage />} />
                      <Route path="/system/department-access" element={<DepartmentModuleAccessPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/system/*" element={<ComingSoonPage title="System Settings" />} />
                    </Route>
                  </Route>

                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ModuleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
