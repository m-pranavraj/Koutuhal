import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Award, Briefcase, GraduationCap, ArrowUpRight, PieChart, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CollegeReports = () => {
  const { user } = useAuth();
  const [report, setReport] = useState({
    totalStudents: 0, totalApplications: 0, totalOffers: 0, offerRate: "0%",
    averageCtc: 0,
    topCompanies: [] as { name: string; count: number }[],
    statusBreakdown: [] as { status: string; count: number; percentage: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchReport(); }, [user]);

  const fetchReport = async () => {
    try {
      const { data: college } = await supabase.from("college_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!college) { setLoading(false); return; }

      const { data: students } = await supabase.from("student_profiles").select("id").eq("college_id", (college as any).id);
      const studentIds = students?.map(s => (s as any).id) || [];

      if (studentIds.length === 0) { setLoading(false); return; }

      const { data: apps } = await supabase
        .from("applications")
        .select("id, status, jobs(organization_profiles(company_name))")
        .in("student_id", studentIds);

      const appIds = (apps as any[])?.map(a => a.id) || [];
      const { data: offersData, count: offersCount } = appIds.length > 0
        ? await supabase.from("offers").select("id, status, salary", { count: "exact" }).in("application_id", appIds)
        : { data: [], count: 0 };

      // Status breakdown
      const statusMap: Record<string, number> = {};
      (apps as any[])?.forEach(a => { statusMap[a.status] = (statusMap[a.status] || 0) + 1; });
      
      const totalApps = apps?.length || 0;
      const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
        percentage: totalApps > 0 ? (count / totalApps) * 100 : 0
      })).sort((a, b) => b.count - a.count);

      // Top companies
      const companyCounts: Record<string, number> = {};
      apps?.forEach((a: any) => {
        const name = a.jobs?.organization_profiles?.company_name;
        if (name) companyCounts[name] = (companyCounts[name] || 0) + 1;
      });
      const topCompanies = Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const acceptedOffers = (offersData || []).filter((o: any) => o.status === "accepted");
      const totalAcceptedSalary = acceptedOffers.reduce((sum: number, o: any) => {
        const val = parseInt((o.salary || "").toString().replace(/[^0-9]/g, "") || "0", 10);
        return sum + val;
      }, 0);
      const averageCtc = acceptedOffers.length > 0 ? Math.round(totalAcceptedSalary / acceptedOffers.length) : 0;

      setReport({
        totalStudents: studentIds.length,
        totalApplications: totalApps,
        totalOffers: offersCount || 0,
        offerRate: studentIds.length > 0 ? `${((offersCount || 0) / studentIds.length * 100).toFixed(1)}%` : "0%",
        averageCtc,
        topCompanies,
        statusBreakdown,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Skeleton className="h-10 w-64 bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-3xl bg-white/5" />
        <Skeleton className="h-[400px] rounded-3xl bg-white/5" />
      </div>
    </div>
  );

  const statusLabels: Record<string, string> = {
    pending: "Applied", screening: "Screening", assessment: "Assessment",
    interview: "Interview", final_review: "Final Review", selected: "Selected",
    accepted: "Accepted", rejected: "Rejected", shortlisted: "Shortlisted",
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Institutional Analytics</h1>
          <p className="text-neutral-500 mt-2 font-medium">Detailed placement performance and engagement metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="text-primary h-2 w-2 rounded-full animate-pulse bg-primary" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Live Report</span>
           </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-5">
        {[
          { label: "Talent Pool", value: report.totalStudents, icon: <GraduationCap className="h-5 w-5" />, color: "text-blue-500" },
          { label: "Application Volume", value: report.totalApplications, icon: <BookOpen className="h-5 w-5" />, color: "text-purple-500" },
          { label: "Offers Secured", value: report.totalOffers, icon: <Award className="h-5 w-5" />, color: "text-emerald-500" },
          { label: "Average CTC", value: report.averageCtc > 0 ? `INR ${report.averageCtc.toLocaleString()}` : "N/A", icon: <Briefcase className="h-5 w-5" />, color: "text-cyan-500" },
          { label: "Success Rate", value: report.offerRate, icon: <TrendingUp className="h-5 w-5" />, color: "text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/20 transition-all">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{s.label}</p>
                  <div className={s.color}>{s.icon}</div>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card border-white/5 shadow-premium group">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <BarChart className="h-5 w-5 text-primary" />
              Recruitment Diversity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {report.topCompanies.length === 0 ? (
              <div className="text-center py-20 text-neutral-600 font-bold italic">Insufficient data for company metrics.</div>
            ) : (
              <div className="space-y-6">
                {report.topCompanies.map((c, i) => (
                  <div key={c.name} className="space-y-2 group/item">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-white/20 w-4">{(i + 1).toString().padStart(2, '0')}</span>
                        <span className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{c.name}</span>
                      </div>
                      <span className="text-xs font-black text-white/40">{c.count} Apps</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(c.count / report.totalApplications) * 100}%` }}
                        className="h-full bg-primary/40 rounded-full group-hover/item:bg-primary transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 shadow-premium group">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <PieChart className="h-5 w-5 text-purple-500" />
              Funnel Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {report.statusBreakdown.length === 0 ? (
              <div className="text-center py-20 text-neutral-600 font-bold italic">Insufficient data for funnel metrics.</div>
            ) : (
              <div className="space-y-6">
                {report.statusBreakdown.map((item) => (
                  <div key={item.status} className="space-y-2 group/item">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/70 group-hover/item:text-white transition-colors">{statusLabels[item.status] || item.status}</span>
                      <span className="text-xs font-black text-white/40">{item.count} ({Math.round(item.percentage)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${item.percentage}%` }}
                        className={
                          item.status === "accepted"
                            ? "h-full bg-primary/40 rounded-full group-hover/item:bg-primary transition-all"
                            : "h-full bg-purple-500/40 rounded-full group-hover/item:bg-purple-500 transition-all"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeReports;

