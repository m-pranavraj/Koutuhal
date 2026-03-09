import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Search as SearchIcon, Eye, ClipboardList, Video, Award } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="h-3.5 w-3.5" /> },
  screening: { color: "bg-muted text-muted-foreground", icon: <Eye className="h-3.5 w-3.5" /> },
  assessment: { color: "bg-muted text-muted-foreground", icon: <ClipboardList className="h-3.5 w-3.5" /> },
  interview: { color: "bg-muted text-muted-foreground", icon: <Video className="h-3.5 w-3.5" /> },
  final_review: { color: "bg-muted text-muted-foreground", icon: <SearchIcon className="h-3.5 w-3.5" /> },
  shortlisted: { color: "bg-primary/10 text-primary", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  selected: { color: "bg-primary text-primary-foreground", icon: <Award className="h-3.5 w-3.5" /> },
  accepted: { color: "bg-primary text-primary-foreground", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { color: "bg-destructive/10 text-destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const statusLabels: Record<string, string> = {
  pending: "Applied",
  screening: "Screening",
  assessment: "Assessment",
  interview: "Interview",
  final_review: "Final Review",
  shortlisted: "Shortlisted",
  selected: "Selected",
  accepted: "Accepted",
  rejected: "Rejected",
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!sp) { setLoading(false); return; }
    const { data } = await supabase
      .from("applications")
      .select("*, jobs(title, location, job_type, organization_profiles(company_name))")
      .eq("student_id", sp.id)
      .order("created_at", { ascending: false });
    if (data) setApplications(data);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track your job applications through the hiring pipeline</p>
      </div>

      {applications.length === 0 ? (
        <Card className="py-12 text-center border">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No applications yet. Start browsing jobs!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, i) => {
            const config = statusConfig[app.status] || statusConfig.pending;
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow border">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{app.jobs?.title}</h3>
                      <p className="text-sm text-muted-foreground">{app.jobs?.organization_profiles?.company_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={config.color}>
                      <span className="flex items-center gap-1.5">
                        {config.icon}
                        {statusLabels[app.status] || app.status}
                      </span>
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;

