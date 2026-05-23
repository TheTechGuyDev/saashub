import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout";
import { LandingLayout } from "@/components/landing/LandingLayout";

// Landing pages
import LandingHome from "./pages/landing/LandingHome";
import Features from "./pages/landing/Features";
import Pricing from "./pages/landing/Pricing";
import Demo from "./pages/landing/Demo";
import IntegrationsPage from "./pages/landing/Integrations";
import Testimonials from "./pages/landing/Testimonials";
import Blog from "./pages/landing/Blog";
import Docs from "./pages/landing/Docs";
import FAQ from "./pages/landing/FAQ";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";
import Affiliates from "./pages/landing/Affiliates";
import Terms from "./pages/landing/Terms";
import Privacy from "./pages/landing/Privacy";

// App pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Analytics from "./pages/Analytics";
import CallCentre from "./pages/CallCentre";
import CallLogs from "./pages/CallLogs";
import WhatsApp from "./pages/WhatsApp";
import EmailMarketing from "./pages/EmailMarketing";
import SupportTickets from "./pages/SupportTickets";
import StaffManagement from "./pages/StaffManagement";
import Projects from "./pages/Projects";
import Branches from "./pages/Branches";
import Finance from "./pages/Finance";
import Inventory from "./pages/Inventory";
import CustomerAcquisition from "./pages/CustomerAcquisition";
import SocialMedia from "./pages/SocialMedia";
import Documents from "./pages/Documents";
import CalendarPage from "./pages/Calendar";
import KnowledgeBase from "./pages/KnowledgeBase";
import StaffLogs from "./pages/StaffLogs";
import Settings from "./pages/Settings";
import MyCustomerDetail from "./pages/MyCustomerDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public landing routes */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<LandingHome />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/affiliates" element={<Affiliates />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>

            {/* Auth */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected app routes with layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/analytics" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/call-centre" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <CallCentre />
                </ProtectedRoute>
              } />
              <Route path="/call-logs" element={<CallLogs />} />
              <Route path="/whatsapp" element={<WhatsApp />} />
              <Route path="/email-marketing" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <EmailMarketing />
                </ProtectedRoute>
              } />
              <Route path="/tickets" element={<SupportTickets />} />
              <Route path="/staff" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <StaffManagement />
                </ProtectedRoute>
              } />
              <Route path="/staff-logs" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <StaffLogs />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={<Projects />} />
              <Route path="/branches" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <Branches />
                </ProtectedRoute>
              } />
              <Route path="/finance" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <Finance />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/acquisition" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <CustomerAcquisition />
                </ProtectedRoute>
              } />
              <Route path="/social-media" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <SocialMedia />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={<Documents />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/my-customers/:id" element={<MyCustomerDetail />} />
              <Route path="/settings" element={
                <ProtectedRoute requiredRoles={["super_admin", "company_admin"]}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
