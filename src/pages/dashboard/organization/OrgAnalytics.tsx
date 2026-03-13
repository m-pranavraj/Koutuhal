import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Briefcase, Users, FileText, CheckCircle2, TrendingUp, Award, Calendar } from "lucide-react";

const COLORS = ["#ADFF44", "#8BCC36", "#689929", "#46661B", "#23330D"];

const OrgAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeListings: 0,
    hiredCount: 0,
  });
  const [pipelineData, setPipelineData] = useState<{ name: string; count: number }[]>([]);
  const [timeData, setTimeData] = useState<{ date: string; fullDate: string; count: number }[]>([]);
  const [skillsData, setSkillsData] = useState<{ name: string; count: number }[]>([]);


  useEffect(() => { if (user) fetchAnalytics(); }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`org-analytics:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "interviews" }, () => fetchAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchAnalytics())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Fetch pipeline and skills data directly from live tables.
    const { data: org_p } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    const org_id = (org_p as any)?.id;
    
    if (org_id) {
      const [jobsRes, appsRes] = await Promise.all([
        supabase.from("jobs").select("id, status, title, created_at").eq("org_id", org_id),
        supabase.from("applications")
          .select("*, jobs!inner(org_id), student_profiles(skills)")
          .eq("jobs.org_id", org_id)
      ]);

      if (appsRes.data) {
        const apps = appsRes.data as any[];
        const appIds = apps.map((a) => a.id);
        const offersRes = appIds.length > 0
          ? await supabase.from("offers").select("application_id, status").in("application_id", appIds)
          : { data: [] as any[] };
        const activityRes = appIds.length > 0
          ? await supabase
              .from("application_activity")
              .select("application_id, event_type")
              .in("application_id", appIds)
              .eq("event_type", "Offer Accepted")
          : { data: [] as any[] };
        const offers = (offersRes.data || []) as any[];
        const acceptedByActivityAppIds = new Set(
          ((activityRes as any).data || []).map((r: any) => r.application_id)
        );

        const acceptedOfferAppIds = new Set(
          offers.filter((o) => o.status === "accepted").map((o) => o.application_id)
        );
        const activeOfferAppIds = new Set(
          offers.filter((o) => o.status !== "accepted" && o.status !== "rejected").map((o) => o.application_id)
        );

        const stageCounters = {
          applied: 0,
          assessment: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          hired: 0,
        };

        apps.forEach((a) => {
          const status = (a.status || "").toLowerCase();

          if (acceptedOfferAppIds.has(a.id) || acceptedByActivityAppIds.has(a.id) || status === "accepted") {
            stageCounters.hired += 1;
            return;
          }

          if (activeOfferAppIds.has(a.id) || status === "selected" || status === "offer") {
            stageCounters.offer += 1;
            return;
          }

          if (status === "interview") {
            stageCounters.interview += 1;
            return;
          }

          if (status === "assessment") {
            stageCounters.assessment += 1;
            return;
          }

          if (status === "rejected") {
            stageCounters.rejected += 1;
            return;
          }

          stageCounters.applied += 1;
        });

        setStats({
          totalJobs: (jobsRes.data || []).length,
          totalApplications: apps.length,
          activeListings: (jobsRes.data || []).length,
          hiredCount: stageCounters.hired,
        });

        const pipeline = [
          { name: "Applied", count: stageCounters.applied },
          { name: "Assessment", count: stageCounters.assessment },
          { name: "Interview", count: stageCounters.interview },
          { name: "Offer", count: stageCounters.offer },
          { name: "Hired", count: stageCounters.hired },
          { name: "Rejected", count: stageCounters.rejected },
        ];
        setPipelineData(pipeline);

        // Apps over time (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: d.toISOString().split("T")[0],
            count: 0
          };
        });
        apps.forEach(a => {
          const appDate = new Date(a.created_at).toISOString().split("T")[0];
          const day = last7Days.find(d => d.fullDate === appDate);
          if (day) day.count++;
        });
        setTimeData(last7Days);

        // Top Skills
        const allSkills: string[] = [];
        apps.forEach(a => {
          if (a.student_profiles?.skills) {
            allSkills.push(...a.student_profiles.skills);
          }
        });
        const skillCounts = allSkills.reduce((acc: any, skill) => {
          acc[skill] = (acc[skill] || 0) + 1;
          return acc;
        }, {});
        const topSkills = Object.entries(skillCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setSkillsData(topSkills);
      }
    } else {
      setStats({
        totalJobs: 0,
        totalApplications: 0,
        activeListings: 0,
        hiredCount: 0,
      });
      setPipelineData([]);
      setTimeData([]);
      setSkillsData([]);
    }

    setLoading(false);
  };

  if (loading) return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight">Recruiter Analytics</h1>
        <p className="text-neutral-500 mt-2 font-medium">Detailed insights into your hiring performance and pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Jobs", val: stats.totalJobs, icon: Briefcase, color: "text-blue-500" },
          { label: "Applications", val: stats.totalApplications, icon: Users, color: "text-primary" },
          { label: "Active Listings", val: stats.activeListings, icon: FileText, color: "text-purple-500" },
          { label: "Hired Candidates", val: stats.hiredCount, icon: Award, color: "text-orange-500" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-white/5 shadow-premium overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <Card className="glass-card border-white/5 shadow-premium">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Hiring Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: "rgba(173, 255, 68, 0.05)" }}
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(173, 255, 68, 0.2)", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="count" fill="#ADFF44" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Applications Over Time */}
        <Card className="glass-card border-white/5 shadow-premium">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Applications Over Time (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(173, 255, 68, 0.2)", borderRadius: "12px", color: "#fff" }}
                />
                <Line type="monotone" dataKey="count" stroke="#ADFF44" strokeWidth={4} dot={{ fill: "#ADFF44", r: 6, strokeWidth: 2, stroke: "#000" }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Skills Cloud */}
        <Card className="glass-card border-white/5 shadow-premium lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-widest text-sm opacity-70">Applicant Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {skillsData.map((skill, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      {i + 1}
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{skill.name}</span>
                  </div>
                  <Badge className="bg-white/5 border-white/5 text-neutral-400">{skill.count} applicants</Badge>
                </div>
              ))}
              {skillsData.length === 0 && <p className="text-center py-10 text-neutral-500 text-sm italic">No application data available yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Hiring Success Rate */}
        <Card className="glass-card border-white/5 shadow-premium lg:col-span-2">
           <CardHeader>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-widest text-sm opacity-70">Hiring Pipeline Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(173, 255, 68, 0.2)", borderRadius: "12px", color: "#fff" }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrgAnalytics;
