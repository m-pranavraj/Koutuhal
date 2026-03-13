import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Award, Briefcase, Users, TrendingUp, DollarSign, Clock, MapPin, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApplicationRow } from "@/types/dashboard";


const PlacementTracking = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    students: 0, 
    applications: 0, 
    interviews: 0, 
    offers: 0, 
    companies: 0,
    placedStudents: 0,
    averageCtc: 0,
  });
  const [applications, setApplications] = useState<ApplicationRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { if (user) fetchData(); }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`college-placement:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "student_profiles" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "interviews" }, () => fetchData())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: college } = await supabase
        .from("college_profiles")
        .select("id, college_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!college) { setLoading(false); return; }

      const college_id = (college as any).id;

      const { data: idMatchedStudents } = await supabase
        .from("student_profiles")
        .select("id, user_id, degree, branch, graduation_year, skills, college_id, college_name, created_at")
        .eq("college_id", college_id)
        .order("created_at", { ascending: false });

      let students = idMatchedStudents || [];
      if (students.length === 0 && (college as any).college_name) {
        const { data: nameMatchedStudents } = await supabase
          .from("student_profiles")
          .select("id, user_id, degree, branch, graduation_year, skills, college_id, college_name, created_at")
          .ilike("college_name", (college as any).college_name)
          .order("created_at", { ascending: false });
        students = nameMatchedStudents || [];
      }

      const uniqueById = new Map<string, any>();
      students.forEach((s: any) => uniqueById.set(s.id, s));
      students = Array.from(uniqueById.values());

      const studentProfilesById = students.reduce((acc: Record<string, any>, s: any) => {
        acc[s.id] = s;
        return acc;
      }, {});

      const studentUserIds = students.map((s: any) => s.user_id).filter(Boolean);
      let profileByUserId: Record<string, any> = {};
      if (studentUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", studentUserIds);
        profileByUserId = (profiles || []).reduce((acc: Record<string, any>, p: any) => {
          acc[p.user_id] = p;
          return acc;
        }, {});
      }

      const studentIds = students.map(s => (s as any).id) || [];

      if (studentIds.length === 0) { 
        setStats({ students: 0, applications: 0, interviews: 0, offers: 0, companies: 0, placedStudents: 0, averageCtc: 0 });
        setApplications([]);
        setLoading(false); 
        return; 
      }

      const { data: apps } = await supabase
        .from("applications")
        .select(`
          *, 
          jobs(title, location, organization_profiles(company_name, logo_url))
        `)
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });

      const enrichedApps = (apps || []).map((a: any) => {
        const sp = studentProfilesById[a.student_id];
        const profile = sp ? profileByUserId[sp.user_id] || null : null;
        return {
          ...a,
          student_profiles: {
            ...(sp || {}),
            profiles: profile,
          },
        };
      });

      const appIds = (enrichedApps as any[])?.map(a => a.id) || [];
      const [interviewsRes, offersRes] = await Promise.all([
        appIds.length > 0 ? supabase.from("interviews").select("id", { count: "exact", head: true }).in("application_id", appIds) as any : { count: 0 },
        appIds.length > 0 ? supabase.from("offers").select("id, status, application_id, salary").in("application_id", appIds) as any : { data: [], count: 0 },
      ]);

      const placedStudentIds = new Set([
        ...(offersRes.data as any[] || [])
          .filter(o => o.status === 'accepted')
          .map(o => (enrichedApps as any[])?.find(a => (a as any).id === o.application_id)?.student_id),
        ...(enrichedApps as any[])
          .filter(a => a.status === 'selected' || a.status === 'accepted')
          .map(a => a.student_id)
      ].filter(Boolean));

      const uniqueCompanies = new Set((enrichedApps as any[])?.map(a => a.jobs?.organization_profiles?.company_name).filter(Boolean));
      const acceptedOffers = ((offersRes.data as any[]) || []).filter(o => o.status === "accepted");
      const totalAcceptedSalary = acceptedOffers.reduce((sum, o) => {
        const val = parseInt((o.salary || "").toString().replace(/[^0-9]/g, "") || "0", 10);
        return sum + val;
      }, 0);
      const averageCtc = acceptedOffers.length > 0 ? Math.round(totalAcceptedSalary / acceptedOffers.length) : 0;

      setStats({
        students: studentIds.length,
        applications: enrichedApps?.length || 0,
        interviews: (interviewsRes as any).count || 0,
        offers: (offersRes as any).count || 0,
        companies: uniqueCompanies.size,
        placedStudents: placedStudentIds.size,
        averageCtc,
      });
      if (enrichedApps) setApplications(enrichedApps as unknown as ApplicationRow[]);
    } catch (err) {

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter(app => {
    const studentName = app.student_profiles?.profiles?.full_name || "";
    const companyName = app.jobs?.organization_profiles?.company_name || "";
    const jobTitle = app.jobs?.title || "";
    return studentName.toLowerCase().includes(search.toLowerCase()) || 
           companyName.toLowerCase().includes(search.toLowerCase()) || 
           jobTitle.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Skeleton className="h-10 w-64 bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
      <Skeleton className="h-[500px] rounded-3xl bg-white/5" />
    </div>
  );

  const placementRate = stats.students > 0 ? Math.round((stats.placedStudents / stats.students) * 100) : 0;

  const statCards = [
    { label: "Total Students", value: stats.students, icon: <Users className="h-5 w-5" />, color: "text-blue-500" },
    { label: "Applications", value: stats.applications, icon: <BarChart3 className="h-5 w-5" />, color: "text-purple-500" },
    { label: "Interviews", value: stats.interviews, icon: <Clock className="h-5 w-5" />, color: "text-amber-500" },
    { label: "Placement Rate", value: `${placementRate}%`, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
    { label: "Average CTC", value: stats.averageCtc > 0 ? `INR ${stats.averageCtc.toLocaleString()}` : "N/A", icon: <DollarSign className="h-5 w-5" />, color: "text-emerald-500" },
    { label: "Partnered Cos", value: stats.companies, icon: <Briefcase className="h-5 w-5" />, color: "text-cyan-500" },
  ];

  const statusLabels: Record<string, string> = {
    pending: "Applied", screening: "Screening", assessment: "Assessment",
    interview: "Interview", final_review: "Final Review", selected: "Selected",
    accepted: "Accepted", rejected: "Rejected", shortlisted: "Shortlisted",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight">Placement Intelligence</h1>
        <p className="text-neutral-500 mt-2 font-medium">Real-time tracking of institutional hiring performance.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{s.label}</p>
                  <div className={s.color}>{s.icon}</div>
                </div>
                <div className="text-3xl font-black text-white">{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-card border-white/5 shadow-premium overflow-hidden">
        <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            Hiring Pipeline Activity
          </CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Search students or companies..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-primary/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="text-left p-6 font-black text-white/40 uppercase tracking-widest text-[10px]">Student</th>
                  <th className="text-left p-6 font-black text-white/40 uppercase tracking-widest text-[10px]">Role / Company</th>
                  <th className="text-left p-6 font-black text-white/40 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="text-left p-6 font-black text-white/40 uppercase tracking-widest text-[10px]">Applied</th>
                  <th className="text-right p-6 font-black text-white/40 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(app => (
                  <tr key={app.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                           {app.student_profiles?.profiles?.avatar_url ? (
                             <img src={app.student_profiles.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                           ) : (
                             <Users className="h-5 w-5 text-primary/40" />
                           )}
                        </div>
                        <span className="font-bold text-white whitespace-nowrap">{app.student_profiles?.profiles?.full_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-bold text-white group-hover:text-primary transition-colors">{app.jobs?.title || "Position"}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1.5">
                           <Briefcase className="h-3 w-3" />
                           {app.jobs?.organization_profiles?.company_name}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge className={app.status === "selected" || app.status === "accepted" ? "bg-primary/20 text-primary border-primary/20" : "bg-white/5 text-white/40 border-white/5"}>
                        {statusLabels[app.status] || app.status}
                      </Badge>
                    </td>
                    <td className="p-6 text-white/40 font-medium">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                         <MapPin className="h-4 w-4" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-white/20 text-sm font-bold italic tracking-wider">
              No matching activity found in the pipeline
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacementTracking;

