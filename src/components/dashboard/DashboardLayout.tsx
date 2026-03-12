import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard, Briefcase, GraduationCap, Users, Calendar, Star,
  Settings, LogOut, Menu, X, FileText, Search, BarChart3, Shield,
  Building2, ClipboardList, Video, Award, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
    { label: "Browse Jobs", icon: <Search className="h-5 w-5" />, href: "/dashboard/jobs" },
    { label: "My Applications", icon: <FileText className="h-5 w-5" />, href: "/dashboard/applications" },
    { label: "Assessments", icon: <ClipboardList className="h-5 w-5" />, href: "/dashboard/assessments" },
    { label: "Interviews", icon: <Video className="h-5 w-5" />, href: "/dashboard/interviews" },
    { label: "Offers", icon: <Award className="h-5 w-5" />, href: "/dashboard/offers" },
    { label: "Find Mentors", icon: <Users className="h-5 w-5" />, href: "/dashboard/mentors" },
    { label: "My Sessions", icon: <Calendar className="h-5 w-5" />, href: "/dashboard/sessions" },
    { label: "Resume Tailor", icon: <FileText className="h-5 w-5" />, href: "/dashboard/resume-tailor" },
  ],
  organization: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
    { label: "Post Job", icon: <Briefcase className="h-5 w-5" />, href: "/dashboard/post-job" },
    { label: "My Listings", icon: <FileText className="h-5 w-5" />, href: "/dashboard/listings" },
    { label: "Applications", icon: <GraduationCap className="h-5 w-5" />, href: "/dashboard/applications" },
    { label: "Assessments", icon: <ClipboardList className="h-5 w-5" />, href: "/dashboard/assessments" },
    { label: "Interviews", icon: <Video className="h-5 w-5" />, href: "/dashboard/interviews" },
    { label: "Offers", icon: <Award className="h-5 w-5" />, href: "/dashboard/offers" },
    { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/analytics" },
  ],
  college: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
    { label: "Students", icon: <Users className="h-5 w-5" />, href: "/dashboard/students" },
    { label: "Placement Tracking", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/placement-tracking" },
    { label: "Reports", icon: <BookOpen className="h-5 w-5" />, href: "/dashboard/reports" },
  ],
  mentor: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
    { label: "My Sessions", icon: <Calendar className="h-5 w-5" />, href: "/dashboard/sessions" },
    { label: "Availability", icon: <Calendar className="h-5 w-5" />, href: "/dashboard/availability" },
    { label: "Reviews", icon: <Star className="h-5 w-5" />, href: "/dashboard/reviews" },
  ],
  admin: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
    { label: "Users", icon: <Users className="h-5 w-5" />, href: "/dashboard/admin/users" },
    { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/admin/analytics" },
    { label: "Moderation", icon: <Shield className="h-5 w-5" />, href: "/dashboard/admin/moderation" },
  ],
};

const roleLabels: Record<string, string> = {
  student: "Student",
  organization: "Organization",
  college: "College",
  mentor: "Mentor",
  admin: "Admin",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, roles, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const primaryRole = roles.length > 0 ? roles[0] : "student";
  const navItems = roleNavItems[primaryRole] || roleNavItems.student;
  const initials = profile?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar â€” dark */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="Koutuhal Logo" className="h-12 w-auto object-contain" />
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1.5 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <span className={cn(
                  "transition-transform duration-200 group-hover:scale-110",
                  location.pathname === item.href ? "text-primary-foreground" : "text-primary"
                )}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-sidebar-border p-4 bg-sidebar-accent/30">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-sidebar-foreground">{profile?.full_name || "User"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary/80 uppercase tracking-wider">{roleLabels[primaryRole] || primaryRole}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="justify-start h-9 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg" asChild>
                <Link to="/dashboard/settings"><Settings className="h-4 w-4 mr-2" /> Settings</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-center h-9 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/50">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;

