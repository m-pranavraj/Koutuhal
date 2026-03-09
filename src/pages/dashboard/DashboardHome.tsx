import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, Users, Calendar, FileText, TrendingUp, Clock, Award,
  ClipboardList, GraduationCap, Building2, ArrowRight,
} from "lucide-react";

interface StatItem {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  href?: string;
}

const DashboardHome = () => {
  const { user, profile, roles } = useAuth();
  const primaryRole = roles[0] || "student";
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, primaryRole]);

  const fetchStats = async () => {
    try {
      if (primaryRole === "student") {
        const { data: sp } = await supabase
          .from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
        if (!sp) {
          setStats([
            { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/applications" },
            { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: 0, href: "/dashboard/interviews" },
            { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: 0, href: "/dashboard/assessments" },
            { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/offers" },
          ]);
          setLoading(false);
          return;
        }
        const [appsRes, interviewsRes, submissionsRes, offersRes] = await Promise.all([
          supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", sp.id),
          supabase.from("applications").select("id, interviews!inner(id)").eq("student_id", sp.id),
          supabase.from("assessment_submissions").select("id", { count: "exact", head: true }).eq("student_id", sp.id).eq("status", "pending"),
          supabase.from("applications").select("id, offers!inner(id)").eq("student_id", sp.id),
        ]);
        setStats([
          { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: appsRes.count ?? 0, href: "/dashboard/applications" },
          { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: interviewsRes.data?.length ?? 0, href: "/dashboard/interviews" },
          { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: submissionsRes.count ?? 0, href: "/dashboard/assessments" },
          { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: offersRes.data?.length ?? 0, href: "/dashboard/offers" },
        ]);
      } else if (primaryRole === "organization") {
        const { data: org } = await supabase
          .from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
        if (!org) { setStats([]); setLoading(false); return; }
        const [jobsRes, appsRes] = await Promise.all([
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("org_id", org.id).eq("status", "open"),
          supabase.from("jobs").select("id, applications(id)").eq("org_id", org.id),
        ]);
        const totalApps = appsRes.data?.reduce((sum, j: any) => sum + (j.applications?.length ?? 0), 0) ?? 0;
        setStats([
          { label: "Active Listings", icon: <Briefcase className="h-5 w-5" />, value: jobsRes.count ?? 0, href: "/dashboard/listings" },
          { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: totalApps, href: "/dashboard/applications" },
          { label: "Interviews Scheduled", icon: <Calendar className="h-5 w-5" />, value: "â€”", href: "/dashboard/interviews" },
          { label: "Offers Issued", icon: <Award className="h-5 w-5" />, value: "â€”", href: "/dashboard/offers" },
        ]);
      } else if (primaryRole === "mentor") {
        const { data: mp } = await supabase
          .from("mentor_profiles").select("id").eq("user_id", user!.id).maybeSingle();
        if (!mp) { setStats([]); setLoading(false); return; }
        const [sessionsRes, reviewsRes] = await Promise.all([
          supabase.from("mentor_sessions").select("id, status").eq("mentor_id", mp.id),
          supabase.from("reviews").select("rating").eq("mentor_id", mp.id),
        ]);
        const upcoming = sessionsRes.data?.filter(s => s.status === "confirmed").length ?? 0;
        const total = sessionsRes.data?.length ?? 0;
        const avgRating = reviewsRes.data?.length
          ? (reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length).toFixed(1)
          : "N/A";
        setStats([
          { label: "Upcoming Sessions", icon: <Calendar className="h-5 w-5" />, value: upcoming, href: "/dashboard/sessions" },
          { label: "Total Sessions", icon: <Clock className="h-5 w-5" />, value: total, href: "/dashboard/sessions" },
          { label: "Average Rating", icon: <TrendingUp className="h-5 w-5" />, value: avgRating, href: "/dashboard/reviews" },
        ]);
      } else if (primaryRole === "college") {
        setStats([
          { label: "Students Registered", icon: <GraduationCap className="h-5 w-5" />, value: "â€”", href: "/dashboard/students" },
          { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: "â€”" },
          { label: "Companies Hiring", icon: <Building2 className="h-5 w-5" />, value: "â€”" },
          { label: "Offers Issued", icon: <Award className="h-5 w-5" />, value: "â€”" },
        ]);
      } else if (primaryRole === "admin") {
        const [usersRes, jobsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
        ]);
        setStats([
          { label: "Total Users", icon: <Users className="h-5 w-5" />, value: usersRes.count ?? 0, href: "/dashboard/admin/users" },
          { label: "Active Jobs", icon: <Briefcase className="h-5 w-5" />, value: jobsRes.count ?? 0 },
          { label: "Interviews Today", icon: <Calendar className="h-5 w-5" />, value: "â€”" },
          { label: "Offers This Month", icon: <Award className="h-5 w-5" />, value: "â€”" },
        ]);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: Record<string, string> = {
    student: "Browse available jobs, apply to opportunities, take assessments, or tailor your resume with AI.",
    organization: "Post new job listings, review applicants, schedule interviews, and manage offers.",
    college: "Monitor student placements, track hiring pipelines, and generate reports.",
    mentor: "Set your availability and manage upcoming sessions.",
    admin: "Manage users, review content, and view platform analytics.",
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || "User"}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening on your dashboard.</p>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border animate-pulse">
              <CardHeader className="pb-2"><div className="h-4 w-24 bg-muted rounded" /></CardHeader>
              <CardContent><div className="h-8 w-12 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-lg transition-shadow border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <div className="text-primary">{stat.icon}</div>
                </CardHeader>
                <CardContent className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  {stat.href && (
                    <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
                      <Link to={stat.href}>View <ArrowRight className="h-3 w-3 ml-1" /></Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="border">
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{quickActions[primaryRole] || quickActions.student}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;

