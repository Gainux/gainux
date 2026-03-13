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
import LeavesPage from "./modules/hrm/pages/LeavesPage";
import PayrollRunDetails from "./modules/hrm/pages/PayrollRunDetails";
import PerformanceDashboard from "./modules/hrm/pages/performance/PerformanceDashboard";
import GoalListPage from "./modules/hrm/pages/performance/GoalListPage";
import ReviewListPage from "./modules/hrm/pages/performance/ReviewListPage";
import InvoiceList from "./modules/finance/pages/InvoiceList";
import CreateInvoice from "./modules/finance/pages/CreateInvoice";
import InvoiceDetails from "./modules/finance/pages/InvoiceDetails";
import EditInvoice from "./modules/finance/pages/EditInvoice";
import ExpenseList from "./modules/finance/pages/ExpenseList";
import GeneralLedgerPage from "./modules/finance/pages/GeneralLedgerPage";
import CreateBill from "./modules/finance/pages/CreateBill";
import PayablesPage from "./modules/finance/pages/PayablesPage";
import BankList from "./modules/finance/pages/BankList";


import LeadDetailsPage from "@/modules/crm/pages/LeadDetailsPage";

import DealDetailsPage from "@/modules/crm/pages/DealDetailsPage";

import QuotationsPage from "@/modules/crm/pages/QuotationsPage";

import CustomersPage from "@/modules/crm/pages/CustomersPage";
import CustomerDetailsPage from "@/modules/crm/pages/CustomerDetailsPage";
import SalesOrderListPage from "@/modules/crm/pages/SalesOrderListPage";
import SalesOrderFormPage from "@/modules/crm/pages/SalesOrderFormPage";

import ServiceCatalogPage from "@/modules/crm/pages/ServiceCatalogPage";
import ReferralLeadsPage from "@/modules/crm/pages/ReferralLeadsPage";

import ProjectsListPage from "@/modules/project-management/pages/ProjectsListPage";
import ProjectDetailsPage from "@/modules/project-management/pages/ProjectDetailsPage";

import CompanySettingsPage from "@/modules/system/pages/CompanySettingsPage";
import AuditLogsPage from "@/modules/system/pages/AuditLogsPage";
import UsersListPage from "@/modules/system/pages/UsersListPage";
import SecuritySettingsPage from "@/modules/system/pages/SecuritySettingsPage";





import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import OnboardingPage from "@/pages/auth/OnboardingPage";
import ProfilePage from "@/pages/auth/ProfilePage";
import SubscriptionExpiredPage from "@/pages/SubscriptionExpiredPage";
import SubscriptionGuard from "@/components/auth/SubscriptionGuard";

import SettingsPage from "@/pages/SettingsPage";
import BankDetails from "./modules/finance/pages/BankDetails";
import BudgetList from "./modules/finance/pages/BudgetList";
import BudgetDetails from "./modules/finance/pages/BudgetDetails";
import AssetList from "./modules/finance/pages/AssetList";
import AssetDetails from "./modules/finance/pages/AssetDetails";
import TaxRates from "./modules/finance/pages/TaxRates";
import ReferralPayoutsPage from "./modules/finance/pages/ReferralPayoutsPage";
import RecruitmentPage from "./modules/hrm/pages/RecruitmentPage";
import { PublicJobLayout } from "./modules/recruitment/public/PublicJobLayout";
import PublicJobBoard from "./modules/recruitment/public/PublicJobBoard";
import PublicJobDetails from "./modules/recruitment/public/PublicJobDetails";
import TrainingDashboard from "./modules/hrm/pages/training/TrainingDashboard";

const TaxReportPage = lazy(() => import('./modules/finance/pages/TaxReportPage'));
const AdvancedAnalyticsPage = lazy(() => import('./modules/overview/pages/AdvancedAnalyticsPage'));
const CustomReportsPage = lazy(() => import('./modules/overview/pages/CustomReportsPage'));

import ResourcePlanPage from "./modules/project-management/pages/ResourcePlanPage";
import TimesheetsPage from "./modules/project-management/pages/TimesheetsPage";


import EssDashboard from "./modules/ess/pages/EssDashboard";
import MyLeavesPage from "./modules/ess/pages/MyLeavesPage";
import MyAttendancePage from "./modules/ess/pages/MyAttendancePage";

import MyPerformancePage from "./modules/ess/pages/MyPerformancePage";

import WorkflowListPage from "./modules/automation/pages/WorkflowListPage";
import WorkflowBuilderPage from "./modules/automation/pages/WorkflowBuilderPage";
import BusinessRulesPage from "./modules/automation/pages/BusinessRulesPage";

import IntegrationsLayout from "./modules/integrations/pages/IntegrationsLayout";
import ConnectedAppsPage from "./modules/integrations/pages/ConnectedAppsPage";
import ApiKeysPage from "./modules/integrations/pages/ApiKeysPage";
import WebhooksPage from "./modules/integrations/pages/WebhooksPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModuleProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Public Career Pages */}
              <Route element={<PublicJobLayout />}>
                <Route path="/careers/:orgId" element={<PublicJobBoard />} />
                <Route path="/careers/:orgId/jobs/:jobId" element={<PublicJobDetails />} />
              </Route>

              {/* Protected Routes (No Org Required) */}
              <Route element={<ProtectedRoute requireOrg={false} />}>
                <Route path="/onboarding" element={<OnboardingPage />} />

              </Route>

              {/* Protected Routes (Org Required) */}
              <Route element={<ProtectedRoute requireOrg={true} />}>
                <Route path="/subscription/expired" element={<SubscriptionExpiredPage />} />
                {/* Check Subscription Status */}
                <Route element={<SubscriptionGuard />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />

                    {/* Employee Self Service (ESS) */}
                    <Route path="/ess/dashboard" element={<EssDashboard />} />
                    <Route path="/ess/leaves" element={<MyLeavesPage />} />
                    <Route path="/ess/attendance" element={<MyAttendancePage />} />
                    <Route path="/ess/performance" element={<MyPerformancePage />} />

                    {/* CRM Module */}
                    <Route element={<ModuleGuard moduleId="crm" />}>
                      <Route path="/crm/leads" element={<LeadsPage />} />
                      <Route path="/crm/leads/:id" element={<LeadDetailsPage />} />
                      <Route path="/crm/customers" element={<CustomersPage />} />
                      <Route path="/crm/customers/:id" element={<CustomerDetailsPage />} />
                      <Route path="/crm/deals" element={<DealsPage />} />
                      <Route path="/crm/deals/:id" element={<DealDetailsPage />} />
                      <Route path="/crm/quotes" element={<QuotationsPage />} />
                      <Route path="/crm/orders" element={<SalesOrderListPage />} />
                      <Route path="/crm/orders/new" element={<SalesOrderFormPage />} />
                      <Route path="/crm/orders/:id" element={<SalesOrderFormPage />} />
                      <Route path="/crm/services" element={<ServiceCatalogPage />} />
                      <Route path="/crm/referral-leads" element={<ReferralLeadsPage />} />

                      <Route path="/crm/*" element={<ComingSoonPage title="Sales & CRM" />} />
                    </Route>

                    {/* HRM Module */}
                    <Route element={<ModuleGuard moduleId="hrm" />}>
                      <Route path="/hrm/attendance" element={<AttendancePage />} />
                      <Route path="/hrm/leaves" element={<LeavesPage />} />
                      <Route path="/hrm/employees" element={<EmployeeList />} />
                      <Route path="/hrm/employees/:id" element={<EmployeeDetailsPage />} />
                      <Route path="/hrm/org-structure" element={<OrgStructurePage />} />
                      <Route path="/hrm/payroll" element={<PayrollPage />} />
                      <Route path="/hrm/payroll/:id" element={<PayrollRunDetails />} />
                      <Route path="/hrm/recruitment" element={<RecruitmentPage />} />
                      <Route path="/hrm/lms" element={<TrainingDashboard />} />
                      <Route path="/hrm/performance" element={<PerformanceDashboard />} />
                      <Route path="/hrm/performance/employee/:id" element={<PerformanceDashboard />} />
                      <Route path="/hrm/performance/goals" element={<GoalListPage />} />
                      <Route path="/hrm/performance/reviews" element={<ReviewListPage />} />
                      <Route path="/hrm/*" element={<ComingSoonPage title="Human Resources" />} />
                    </Route>

                    {/* Finance Module */}
                    <Route element={<ModuleGuard moduleId="finance" />}>


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
                      <Route path="/finance/assets" element={<AssetList />} />
                      <Route path="/finance/assets/:id" element={<AssetDetails />} />
                      <Route path="/finance/referral-payouts" element={<ReferralPayoutsPage />} />

                      <Route path="/finance/*" element={<ComingSoonPage title="Finance & Accounting" />} />
                    </Route>




                    {/* Projects Module */}
                    <Route element={<ModuleGuard moduleId="projects" />}>
                      <Route path="/projects" element={<ProjectsListPage />} />
                      <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                      <Route path="/projects/resources" element={<ResourcePlanPage />} />
                      <Route path="/projects/timesheets" element={<TimesheetsPage />} />
                      <Route path="/projects/*" element={<ComingSoonPage title="Project Management" />} />
                    </Route>

                    {/* Assets (EAM) - merged with Finance for now as per Sidebar */}
                    {/* <Route element={<ModuleGuard moduleId="assets" />}>
                        <Route path="/finance/assets" element={<AssetList />} />
                        <Route path="/finance/assets/:id" element={<AssetDetails />} />
                      </Route> */}



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
                      <Route path="/analytics/advanced" element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <AdvancedAnalyticsPage />
                        </Suspense>
                      } />
                      <Route path="/analytics/reports" element={
                        <Suspense fallback={<div>Loading...</div>}>
                          <CustomReportsPage />
                        </Suspense>
                      } />
                    </Route>

                    {/* Automation */}
                    <Route element={<ModuleGuard moduleId="automation" />}>
                      <Route path="/automation/workflows" element={<WorkflowListPage />} />
                      <Route path="/automation/workflows/new" element={<WorkflowBuilderPage />} />
                      <Route path="/automation/workflows/:id" element={<WorkflowBuilderPage />} />
                      <Route path="/automation/rules" element={<BusinessRulesPage />} />
                      <Route path="/automation/*" element={<Navigate to="/automation/workflows" replace />} />
                    </Route>

                    {/* Integrations */}
                    <Route element={<ModuleGuard moduleId="integrations" />}>
                      <Route path="/integrations" element={<IntegrationsLayout />}>
                        <Route index element={<Navigate to="/integrations/apps" replace />} />
                        <Route path="apps" element={<ConnectedAppsPage />} />
                        <Route path="api-keys" element={<ApiKeysPage />} />
                        <Route path="webhooks" element={<WebhooksPage />} />
                      </Route>
                    </Route>



                    {/* System Module (Settings & Users) */}
                    <Route element={<ModuleGuard moduleId="system" />}>
                      <Route element={<AdminGuard />}>
                        <Route path="/users" element={<UsersListPage />} />
                        <Route path="/system/company" element={<CompanySettingsPage />} />
                        <Route path="/system/audit" element={<AuditLogsPage />} />
                        <Route path="/system/security" element={<SecuritySettingsPage />} />

                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/system/*" element={<ComingSoonPage title="System Settings" />} />
                      </Route>
                    </Route>

                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
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
