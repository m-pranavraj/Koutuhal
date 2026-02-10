import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ResumeProvider } from "@/context/ResumeContext";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

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

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResumeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/courses/:id" element={<CourseDetail />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
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
          </TooltipProvider>
        </ResumeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
