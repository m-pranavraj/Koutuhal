import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Award, Briefcase, GraduationCap } from "lucide-react";

const CollegeReports = () => {
  const { user } = useAuth();
  const [report, setReport] = useState({
    totalStudents: 0, totalApplications: 0, totalOffers: 0, offerRate: "0%",
    topCompanies: [] as { name: string; count: number }[],
    statusBreakdown: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchReport(); }, [user]);

  const fetchReport = async () => {
    const { data: college } = await supabase.from("college_profiles").select("id, college_name").eq("user_id", user!.id).single();
    if (!college) { setLoading(false); return; }

    const { data: students } = await supabase.from("student_profiles").select("id").eq("college_name", college.college_name);
    const studentIds = students?.map(s => s.id) || [];

    if (studentIds.length === 0) { setLoading(false); return; }

    const { data: apps } = await supabase
      .from("applications")
      .select("status, jobs(organization_profiles(company_name))")
      .in("student_id", studentIds);

    const appIds = apps?.map((a: any) => a.id) || [];
    const { count: offersCount } = studentIds.length > 0
      ? await supabase.from("offers").select("id", { count: "exact", head: true })
        .in("application_id",
          (await supabase.from("applications").select("id").in("student_id", studentIds)).data?.map(a => a.id) || []
        )
      : { count: 0 };

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    apps?.forEach((a: any) => { statusBreakdown[a.status] = (statusBreakdown[a.status] || 0) + 1; });

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

    const totalApps = apps?.length || 0;
    const totalOffers = offersCount || 0;

    setReport({
      totalStudents: studentIds.length,
      totalApplications: totalApps,
      totalOffers: totalOffers,
      offerRate: totalApps > 0 ? `${((totalOffers / studentIds.length) * 100).toFixed(1)}%` : "0%",
      topCompanies,
      statusBreakdown,
    });
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const statusLabels: Record<string, string> = {
    pending: "Applied", screening: "Screening", assessment: "Assessment",
    interview: "Interview", final_review: "Final Review", selected: "Selected",
    accepted: "Accepted", rejected: "Rejected", shortlisted: "Shortlisted",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Placement Reports</h1>
        <p className="text-muted-foreground mt-1">Placement statistics and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Students", value: report.totalStudents, icon: <GraduationCap className="h-5 w-5" /> },
          { label: "Applications", value: report.totalApplications, icon: <BookOpen className="h-5 w-5" /> },
          { label: "Offers Issued", value: report.totalOffers, icon: <Award className="h-5 w-5" /> },
          { label: "Offer Rate", value: report.offerRate, icon: <TrendingUp className="h-5 w-5" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className="text-primary">{s.icon}</div>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border">
          <CardHeader><CardTitle>Top Companies</CardTitle></CardHeader>
          <CardContent>
            {report.topCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {report.topCompanies.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}</span>
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{c.count} apps</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader><CardTitle>Application Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(report.statusBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(report.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{statusLabels[status] || status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / report.totalApplications) * 100}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
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

