import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { user, profile, roles } = useAuth();
  const primaryRole = roles[0] || "student";
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileStrength, setProfileStrength] = useState({
    percentage: 0,
    items: [
      { id: 'headline', label: 'Set a professional headline', completed: false, icon: <FileText className="h-4 w-4" /> },
      { id: 'skills', label: 'Add at least 3 skills', completed: false, icon: <Award className="h-4 w-4" /> },
      { id: 'education', label: 'Add your education details', completed: false, icon: <GraduationCap className="h-4 w-4" /> },
      { id: 'bio', label: 'Write a short bio', completed: false, icon: <Users className="h-4 w-4" /> },
      { id: 'resume', label: 'Upload your resume', completed: false, icon: <Download className="h-4 w-4" /> },
    ]
  });
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [highMatchCount, setHighMatchCount] = useState(0);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, primaryRole]);

  const fetchStats = async () => {
    try {
      if (primaryRole === "student") {
        const { data: sp } = await supabase
          .from("student_profiles")
          .select("*, profiles:user_id(avatar_url, bio, full_name)")
          .eq("user_id", user!.id)
          .maybeSingle();

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

        const student_p = sp as any;
        const skills = student_p.skills || [];
        setStudentSkills(skills);

        // Calculate Profile Strength (Dynamic)
        const strengthItems = [
          { id: 'headline', label: 'Set a professional headline', completed: !!student_p.headline, icon: <FileText className="h-4 w-4" /> },
          { id: 'skills', label: 'Add at least 3 skills', completed: skills.length >= 3, icon: <Award className="h-4 w-4" /> },
          { id: 'education', label: 'Add your education details', completed: !!student_p.degree || (Array.isArray(student_p.education) && student_p.education.length > 0), icon: <GraduationCap className="h-4 w-4" /> },
          { id: 'bio', label: 'Write a short bio', completed: (student_p.profiles?.bio?.length || 0) > 20, icon: <Users className="h-4 w-4" /> },
          { id: 'resume', label: 'Upload your resume', completed: !!student_p.resume_url, icon: <Download className="h-4 w-4" /> },
        ];
        const completedCount = strengthItems.filter(i => i.completed).length;
        setProfileStrength({
          percentage: Math.round((completedCount / strengthItems.length) * 100),
          items: strengthItems
        });

        // Real Stats from DB
        const student_id = (sp as any).id;
        const [appsRes, interviewsRes, submissionsRes, offersRes] = await Promise.all([
          supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", student_id),
          supabase.from("interviews").select("id", { count: "exact", head: true }).in("application_id", (await supabase.from("applications").select("id").eq("student_id", student_id)).data?.map(a => (a as any).id) || []),
          supabase.from("assessment_assignments").select("id", { count: "exact", head: true }).eq("student_id", student_id).eq("status", "pending"),
          supabase.from("offers").select("id", { count: "exact", head: true }).in("application_id", (await supabase.from("applications").select("id").eq("student_id", student_id)).data?.map(a => (a as any).id) || []),
        ]);
        
        setStats([
          { label: "Applications Sent", icon: <FileText className="h-5 w-5" />, value: appsRes.count ?? 0, href: "/dashboard/applications" },
          { label: "Upcoming Interviews", icon: <Calendar className="h-5 w-5" />, value: interviewsRes.count ?? 0, href: "/dashboard/interviews" },
          { label: "Assessments Pending", icon: <ClipboardList className="h-5 w-5" />, value: submissionsRes.count ?? 0, href: "/dashboard/assessments" },
          { label: "Offers Received", icon: <Award className="h-5 w-5" />, value: offersRes.count ?? 0, href: "/dashboard/offers" },
        ]);

        // Dynamic High Match Count (Uses job_match_scores view)
        const { count: matchCount } = await supabase
          .from("job_match_scores" as any)
          .select("application_id", { count: "exact", head: true })
          .eq("student_id", student_id)
          .gte("match_score", 70);
        
        setHighMatchCount(matchCount ?? 0);

      } else if (primaryRole === "organization") {
        // Use the new recruiter_dashboard view
        const { data: analytics } = await supabase
          .from("recruiter_dashboard" as any)
          .select("*")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (analytics) {
          const stats_data = analytics as any;
          setStats([
            { label: "Active Listings", icon: <Briefcase className="h-5 w-5" />, value: stats_data.total_jobs || 0, href: "/dashboard/listings" },
            { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: stats_data.total_applications || 0, href: "/dashboard/applications" },
            { label: "Interviews Scheduled", icon: <Calendar className="h-5 w-5" />, value: stats_data.total_interviews || 0, href: "/dashboard/interviews" },
            { label: "Offers Accepted", icon: <Award className="h-5 w-5" />, value: stats_data.total_hired || 0, href: "/dashboard/offers" },
          ]);
        } else {
          setStats([
            { label: "Active Listings", icon: <Briefcase className="h-5 w-5" />, value: 0, href: "/dashboard/listings" },
            { label: "Total Applications", icon: <FileText className="h-5 w-5" />, value: 0, href: "/dashboard/applications" },
            { label: "Interviews Scheduled", icon: <Calendar className="h-5 w-5" />, value: 0, href: "/dashboard/interviews" },
            { label: "Offers Issued", icon: <Award className="h-5 w-5" />, value: 0, href: "/dashboard/offers" },
          ]);
        }
      } else if (primaryRole === "mentor") {
        const { data: mp } = await supabase
          .from("mentor_profiles")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();
        if (!mp) { setStats([]); setLoading(false); return; }
        const mentor_id = (mp as any).id;
        const [sessionsRes, reviewsRes] = await Promise.all([
          supabase.from("mentor_sessions").select("id, status").eq("mentor_id", mentor_id),
          supabase.from("reviews").select("rating").eq("mentor_id", mentor_id),
        ]);
        const upcoming = sessionsRes.data?.filter(s => (s as any).status === "confirmed").length ?? 0;
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
        const { data: cp } = await supabase.from("college_profiles").select("id").eq("user_id", user!.id).maybeSingle();
        if (!cp) { setStats([]); setLoading(false); return; }
        const college_id = (cp as any).id;
        
        const { data: students } = await supabase.from("student_profiles").select("id").eq("college_id", college_id);
        const studentIds = students?.map(s => (s as any).id) || [];
        
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

        const [appsCount, offersRes] = await Promise.all([
          supabase.from("applications").select("id", { count: "exact", head: true }).in("student_id", studentIds),
          supabase.from("offers").select("salary, application_id")
            .eq("status", "accepted")
            .in("application_id", (await supabase.from("applications").select("id").in("student_id", studentIds)).data?.map(o => (o as any).id) || []),
        ]);
        
        const acceptedOffers = (offersRes.data || []) as any[];
        const placedStudentIds = new Set(acceptedOffers.map(o => {
          // We need student_id for these offers to calculate placement rate
          // For now we'll assume 1 offer = 1 student for the count if we don't have the reverse map here
          // But a more accurate way would be to fetch student_id in the offers query if schema allows
          return o.application_id; // Using application_id as proxy for unique placement entry
        }));

        const totalSalary = acceptedOffers.reduce((sum, o) => {
          const val = parseInt(o.salary?.replace(/[^0-9]/g, '') || "0");
          return sum + val;
        }, 0);
        
        const avgCTC = acceptedOffers.length > 0 
          ? `₹${Math.round(totalSalary / acceptedOffers.length / 100000).toFixed(1)}L` 
          : "₹0";

        const placementRate = studentIds.length > 0 
          ? Math.round((placedStudentIds.size / studentIds.length) * 100) 
          : 0;
        
        setStats([
          { label: "Students Registered", icon: <GraduationCap className="h-5 w-5" />, value: studentIds.length, href: "/dashboard/students" },
          { label: "Placement Rate", icon: <TrendingUp className="h-5 w-5" />, value: `${placementRate}%` },
          { label: "Job Applications", icon: <FileText className="h-5 w-5" />, value: appsCount.count || 0, href: "/dashboard/placement-tracking" },
          { label: "Offers Secured", icon: <Award className="h-5 w-5" />, value: acceptedOffers.length, href: "/dashboard/placement-tracking" },
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!</h1>
          <p className="text-neutral-500 mt-2 font-medium">Keep track of your performance and upcoming tasks.</p>
        </motion.div>
        {primaryRole === "student" && profileStrength.percentage < 100 && (
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse">
            Complete your profile to unlock more jobs
          </Badge>
        )}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Strength Checklist */}
        {primaryRole === "student" && (
          <Card className="lg:col-span-1 glass-card border-white/5 shadow-premium overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white tracking-tight">Profile Strength</CardTitle>
                <span className="text-2xl font-black text-primary">{profileStrength.percentage}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${profileStrength.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-primary h-full shadow-[0_0_10px_rgba(173,255,68,0.5)]" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {profileStrength.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                        item.completed ? "bg-primary/20 text-primary" : "bg-white/5 text-neutral-500 group-hover:bg-white/10"
                      )}>
                        {item.icon}
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-all",
                        item.completed ? "text-white/40 line-through decoration-primary/50" : "text-white group-hover:text-primary"
                      )}>
                        {item.label}
                      </span>
                    </div>
                    {item.completed ? (
                       <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                       </div>
                    ) : (
                      <Link to="/dashboard/settings">
                        <ArrowRight className="h-4 w-4 text-black group-hover:text-primary transition-colors" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions / Activity Callout */}
        <Card className={cn("glass-card border-white/5 shadow-premium", primaryRole === "student" ? "lg:col-span-2" : "lg:col-span-3")}>
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
               
               <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Star className="h-32 w-32 text-primary" />
                </div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  AI Coach Insights
                </h4>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                  {highMatchCount > 0 
                    ? `Our AI Coach has analyzed your profile and matched you with ${highMatchCount} potential high-match roles.`
                    : "Complete your profile skills to get personalized job recommendations from our AI Coach."}
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-white/10 hover:bg-white/5 text-white rounded-xl py-6 group-hover:border-primary/50 transition-colors"
                >
                  <Link to="/dashboard/jobs?filter=high-match">
                    View Recommendations
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

