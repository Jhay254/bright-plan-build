import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VolunteerAuth from "./pages/VolunteerAuth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/app/ProtectedRoute";
import AppShell from "@/components/app/AppShell";
import HomePage from "./pages/app/HomePage";
import CocoonPage from "./pages/app/CocoonPage";
import JournalPage from "./pages/app/JournalPage";
import CommunityPage from "./pages/app/CommunityPage";
import ProfilePage from "./pages/app/ProfilePage";
import VolunteerDashboard from "./pages/app/VolunteerDashboard";
import SessionRequest from "@/components/cocoon/SessionRequest";
import ChatRoom from "@/components/cocoon/ChatRoom";
import JournalEditor from "@/components/journal/JournalEditor";
import JournalDetail from "@/components/journal/JournalDetail";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVolunteersPage from "./pages/admin/AdminVolunteersPage";
import AdminSessionsPage from "./pages/admin/AdminSessionsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCrisisPage from "./pages/app/AdminCrisisPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/volunteer" element={<VolunteerAuth />} />
              <Route path="/onboarding" element={<Onboarding />} />
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
              <Route path="/admin" element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="volunteers" element={<AdminVolunteersPage />} />
                <Route path="sessions" element={<AdminSessionsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="crisis" element={<AdminCrisisPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
