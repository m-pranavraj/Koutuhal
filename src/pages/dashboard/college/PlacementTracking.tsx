import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Award, Briefcase, Users } from "lucide-react";

const PlacementTracking = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, applications: 0, interviews: 0, offers: 0, companies: 0 });
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: college } = await supabase.from("college_profiles").select("id, college_name").eq("user_id", user!.id).single();
    if (!college) { setLoading(false); return; }

    const { data: students } = await supabase.from("student_profiles").select("id").eq("college_id", college.id);
    const studentIds = students?.map(s => s.id) || [];

    if (studentIds.length === 0) { setLoading(false); setStats({ students: 0, applications: 0, interviews: 0, offers: 0, companies: 0 }); return; }

    const { data: apps } = await supabase
      .from("applications")
      .select("*, jobs(title, organization_profiles(company_name)), student_profiles(profiles:user_id(full_name))")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false });

    const appIds = apps?.map(a => a.id) || [];
    const [interviewsRes, offersRes] = await Promise.all([
      appIds.length > 0 ? supabase.from("interviews").select("id", { count: "exact", head: true }).in("application_id", appIds) : { count: 0 },
      appIds.length > 0 ? supabase.from("offers").select("id", { count: "exact", head: true }).in("application_id", appIds) : { count: 0 },
    ]);

    const uniqueCompanies = new Set(apps?.map(a => a.jobs?.organization_profiles?.company_name).filter(Boolean));

    setStats({
      students: studentIds.length,
      applications: apps?.length || 0,
      interviews: (interviewsRes as any).count || 0,
      offers: (offersRes as any).count || 0,
      companies: uniqueCompanies.size,
    });
    if (apps) setApplications(apps);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const statCards = [
    { label: "Students", value: stats.students, icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Applications", value: stats.applications, icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Interviews", value: stats.interviews, icon: <Users className="h-5 w-5" /> },
    { label: "Offers", value: stats.offers, icon: <Award className="h-5 w-5" /> },
    { label: "Companies", value: stats.companies, icon: <Briefcase className="h-5 w-5" /> },
  ];

  const statusLabels: Record<string, string> = {
    pending: "Applied", screening: "Screening", assessment: "Assessment",
    interview: "Interview", final_review: "Final Review", selected: "Selected",
    accepted: "Accepted", rejected: "Rejected", shortlisted: "Shortlisted",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Placement Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor your students' hiring progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className="text-primary">{s.icon}</div>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border">
        <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Position</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 20).map(app => (
                  <tr key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{app.student_profiles?.profiles?.full_name || "â€”"}</td>
                    <td className="p-4">{app.jobs?.title || "â€”"}</td>
                    <td className="p-4 text-muted-foreground">{app.jobs?.organization_profiles?.company_name || "â€”"}</td>
                    <td className="p-4">
                      <Badge variant={app.status === "selected" || app.status === "accepted" ? "default" : "secondary"} className="text-xs">
                        {statusLabels[app.status] || app.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {applications.length === 0 && <div className="text-center py-12 text-muted-foreground">No applications yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacementTracking;

