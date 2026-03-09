import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Video, Plus, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  rescheduled: "bg-muted text-muted-foreground",
};

const OrgInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ application_id: "", scheduled_at: "", meeting_link: "", interviewer_name: "" });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org) { setLoading(false); return; }
    const { data: jobs } = await supabase.from("jobs").select("id").eq("org_id", org.id);
    if (!jobs?.length) { setLoading(false); return; }
    const jobIds = jobs.map(j => j.id);

    const [interviewsRes, appsRes] = await Promise.all([
      supabase.from("interviews")
        .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
        .in("application_id", (await supabase.from("applications").select("id").in("job_id", jobIds)).data?.map(a => a.id) || [])
        .order("scheduled_at", { ascending: true }),
      supabase.from("applications")
        .select("id, status, jobs(title), student_profiles(profiles:user_id(full_name))")
        .in("job_id", jobIds)
        .in("status", ["interview", "screening", "assessment", "shortlisted", "final_review"]),
    ]);
    if (interviewsRes.data) setInterviews(interviewsRes.data);
    if (appsRes.data) setApplications(appsRes.data);
    setLoading(false);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("interviews").insert({
      application_id: form.application_id,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      meeting_link: form.meeting_link || null,
      interviewer_name: form.interviewer_name || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Interview scheduled!" }); setShowSchedule(false); setForm({ application_id: "", scheduled_at: "", meeting_link: "", interviewer_name: "" }); fetchData(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("interviews").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Interview ${status}` }); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage candidate interviews</p>
        </div>
        <Button onClick={() => setShowSchedule(!showSchedule)}>
          <Plus className="h-4 w-4 mr-1" /> Schedule Interview
        </Button>
      </div>

      {showSchedule && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border">
            <CardContent className="p-6">
              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <Label>Candidate *</Label>
                  <Select value={form.application_id} onValueChange={v => setForm(p => ({ ...p, application_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                    <SelectContent>
                      {applications.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.student_profiles?.profiles?.full_name || "Applicant"} â€” {a.jobs?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date & Time *</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required /></div>
                  <div><Label>Interviewer</Label><Input value={form.interviewer_name} onChange={e => setForm(p => ({ ...p, interviewer_name: e.target.value }))} placeholder="Name" /></div>
                </div>
                <div><Label>Meeting Link</Label><Input value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="https://meet.google.com/..." /></div>
                <div className="flex gap-2">
                  <Button type="submit">Schedule</Button>
                  <Button type="button" variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {interviews.length === 0 && !showSchedule ? (
        <Card className="py-12 text-center border">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No interviews scheduled yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((iv, i) => (
            <motion.div key={iv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{iv.applications?.student_profiles?.profiles?.full_name || "Candidate"}</h3>
                    <p className="text-sm text-muted-foreground">{iv.applications?.jobs?.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(iv.scheduled_at).toLocaleString()}
                    </div>
                    <Badge className={`mt-2 ${statusColors[iv.status]}`}><span className="capitalize">{iv.status}</span></Badge>
                  </div>
                  {iv.status === "scheduled" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatus(iv.id, "completed")}>Complete</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(iv.id, "cancelled")}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgInterviews;

