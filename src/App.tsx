import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/ui/skeleton-card";

// Eagerly loaded (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProtectedRoute from "@/components/app/ProtectedRoute";
import AppShell from "@/components/app/AppShell";

// Lazy-loaded pages
const VolunteerAuth = lazy(() => import("./pages/VolunteerAuth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HomePage = lazy(() => import("./pages/app/HomePage"));
const CocoonPage = lazy(() => import("./pages/app/CocoonPage"));
const SessionRequest = lazy(() => import("@/components/cocoon/SessionRequest"));
const ChatRoom = lazy(() => import("@/components/cocoon/ChatRoom"));
const JournalPage = lazy(() => import("./pages/app/JournalPage"));
const JournalEditor = lazy(() => import("@/components/journal/JournalEditor"));
const JournalDetail = lazy(() => import("@/components/journal/JournalDetail"));
const CommunityPage = lazy(() => import("./pages/app/CommunityPage"));
const ProfilePage = lazy(() => import("./pages/app/ProfilePage"));
const VolunteerDashboard = lazy(() => import("./pages/app/VolunteerDashboard"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminVolunteersPage = lazy(() => import("./pages/admin/AdminVolunteersPage"));
const AdminSessionsPage = lazy(() => import("./pages/admin/AdminSessionsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminCrisisPage = lazy(() => import("./pages/app/AdminCrisisPage"));
const AdminCommunityPage = lazy(() => import("./pages/admin/AdminCommunityPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const PortfolioPublic = lazy(() => import("./pages/PortfolioPublic"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const SuspenseFallback = () => <PageSkeleton rows={4} />;

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/volunteer" element={<VolunteerAuth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                    <Route path="cocoon" element={<ErrorBoundary><CocoonPage /></ErrorBoundary>} />
                    <Route path="cocoon/new" element={<ErrorBoundary><SessionRequest /></ErrorBoundary>} />
                    <Route path="cocoon/:sessionId" element={<ErrorBoundary><ChatRoom /></ErrorBoundary>} />
                    <Route path="journal" element={<ErrorBoundary><JournalPage /></ErrorBoundary>} />
                    <Route path="journal/new" element={<ErrorBoundary><JournalEditor /></ErrorBoundary>} />
                    <Route path="journal/:entryId" element={<ErrorBoundary><JournalDetail /></ErrorBoundary>} />
                    <Route path="community" element={<ErrorBoundary><CommunityPage /></ErrorBoundary>} />
                    <Route path="profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
                    <Route path="volunteer" element={<ErrorBoundary><VolunteerDashboard /></ErrorBoundary>} />
                  </Route>
                  <Route path="/admin" element={<ErrorBoundary><Suspense fallback={<SuspenseFallback />}><AdminLayout /></Suspense></ErrorBoundary>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="volunteers" element={<AdminVolunteersPage />} />
                    <Route path="sessions" element={<AdminSessionsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="community" element={<AdminCommunityPage />} />
                    <Route path="crisis" element={<AdminCrisisPage />} />
                  </Route>
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/portfolio/:volunteerId" element={<PortfolioPublic />} />
                  <Route path="/verify/:certCode" element={<VerifyCertificate />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
