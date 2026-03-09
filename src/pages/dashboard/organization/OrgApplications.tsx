import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";

const pipelineStages = [
  { value: "pending", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "assessment", label: "Assessment" },
  { value: "interview", label: "Interview" },
  { value: "final_review", label: "Final Review" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const stageColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  screening: "bg-muted text-muted-foreground",
  assessment: "bg-muted text-muted-foreground",
  interview: "bg-muted text-muted-foreground",
  final_review: "bg-muted text-muted-foreground",
  shortlisted: "bg-primary/10 text-primary",
  selected: "bg-primary text-primary-foreground",
  accepted: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const OrgApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => { if (user) fetchApplications(); }, [user]);

  const fetchApplications = async () => {
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org) { setLoading(false); return; }
    const { data: jobs } = await supabase.from("jobs").select("id").eq("org_id", org.id);
    if (!jobs?.length) { setLoading(false); return; }
    const jobIds = jobs.map((j) => j.id);
    const { data } = await supabase
      .from("applications")
      .select("*, jobs(title), student_profiles(headline, user_id, college_name, degree, profiles:user_id(full_name, email))")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
    if (data) setApplications(data);
    setLoading(false);
  };

  const updateStatus = async (appId: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status: status as any }).eq("id", appId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Candidate moved to ${pipelineStages.find(s => s.value === status)?.label || status}` });
      fetchApplications();
    }
  };

  const filtered = stageFilter === "all" ? applications : applications.filter(a => a.status === stageFilter);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hiring Pipeline</h1>
          <p className="text-muted-foreground mt-1">Manage candidates through hiring stages</p>
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {pipelineStages.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2">
        {pipelineStages.map(stage => {
          const count = applications.filter(a => a.status === stage.value).length;
          return (
            <button key={stage.value} onClick={() => setStageFilter(stage.value === stageFilter ? "all" : stage.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${stageFilter === stage.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary"}`}>
              {stage.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center border">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No applications in this stage.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{app.student_profiles?.profiles?.full_name || "Applicant"}</h3>
                      <p className="text-sm text-muted-foreground">{app.student_profiles?.profiles?.email}</p>
                      <p className="text-sm mt-1">Applied for: <span className="font-medium">{app.jobs?.title}</span></p>
                      {app.student_profiles?.college_name && (
                        <p className="text-xs text-muted-foreground mt-1">{app.student_profiles.college_name} Â· {app.student_profiles.degree}</p>
                      )}
                      <Badge className={`mt-2 ${stageColors[app.status] || "bg-muted text-muted-foreground"}`}>
                        {pipelineStages.find(s => s.value === app.status)?.label || app.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Select onValueChange={(v) => updateStatus(app.id, v)}>
                        <SelectTrigger className="w-44 h-9 text-xs">
                          <SelectValue placeholder="Move to stage..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pipelineStages.filter(s => s.value !== app.status).map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgApplications;

