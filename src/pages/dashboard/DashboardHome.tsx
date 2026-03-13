import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationRow, OrganizationRow, StudentProfileRow } from "@/types/dashboard";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, Users, Calendar, FileText, TrendingUp, Clock, Award,
  ClipboardList, GraduationCap, Building2, ArrowRight, Download, Check, Star, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  href?: string;
}

const DashboardHome = () => {
  const { user, profile, primaryRole: authPrimaryRole, studentProfile } = useAuth();
  const primaryRole = authPrimaryRole || "student";
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, primaryRole, studentProfile]);

  // Refetch stats when page becomes visible (e.g., returning from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && primaryRole === "student") {
        fetchStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, primaryRole]);

  // Subscribe to real-time changes on student_profiles
  useEffect(() => {
    if (primaryRole !== "student" || !user) return;

    const channel = supabase
      .channel(`student_profiles:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, primaryRole]);

  // Keep organization stats live when hiring pipeline data changes.
  useEffect(() => {
    if (primaryRole !== "organization" || !user) return;

    const channel = supabase
      .channel(`org-dashboard:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "interviews" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchStats())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, primaryRole]);

  const fetchStats = async () => {
    try {
      if (primaryRole === "student") {
        const { data: sp, error: spError } = await supabase
          .from("student_profiles")
          .select("id, user_id")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (spError || !sp) {
          console.error("Student profile fetch error:", spError);
          setStats([
            { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/applications" },
            { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: 0, href: "/dashboard/interviews" },
            { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: 0, href: "/dashboard/assessments" },
            { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/offers" },
          ]);
          setLoading(false);
          return;
        }

        // Real Stats from DB
        const student_id = sp.id;
        console.log("=== Dashboard Stats Debug ===");
        console.log("Student ID:", student_id);
        
        try {
          // Fetch all applications
          const { data: appsData, error: appsError } = await supabase
            .from("applications")
            .select("id")
            .eq("student_id", student_id);

          console.log("Applications fetch error:", appsError);
          console.log("Applications data:", appsData);

          if (appsError) {
            throw new Error(`Failed to fetch applications: ${appsError.message}`);
          }

          const appIds = appsData?.map((a: any) => a.id) || [];
          const applicationCount = appsData?.length || 0;
          console.log("Application count:", applicationCount, "IDs:", appIds);

          // Fetch related counts in parallel
          const [interviewsRes, offersRes, assignmentsRes, assessmentSubmissionsRes] = await Promise.all([
            appIds.length > 0 
              ? supabase.from("interviews").select("id", { count: "exact", head: true }).in("application_id", appIds)
              : Promise.resolve({ count: 0 }),
            appIds.length > 0 
              ? supabase.from("offers").select("id", { count: "exact", head: true }).in("application_id", appIds)
              : Promise.resolve({ count: 0 }),
            supabase
              .from("assessment_assignments")
              .select("id, assessment_id, assessments(max_attempts)")
              .eq("student_id", student_id),
            supabase
              .from("assessment_submissions")
              .select("assessment_id")
              .eq("student_id", student_id),
          ]);

          const attemptsByAssessmentId: Record<string, number> = {};
          (assessmentSubmissionsRes.data || []).forEach((s: any) => {
            const key = s.assessment_id;
            attemptsByAssessmentId[key] = (attemptsByAssessmentId[key] || 0) + 1;
          });

          const pendingAssessmentCount = (assignmentsRes.data || []).reduce((count: number, a: any) => {
            const maxAttempts = a.assessments?.max_attempts ?? 1;
            const usedAttempts = attemptsByAssessmentId[a.assessment_id] || 0;
            return usedAttempts < maxAttempts ? count + 1 : count;
          }, 0);

          setStats([
            { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: applicationCount, href: "/dashboard/applications" },
            { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: interviewsRes.count ?? 0, href: "/dashboard/interviews" },
            { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: pendingAssessmentCount, href: "/dashboard/assessments" },
            { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: offersRes.count ?? 0, href: "/dashboard/offers" },
          ]);
        } catch (err) {
          console.error("Stats fetch error:", err);
          setStats([
            { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/applications" },
            { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: 0, href: "/dashboard/interviews" },
            { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: 0, href: "/dashboard/assessments" },
            { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/offers" },
          ]);
        }

        setLoading(false);
        


      } else if (primaryRole === "organization") {
        const { data: orgProfile } = await supabase
          .from("organization_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();

        const orgId = (orgProfile as any)?.id;

        if (!orgId) {
          setStats([
            { label: "Active Listings", icon: <Briefcase className="h-5 w-5" />, value: 0, href: "/dashboard/listings" },
            { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/applications" },
            { label: "Interviews Scheduled", icon: <Calendar className="h-5 w-5" />, value: 0, href: "/dashboard/interviews" },
            { label: "Offers Accepted", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/offers" },
          ]);
          setLoading(false);
          return;
        }

        const [jobsRes, appsRes] = await Promise.all([
          supabase.from("jobs").select("id, status").eq("org_id", orgId),
          supabase.from("applications").select("id, status, job_id, jobs!inner(org_id)").eq("jobs.org_id", orgId),
        ]);

        const jobs = (jobsRes.data || []) as any[];
        const apps = (appsRes.data || []) as any[];
        const appIds = apps.map((a: any) => a.id);

        const offersRes = appIds.length > 0
          ? await supabase.from("offers").select("application_id, status").in("application_id", appIds)
          : { data: [] as any[] };

        const offers = (offersRes.data || []) as any[];
        const activityRes = appIds.length > 0
          ? await supabase
              .from("application_activity")
              .select("application_id, event_type")
              .in("application_id", appIds)
              .eq("event_type", "Offer Accepted")
          : { data: [] as any[] };

        const acceptedByActivityAppIds = new Set(
          ((activityRes as any).data || []).map((r: any) => r.application_id)
        );
        const acceptedOfferAppIds = new Set(
          offers.filter((o) => o.status === "accepted").map((o) => o.application_id)
        );
        const activeOfferAppIds = new Set(
          offers.filter((o) => o.status !== "accepted" && o.status !== "rejected").map((o) => o.application_id)
        );

        const hiredCount = apps.filter((a: any) =>
          acceptedOfferAppIds.has(a.id) || acceptedByActivityAppIds.has(a.id) || a.status === "accepted"
        ).length;
        const interviewCount = apps.filter((a: any) => {
          if (acceptedOfferAppIds.has(a.id) || acceptedByActivityAppIds.has(a.id) || activeOfferAppIds.has(a.id)) return false;
          return a.status === "interview";
        }).length;

        setStats([
          { label: "Active Listings", icon: <Briefcase className="h-5 w-5" />, value: jobs.length, href: "/dashboard/listings" },
          { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: apps.length, href: "/dashboard/applications" },
          { label: "Interviews Scheduled", icon: <Calendar className="h-5 w-5" />, value: interviewCount, href: "/dashboard/interviews" },
          { label: "Offers Accepted", icon: <Award className="h-5 w-5" />, value: hiredCount, href: "/dashboard/offers" },
        ]);
      } else if (primaryRole === "mentor") {
        const { data: mp } = await supabase
          .from("mentor_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle() as any;
        if (!mp) { setStats([]); setLoading(false); return; }
        const mentor_id = (mp as any).id;
        const [sessionsRes, reviewsRes] = await Promise.all([
          supabase.from("mentor_sessions").select("id, status, session_date").eq("mentor_id", mentor_id),
          supabase.from("reviews").select("rating").eq("mentor_id", mentor_id),
        ]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = sessionsRes.data?.filter((s: any) => {
          const status = (s.status || "").toLowerCase();
          if (status !== "pending" && status !== "confirmed") return false;
          if (!s.session_date) return false;
          const sessionDate = new Date(`${s.session_date}T00:00:00`);
          return sessionDate >= today;
        }).length ?? 0;
        const total = sessionsRes.data?.length ?? 0;
        const avgRating = reviewsRes.data?.length
          ? (reviewsRes.data.reduce((s, r) => s + (r as any).rating, 0) / reviewsRes.data.length).toFixed(1)
          : "N/A";
        setStats([
          { label: "Upcoming Sessions", icon: <Calendar className="h-5 w-5" />, value: upcoming, href: "/dashboard/sessions" },
          { label: "Total Sessions", icon: <Clock className="h-5 w-5" />, value: total, href: "/dashboard/sessions" },
          { label: "Average Rating", icon: <TrendingUp className="h-5 w-5" />, value: avgRating, href: "/dashboard/reviews" },
        ]);
      } else if (primaryRole === "college") {
        const { data: cp } = await supabase.from("college_profiles").select("id").eq("user_id", user!.id).maybeSingle() as any;
        if (!cp) { setStats([]); setLoading(false); return; }
        const college_id = (cp as any).id;
        
        const { data: students } = await supabase.from("student_profiles").select("id").eq("college_id", college_id) as any;
        const studentIds = (students || []).map((s: any) => s.id);
        
        if (studentIds.length === 0) {
          setStats([
            { label: "Students Registered", icon: <GraduationCap className="h-5 w-5" />, value: 0, href: "/dashboard/students" },
            { label: "Placement Rate", icon: <TrendingUp className="h-5 w-5" />, value: "0%" },
            { label: "Job Applications", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/placement-tracking" },
            { label: "Total Offers", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/placement-tracking" },
          ]);
          setLoading(false);
          return;
        }

        const [appsCount, successfulAppsRes] = await Promise.all([
          supabase.from("applications").select("id", { count: "exact", head: true }).in("student_id", studentIds),
          supabase.from("applications").select("id, student_id")
            .in("status", ["accepted", "selected"])
            .in("student_id", studentIds)
        ]);
        
        const successfulApps = (successfulAppsRes.data || []) as any[];
        const placedStudentIds = new Set(successfulApps.map(a => a.student_id));
        
        const { data: offersData } = await supabase.from("offers")
          .select("salary")
          .in("application_id", successfulApps.map(a => a.id));

        const totalSalary = (offersData || []).reduce((sum, o: any) => {
          const val = parseInt(o.salary?.replace(/[^0-9]/g, '') || "0");
          return sum + val;
        }, 0);
        const averageCtc = (offersData?.length || 0) > 0 ? Math.round(totalSalary / (offersData?.length || 1)) : 0;
        
        const placementRate = studentIds.length > 0 
          ? Math.round((placedStudentIds.size / studentIds.length) * 100) 
          : 0;
        
        setStats([
          { label: "Students Registered", icon: <GraduationCap className="h-5 w-5" />, value: studentIds.length, href: "/dashboard/students" },
          { label: "Placement Rate", icon: <TrendingUp className="h-5 w-5" />, value: `${placementRate}%` },
          { label: "Average CTC", icon: <DollarSign className="h-5 w-5" />, value: averageCtc > 0 ? `INR ${averageCtc.toLocaleString()}` : "N/A", href: "/dashboard/placement-tracking" },
          { label: "Offers Secured", icon: <Award className="h-5 w-5" />, value: successfulApps.length, href: "/dashboard/placement-tracking" },
        ]);
      } else if (primaryRole === "admin") {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [usersRes, jobsRes, interviewsRes, offersRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("interviews").select("id", { count: "exact", head: true }).gte("scheduled_at", today),
          supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "selected").gte("updated_at", monthStart),
        ]);
        setStats([
          { label: "Total Users", icon: <Users className="h-5 w-5" />, value: usersRes.count ?? 0, href: "/dashboard/admin/users" },
          { label: "Active Jobs", icon: <Briefcase className="h-5 w-5" />, value: jobsRes.count ?? 0 },
          { label: "Interviews Today", icon: <Calendar className="h-5 w-5" />, value: interviewsRes.count ?? 0 },
          { label: "Offers This Month", icon: <Award className="h-5 w-5" />, value: offersRes.count ?? 0 },
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!</h1>
        <p className="text-neutral-500 mt-2 font-medium">Keep track of your performance and upcoming tasks.</p>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                    <div className="text-primary p-2 bg-primary/5 rounded-xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-4xl font-black text-white">{stat.value}</div>
                    {stat.href && (
                      <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase text-primary hover:text-primary hover:bg-primary/10 tracking-widest p-0 h-auto">
                        <Link to={stat.href} className="flex items-center gap-1">Detail <ArrowRight className="h-3 w-3 text-black" /></Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        {/* Quick Actions / Activity Callout */}
        <Card className="glass-card border-white/5 shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Your Dashboard
                </h4>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                  {quickActions[primaryRole] || quickActions.student}
                </p>
                <Button className="btn-green w-full group-hover:shadow-lg group-hover:shadow-primary/20 transition-all rounded-xl py-6" asChild>
                   <Link to={
                     primaryRole === 'student' ? "/dashboard/jobs" : 
                     primaryRole === 'organization' ? "/dashboard/listings" :
                     primaryRole === 'mentor' ? "/dashboard/sessions" :
                     primaryRole === 'college' ? "/dashboard/students" :
                     "/dashboard"
                   }>
                    {primaryRole === 'student' ? 'Explore Opportunities' : 
                     primaryRole === 'organization' ? 'Manage Jobs' :
                     primaryRole === 'mentor' ? 'View Sessions' :
                     primaryRole === 'college' ? 'View Students' :
                     'Get Started'}
                    <ArrowRight className="h-4 w-4 ml-2 text-black" />
                   </Link>
                </Button>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;

