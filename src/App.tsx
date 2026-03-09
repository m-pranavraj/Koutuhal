import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ResumeProvider } from "@/context/ResumeContext";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth, AppRole } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─── PUBLIC PAGES (Koutuhal Shell — unchanged) ────────────────────────────────
import Home from "@/pages/Home";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import CareerReadiness from "@/pages/CareerReadiness";
import AiTutorTeaser from "@/pages/AiTutorTeaser";
import SchoolsProgram from "@/pages/SchoolsProgram";
import CollegesProgram from "@/pages/CollegesProgram";
import BusinessProgram from "@/pages/BusinessProgram";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import BookACallPage from "@/pages/BookACallPage";
import SearchMentors from "@/pages/SearchMentors";
import CourseCatalog from "@/pages/CourseCatalog";
import CourseDetail from "@/pages/CourseDetail";

// ─── AUTH PAGES ────────────────────────────────────────────────────────────────
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import OnboardingRolePage from "@/pages/OnboardingRolePage";

// ─── LEGACY TOOL PAGES (Koutuhal) ─────────────────────────────────────────────
import Resume from "@/pages/Resume";
import ResumeBuilder from "@/pages/ResumeBuilder";
import ResumeScanner from "@/pages/ResumeScanner";
import ResumeForge from "@/pages/ResumeForge";
import PortfolioBuilder from "@/pages/PortfolioBuilder";

// ─── DASHBOARD: Universal ─────────────────────────────────────────────────────
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsPage from "@/pages/dashboard/SettingsPage";

// ─── DASHBOARD: Student ───────────────────────────────────────────────────────
import BrowseJobs from "@/pages/dashboard/student/BrowseJobs";
import MyApplications from "@/pages/dashboard/student/MyApplications";
import StudentAssessments from "@/pages/dashboard/student/StudentAssessments";
import StudentInterviews from "@/pages/dashboard/student/StudentInterviews";
import StudentOffers from "@/pages/dashboard/student/StudentOffers";
import ResumeTailor from "@/pages/dashboard/student/ResumeTailor";
import FindMentors from "@/pages/dashboard/student/FindMentors";
import BookMentor from "@/pages/dashboard/student/BookMentor";

// ─── DASHBOARD: Organization ──────────────────────────────────────────────────
import PostJob from "@/pages/dashboard/organization/PostJob";
import MyListings from "@/pages/dashboard/organization/MyListings";
import OrgApplications from "@/pages/dashboard/organization/OrgApplications";
import OrgAssessments from "@/pages/dashboard/organization/OrgAssessments";
import OrgInterviews from "@/pages/dashboard/organization/OrgInterviews";
import OrgOffers from "@/pages/dashboard/organization/OrgOffers";

// ─── DASHBOARD: College ───────────────────────────────────────────────────────
import CollegeStudents from "@/pages/dashboard/college/CollegeStudents";
import PlacementTracking from "@/pages/dashboard/college/PlacementTracking";
import CollegeReports from "@/pages/dashboard/college/CollegeReports";

// ─── DASHBOARD: Mentor ────────────────────────────────────────────────────────
import MentorAvailability from "@/pages/dashboard/mentor/MentorAvailability";
import MentorReviews from "@/pages/dashboard/mentor/MentorReviews";

// ─── DASHBOARD: Shared ────────────────────────────────────────────────────────
import SessionsPage from "@/pages/dashboard/shared/SessionsPage";

// ─── DASHBOARD: Admin ─────────────────────────────────────────────────────────
import AdminUsers from "@/pages/dashboard/admin/AdminUsers";
import AdminAnalytics from "@/pages/dashboard/admin/AdminAnalytics";
import AdminModeration from "@/pages/dashboard/admin/AdminModeration";

// ─── MISC ──────────────────────────────────────────────────────────────────────
import NotFound from "@/pages/NotFound";

// ─── Role-based shared page routers ───────────────────────────────────────────
const SessionsRouter = () => {
  const { roles } = useAuth();
  return roles.includes("mentor") ? <SessionsPage role="mentor" /> : <SessionsPage role="student" />;
};
const ApplicationsRouter = () => {
  const { roles } = useAuth();
  return roles.includes("organization") ? <OrgApplications /> : <MyApplications />;
};
const AssessmentsRouter = () => {
  const { roles } = useAuth();
  return roles.includes("organization") ? <OrgAssessments /> : <StudentAssessments />;
};
const InterviewsRouter = () => {
  const { roles } = useAuth();
  return roles.includes("organization") ? <OrgInterviews /> : <StudentInterviews />;
};
const OffersRouter = () => {
  const { roles } = useAuth();
  return roles.includes("organization") ? <OrgOffers /> : <StudentOffers />;
};

// Helper: Dashboard route with DashboardLayout + ProtectedRoute
const DashRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const queryClient = new QueryClient();

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
                <ScrollToTop />
                <Routes>
                  {/* ── PUBLIC ROUTES (with Header + Footer) ─────────────── */}
                  <Route
                    path="/*"
                    element={
                      <>
                        <Header />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/book-a-call" element={<BookACallPage />} />
                          <Route path="/career-check" element={<CareerReadiness />} />
                          <Route path="/ai-tutor" element={<AiTutorTeaser />} />
                          <Route path="/programs/schools" element={<SchoolsProgram />} />
                          <Route path="/programs/colleges" element={<CollegesProgram />} />
                          <Route path="/programs/business" element={<BusinessProgram />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsAndConditions />} />

                          {/* Auth */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<SignUpPage />} />
                          <Route path="/onboarding" element={<OnboardingRolePage />} />

                          {/* Legacy Koutuhal tools (still accessible) */}
                          <Route path="/courses" element={<CourseCatalog />} />
                          <Route path="/courses/:id" element={<CourseDetail />} />
                          <Route path="/search-experts" element={<SearchMentors />} />
                          <Route path="/resume-active" element={<Resume />} />
                          <Route path="/resume-builder" element={<ResumeBuilder />} />
                          <Route path="/resume-scanner" element={<ResumeScanner />} />
                          <Route path="/resume-forge" element={<ResumeForge />} />
                          <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
                        </Routes>
                        <Footer />
                      </>
                    }
                  />

                  {/* ── DASHBOARD ROUTES (no public Header/Footer) ────────── */}
                  {/* Any authenticated user */}
                  <Route path="/dashboard" element={<DashRoute><DashboardHome /></DashRoute>} />
                  <Route path="/dashboard/settings" element={<DashRoute><SettingsPage /></DashRoute>} />

                  {/* Student-only */}
                  <Route path="/dashboard/jobs" element={<DashRoute allowedRoles={["student"]}><BrowseJobs /></DashRoute>} />
                  <Route path="/dashboard/mentors" element={<DashRoute allowedRoles={["student"]}><FindMentors /></DashRoute>} />
                  <Route path="/dashboard/book-mentor" element={<DashRoute allowedRoles={["student"]}><BookMentor /></DashRoute>} />
                  <Route path="/dashboard/resume-tailor" element={<DashRoute allowedRoles={["student"]}><ResumeTailor /></DashRoute>} />

                  {/* Shared: student + organization */}
                  <Route path="/dashboard/applications" element={<DashRoute allowedRoles={["student", "organization"]}><ApplicationsRouter /></DashRoute>} />
                  <Route path="/dashboard/assessments" element={<DashRoute allowedRoles={["student", "organization"]}><AssessmentsRouter /></DashRoute>} />
                  <Route path="/dashboard/interviews" element={<DashRoute allowedRoles={["student", "organization"]}><InterviewsRouter /></DashRoute>} />
                  <Route path="/dashboard/offers" element={<DashRoute allowedRoles={["student", "organization"]}><OffersRouter /></DashRoute>} />

                  {/* Organization-only */}
                  <Route path="/dashboard/post-job" element={<DashRoute allowedRoles={["organization"]}><PostJob /></DashRoute>} />
                  <Route path="/dashboard/listings" element={<DashRoute allowedRoles={["organization"]}><MyListings /></DashRoute>} />

                  {/* Sessions: student + mentor */}
                  <Route path="/dashboard/sessions" element={<DashRoute allowedRoles={["student", "mentor"]}><SessionsRouter /></DashRoute>} />

                  {/* Mentor-only */}
                  <Route path="/dashboard/availability" element={<DashRoute allowedRoles={["mentor"]}><MentorAvailability /></DashRoute>} />
                  <Route path="/dashboard/reviews" element={<DashRoute allowedRoles={["mentor"]}><MentorReviews /></DashRoute>} />

                  {/* College-only */}
                  <Route path="/dashboard/students" element={<DashRoute allowedRoles={["college"]}><CollegeStudents /></DashRoute>} />
                  <Route path="/dashboard/placement-tracking" element={<DashRoute allowedRoles={["college"]}><PlacementTracking /></DashRoute>} />
                  <Route path="/dashboard/reports" element={<DashRoute allowedRoles={["college"]}><CollegeReports /></DashRoute>} />

                  {/* Admin-only */}
                  <Route path="/dashboard/admin/users" element={<DashRoute allowedRoles={["admin"]}><AdminUsers /></DashRoute>} />
                  <Route path="/dashboard/admin/analytics" element={<DashRoute allowedRoles={["admin"]}><AdminAnalytics /></DashRoute>} />
                  <Route path="/dashboard/admin/moderation" element={<DashRoute allowedRoles={["admin"]}><AdminModeration /></DashRoute>} />

                  {/* 404 fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </ResumeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
