import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ResumeProvider } from "@/context/ResumeContext";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Home from "@/pages/Home";
import SearchMentors from "@/pages/SearchMentors";
import Jobs from "@/pages/Jobs";
import Resume from "@/pages/Resume";
import ResumeBuilder from "@/pages/ResumeBuilder";
import ResumeScanner from "@/pages/ResumeScanner";
import Dashboard from "@/pages/Dashboard";
// import AiTutor from "@/pages/AiTutor"; // Commented out — re-enable when needed
import CourseCatalog from "@/pages/CourseCatalog";
import CourseDetail from "@/pages/CourseDetail"; // Changed to default import
import NotFound from "@/pages/NotFound";

import PortfolioBuilder from "@/pages/PortfolioBuilder";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
const queryClient = new QueryClient();

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";

import OnboardingRolePage from "@/pages/OnboardingRolePage";
import SignUpPage from "@/pages/SignUpPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const ProtectedRoute = ({ requireOnboarding = false, requireAdmin = false }: { requireOnboarding?: boolean; requireAdmin?: boolean }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#ADFF44] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logic: 
  // If accessing /onboarding (requireOnboarding=true):
  //    - If already completed -> Redirect to dashboard
  //    - If not completed -> Allow
  if (requireOnboarding) {
    if (user?.onboarding_completed) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // If accessing Admin (requireAdmin=true):
  if (requireAdmin) {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // If accessing normal protected routes (requireOnboarding=false/undefined):
  //    - If not completed -> Redirect to onboarding
  if (!user?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResumeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <BrowserRouter>
                <Header />
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<SignUpPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  <Route element={<ProtectedRoute requireOnboarding={true} />}>
                    <Route path="/onboarding" element={<OnboardingRolePage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute requireAdmin={true} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* Protected Routes (Dashboard etc) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/courses" element={<CourseCatalog />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/search-experts" element={<SearchMentors />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/resume-active" element={<Resume />} />
                    <Route path="/resume-builder" element={<ResumeBuilder />} />
                    <Route path="/resume-scanner" element={<ResumeScanner />} />
                    <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* <Route path="/ai-tutor" element={<AiTutor />} /> */}
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </ResumeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider >
);

export default App;
