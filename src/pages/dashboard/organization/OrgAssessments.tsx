import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Plus, Trash2, CheckCircle, Brain, ArrowRight, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const OrgAssessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", assessment_type: "mcq", job_id: "", time_limit_minutes: "30" });
  const [questions, setQuestions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!org) { setLoading(false); return; }
      
      const [assessRes, jobsRes] = await Promise.all([
        supabase.from("assessments").select("*, jobs(title)").eq("org_id", org.id).order("created_at", { ascending: false }),
        supabase.from("jobs").select("id, title").eq("org_id", org.id).eq("status", "open"),
      ]);
      
      if (assessRes.data) setAssessments(assessRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), question_text: "", options: ["", "", "", ""], correct_answer: "" }]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.job_id) { toast({ title: "Please select a job", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).single();
      const { error } = await supabase.from("assessments").insert({
        org_id: org!.id,
        job_id: form.job_id,
        title: form.title,
        description: form.description || null,
        assessment_type: form.assessment_type as any,
        time_limit_minutes: parseInt(form.time_limit_minutes) || null,
        questions: form.assessment_type === "mcq" ? (questions as any) : null,
      });

      if (error) throw error;
      toast({ title: "Assessment created! ✨" });
      setShowCreate(false);
      setForm({ title: "", description: "", assessment_type: "mcq", job_id: "", time_limit_minutes: "30" });
      setQuestions([]);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssessment = async (id: string) => {
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Assessment deleted" }); fetchData(); }
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
          <h1 className="text-4xl font-black text-white tracking-tight">Assessment Builder</h1>
          <p className="text-neutral-500 mt-2 font-medium">Create and manage technical tests for your open positions.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10">
          {showCreate ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showCreate ? "Cancel" : "New Assessment"}
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="glass-card border-white/10 shadow-premium p-8">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Job Position *</Label>
                      <Select value={form.job_id} onValueChange={v => setForm(p => ({ ...p, job_id: v }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5"><SelectValue placeholder="Select a job" /></SelectTrigger>
                        <SelectContent>
                          {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Assessment Title *</Label>
                      <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5" required />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Assessment Type</Label>
                      <Select value={form.assessment_type} onValueChange={v => setForm(p => ({ ...p, assessment_type: v }))}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                          <SelectItem value="written">Written / Code Submission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Time Limit (Minutes)</Label>
                      <Input type="number" value={form.time_limit_minutes} onChange={e => setForm(p => ({ ...p, time_limit_minutes: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="bg-white/5 border-white/10 rounded-xl mt-1.5" rows={3} />
                </div>

                {form.assessment_type === "mcq" && (
                  <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Assessment Questions</Label>
                      <Button type="button" variant="outline" onClick={addQuestion} className="h-8 rounded-lg border-white/10 hover:bg-primary/10 hover:text-primary transition-all">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {questions.map((q, qIdx) => (
                        <Card key={q.id} className="bg-white/[0.02] border-white/5 p-6 space-y-4 rounded-2xl relative group">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setQuestions(questions.filter(qu => qu.id !== q.id))}
                            className="absolute top-2 right-2 h-8 w-8 p-0 text-white/20 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex gap-4">
                            <span className="shrink-0 w-8 h-8 rounded-lg bg-white/5 text-white/40 flex items-center justify-center font-black">
                               {qIdx + 1}
                            </span>
                            <div className="flex-1 space-y-4">
                              <Input placeholder="Question text" value={q.question_text} onChange={e => updateQuestion(q.id, "question_text", e.target.value)} className="bg-white/5 border-white/10 h-11 rounded-xl" />
                              <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt: string, oIdx: number) => (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn(
                                      "h-6 w-6 rounded-md p-0 flex items-center justify-center cursor-pointer transition-all",
                                      q.correct_answer === opt ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/20"
                                    )} onClick={() => updateQuestion(q.id, "correct_answer", opt)}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </Badge>
                                    <Input placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => {
                                      const newOpts = [...q.options];
                                      newOpts[oIdx] = e.target.value;
                                      updateQuestion(q.id, "options", newOpts);
                                    }} className="bg-white/5 border-white/10 h-9 rounded-lg" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <Button type="submit" disabled={submitting} className="btn-green rounded-xl h-11 px-8 font-bold text-black shadow-lg shadow-primary/20">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Create Assessment
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-white/10 hover:bg-white/5 text-white rounded-xl h-11 px-6">Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {assessments.length === 0 && !showCreate ? (
          <Card className="glass-card border-white/5 py-20 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-white/10 mb-4" />
            <p className="text-neutral-500">No assessments created yet.</p>
          </Card>
        ) : (
          assessments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-start gap-6">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                       <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{a.title}</h3>
                      <p className="text-sm text-white/40">{a.jobs?.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px] font-black uppercase bg-white/5 border-white/10 text-white/40">{a.assessment_type}</Badge>
                        {a.time_limit_minutes && <span className="text-xs text-white/20 font-bold tracking-widest uppercase">{a.time_limit_minutes} Min</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => deleteAssessment(a.id)} className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrgAssessments;
