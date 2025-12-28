import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { AccessibilityProvider } from '@/lib/accessibility';

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportIncident from "./pages/citizen/ReportIncident";
import LiveFeed from "./pages/citizen/LiveFeed";

// Responder Pages
import ResponderDashboard from "./pages/responder/ResponderDashboard";
import PriorityQueue from "./pages/responder/PriorityQueue";
import LiveMap from "./pages/responder/LiveMap";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminConfiguration from "./pages/admin/Configuration";
import AdminAuditLogs from "./pages/admin/AuditLogs";

// Additional Citizen Pages
import MyReports from "./pages/citizen/MyReports";
import CitizenIncidentDetails from "./pages/citizen/IncidentDetails";

// Additional Responder Pages
import ResponderIncidentDetails from "./pages/responder/IncidentDetails";
import ActivityLogs from "./pages/responder/ActivityLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <AccessibilityProvider>
              <I18nextProvider i18n={i18n}>
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                {/* Citizen Routes (public) */}
                <Route path="/citizen" element={<CitizenDashboard />} />
                <Route path="/report" element={<ReportIncident />} />
                <Route path="/feed" element={<LiveFeed />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/incident/:id" element={<CitizenIncidentDetails />} />

                {/* Responder Routes (protected) */}
                <Route element={<ProtectedRoute roles={["responder"]} />}>  
                  <Route path="/responder" element={<ResponderDashboard />} />
                  <Route path="/responder/queue" element={<PriorityQueue />} />
                  <Route path="/responder/map" element={<LiveMap />} />
                  <Route path="/responder/incident/:id" element={<ResponderIncidentDetails />} />
                  <Route path="/responder/logs" element={<ActivityLogs />} />
                </Route>

                {/* Admin Routes (protected) */}
                <Route element={<ProtectedRoute roles={["admin"]} />}>  
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/config" element={<AdminConfiguration />} />
                  <Route path="/admin/logs" element={<AdminAuditLogs />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </I18nextProvider>
            </AccessibilityProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
