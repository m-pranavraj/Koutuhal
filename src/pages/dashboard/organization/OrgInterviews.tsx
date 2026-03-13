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
import { motion, AnimatePresence } from "framer-motion";
import { Video, Plus, Calendar, User, Clock, Link as LinkIcon, CheckCircle, XCircle, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { InterviewRow, ApplicationRow } from "@/types/dashboard";


const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  rescheduled: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const OrgInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ application_id: "", scheduled_at: "", meeting_link: "", interviewer_name: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle() as any;
      if (!org) { setLoading(false); return; }
      const { data: jobs } = await supabase.from("jobs").select("id").eq("org_id", org.id) as any;
      if (!jobs?.length) { setLoading(false); return; }
      const jobIds = jobs.map((j: any) => j.id);

      const [interviewsRes, appsRes] = await Promise.all([
        supabase.from("interviews")
          .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
          .in("application_id", (await supabase.from("applications").select("id").in("job_id", jobIds) as any).data?.map((a: any) => a.id) || [])
          .order("scheduled_at", { ascending: true }) as any,
        supabase.from("applications")
          .select("id, status, jobs(title), student_profiles(profiles:user_id(full_name))")
          .in("job_id", jobIds)
          .in("status", ["interview", "screening", "assessment", "shortlisted", "final_review"]) as any,
      ]);
      if (interviewsRes.data) setInterviews(interviewsRes.data as unknown as InterviewRow[]);
      if (appsRes.data) setApplications(appsRes.data as unknown as ApplicationRow[]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await (supabase.from("interviews") as any).insert({
        application_id: form.application_id,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        meeting_link: form.meeting_link || null,
        interviewer_name: form.interviewer_name || null,
      });

      if (error) throw error;
      toast({ title: "Interview scheduled! âœ¨" });
      setShowSchedule(false);
      setForm({ application_id: "", scheduled_at: "", meeting_link: "", interviewer_name: "" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { data: iv } = await supabase.from("interviews").select("application_id").eq("id", id).single() as any;
    const { error } = await (supabase.from("interviews") as any).update({ status }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (iv?.application_id) {
        await supabase.from("application_activity").insert({
          application_id: iv.application_id,
          event_type: `Interview ${status}`,
          event_description: `The scheduled interview has been marked as ${status}.`
        } as any);
      }
      toast({ title: `Interview ${status}` });
      fetchData();
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-10 w-32 bg-white/5" />
      </div>
      <div className="grid gap-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Interview Pipeline</h1>
          <p className="text-neutral-500 mt-2 font-medium">Coordinate and track your recruitment timeline.</p>
        </div>
        <Button onClick={() => setShowSchedule(!showSchedule)} className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10">
          {showSchedule ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showSchedule ? "Cancel" : "Schedule Interview"}
        </Button>
      </div>

      <AnimatePresence>
        {showSchedule && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="glass-card border-white/10 shadow-premium p-8">
              <form onSubmit={handleSchedule} className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Candidate *</Label>
                  <Select value={form.application_id} onValueChange={v => setForm(p => ({ ...p, application_id: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5"><SelectValue placeholder="Choose a candidate" /></SelectTrigger>
                    <SelectContent>
                      {applications.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.student_profiles?.profiles?.full_name || "Applicant"} &ndash; {a.jobs?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Date & Time *</Label>
                    <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5 text-white" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Interviewer Name</Label>
                    <Input value={form.interviewer_name} onChange={e => setForm(p => ({ ...p, interviewer_name: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meeting Link</Label>
                   <div className="relative mt-1.5">
                    <Input value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl pl-10" placeholder="Zoom, Google Meet, etc." />
                    <LinkIcon className="absolute left-3.5 top-4 h-4 w-4 text-white/20" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="btn-green rounded-xl h-11 px-8 font-bold text-black">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Schedule
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowSchedule(false)} className="border-white/10 hover:bg-white/5 text-white rounded-xl h-11 px-6">Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {interviews.length === 0 && !showSchedule ? (
          <Card className="glass-card border-white/5 py-20 text-center">
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quiet on set</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">You haven't scheduled any interviews yet. Time to meet your future stars!</p>
          </Card>
        ) : (
          interviews.map((iv, i) => (
            <motion.div key={iv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <Video className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {iv.applications?.student_profiles?.profiles?.full_name || "Candidate"}
                      </h3>
                      <p className="text-sm font-bold text-white/40 mb-3 uppercase tracking-wider">
                        {iv.applications?.jobs?.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {new Date(iv.scheduled_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {iv.interviewer_name && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {iv.interviewer_name}
                          </span>
                        )}
                        <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md border", statusColors[iv.status])}>
                          {iv.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    {iv.meeting_link && iv.status === "scheduled" && (
                        <Button asChild className="btn-green rounded-xl h-11 px-6 font-bold text-black flex-1 md:flex-none">
                          <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer">
                             <Video className="h-4 w-4 mr-2" /> Join Meeting
                          </a>
                        </Button>
                    )}
                    {iv.status === "scheduled" && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => updateStatus(iv.id, "completed")} className="border-white/10 hover:bg-green-500/10 hover:text-green-500 rounded-xl h-11 w-11 transition-all" title="Mark Completed">
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => updateStatus(iv.id, "cancelled")} className="border-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-xl h-11 w-11 transition-all" title="Cancel Interview">
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrgInterviews;

