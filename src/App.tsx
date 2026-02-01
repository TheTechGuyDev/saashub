import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout";

// Pages
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
import Settings from "./pages/Settings";
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
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected app routes with layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/call-centre" element={<CallCentre />} />
              <Route path="/call-logs" element={<CallLogs />} />
              <Route path="/whatsapp" element={<WhatsApp />} />
              <Route path="/email-marketing" element={<EmailMarketing />} />
              <Route path="/tickets" element={<SupportTickets />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/acquisition" element={<CustomerAcquisition />} />
              <Route path="/social-media" element={<SocialMedia />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
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
