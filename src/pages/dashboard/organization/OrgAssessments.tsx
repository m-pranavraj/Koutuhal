import { useState, useEffect, useMemo } from "react";
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
import { ClipboardList, Plus, Trash2, CheckCircle, Brain, Loader2, BarChart3, Eye, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const OrgAssessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "submissions">("create");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [scoringForm, setScoringForm] = useState({ score: "", notes: "" });
  const [submittingScore, setSubmittingScore] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", assessment_type: "mcq", job_id: "", time_limit_minutes: "30", max_attempts: "1" });
  const [questions, setQuestions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);
  useEffect(() => { if (activeTab === "submissions" && user) fetchSubmissions(); }, [activeTab, user]);

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

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!org) {
        setSubmissionsLoading(false);
        return;
      }

      // Get all assessments for this org and their submissions
      const { data: subs } = await supabase
        .from("assessment_submissions")
        .select(`
          id,
          assessment_id,
          student_id,
          created_at,
          score,
          status,
          submitted_at,
          answers,
          notes,
            assessments(id, title, questions, assessment_type, max_attempts),
          student_profiles(id, full_name, headline)
        `)
        .in("assessment_id", (await supabase
          .from("assessments")
          .select("id")
          .eq("org_id", org.id)).data?.map((a: any) => a.id) || [])
        .order("submitted_at", { ascending: false });

      if (subs) setSubmissions(subs);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      toast({ title: "Error loading submissions", variant: "destructive" });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const saveScore = async () => {
    if (!selectedSubmission || !scoringForm.score) {
      toast({ title: "Please enter a score", variant: "destructive" });
      return;
    }

    setSubmittingScore(true);
    try {
      const { error } = await supabase
        .from("assessment_submissions")
        .update({
          score: parseFloat(scoringForm.score),
          notes: scoringForm.notes,
          status: "graded"
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;
      
      toast({ title: "Score saved successfully! ✨" });
      setSelectedSubmission(null);
      setScoringForm({ score: "", notes: "" });
      fetchSubmissions();
    } catch (err: any) {
      console.error("Error saving score:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingScore(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), question_text: "", options: ["", "", "", ""], correct_answer: "" }]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const startEditAssessment = (assessment: any) => {
    setEditingAssessmentId(assessment.id);
    setActiveTab("create");
    setForm({
      title: assessment.title || "",
      description: assessment.description || "",
      assessment_type: assessment.assessment_type || "mcq",
      job_id: assessment.job_id || "",
      time_limit_minutes: assessment.time_limit_minutes?.toString() || "30",
      max_attempts: assessment.max_attempts?.toString() || "1"
    });
    setQuestions(Array.isArray(assessment.questions) ? assessment.questions : []);
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.job_id) { toast({ title: "Please select a job", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).single();
      const payload = {
        org_id: org!.id,
        job_id: form.job_id,
        title: form.title,
        description: form.description || null,
        assessment_type: form.assessment_type as any,
        time_limit_minutes: parseInt(form.time_limit_minutes) || null,
        max_attempts: Math.max(1, parseInt(form.max_attempts) || 1),
        questions: form.assessment_type === "mcq" ? (questions as any) : null,
      };

      const { error } = editingAssessmentId
        ? await supabase.from("assessments").update(payload).eq("id", editingAssessmentId)
        : await supabase.from("assessments").insert(payload);

      if (error) throw error;
      toast({ title: editingAssessmentId ? "Assessment updated! ✨" : "Assessment created! ✨" });
      setShowCreate(false);
      setEditingAssessmentId(null);
      setForm({ title: "", description: "", assessment_type: "mcq", job_id: "", time_limit_minutes: "30", max_attempts: "1" });
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

  const getSubmittedTimestamp = (sub: any) => sub?.submitted_at || sub?.created_at || null;

  const getStudentAnswer = (sub: any, q: any, idx: number) => {
    const answers = sub?.answers;
    if (!answers) return "No answer";
    if (Array.isArray(answers)) return answers[idx] ?? "No answer";
    if (typeof answers === "object") {
      return answers[q?.id] ?? answers[idx] ?? answers[q?.question_text] ?? "No answer";
    }
    return "No answer";
  };

  const attemptStats = useMemo(() => {
    const grouped: Record<string, any> = {};

    submissions.forEach((sub: any) => {
      const studentName = sub.student_profiles?.full_name || "Unknown Student";
      const assessmentTitle = sub.assessments?.title || "Unknown Assessment";
      const assessmentId = sub.assessment_id || sub.assessments?.id || "unknown";
      const key = `${sub.student_id}-${assessmentId}`;

      if (!grouped[key]) {
        grouped[key] = {
          key,
          studentName,
          assessmentTitle,
          attemptsUsed: 0,
          maxAttempts: sub.assessments?.max_attempts ?? 1,
          bestScore: null as number | null,
          latestScore: null as number | null,
          latestTs: null as string | null,
        };
      }

      grouped[key].attemptsUsed += 1;
      if (sub.score !== null && sub.score !== undefined) {
        const numericScore = Number(sub.score);
        grouped[key].bestScore = grouped[key].bestScore === null ? numericScore : Math.max(grouped[key].bestScore, numericScore);
      }

      const ts = getSubmittedTimestamp(sub);
      if (!grouped[key].latestTs || (ts && new Date(ts).getTime() > new Date(grouped[key].latestTs).getTime())) {
        grouped[key].latestTs = ts;
        grouped[key].latestScore = sub.score !== null && sub.score !== undefined ? Number(sub.score) : null;
      }
    });

    return Object.values(grouped).sort((a: any, b: any) => a.studentName.localeCompare(b.studentName));
  }, [submissions]);

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
          <h1 className="text-4xl font-black text-white tracking-tight">Assessments</h1>
          <p className="text-neutral-500 mt-2 font-medium">Create and manage technical tests, track real-time scores.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={activeTab === "create" ? "default" : "outline"}
            onClick={() => setActiveTab("create")}
            className={cn(
              "rounded-xl h-11 px-6 font-bold transition-all",
              activeTab === "create" ? "btn-green shadow-lg shadow-primary/10" : "border-white/10 hover:bg-white/5"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          <Button 
            variant={activeTab === "submissions" ? "default" : "outline"}
            onClick={() => setActiveTab("submissions")}
            className={cn(
              "rounded-xl h-11 px-6 font-bold transition-all",
              activeTab === "submissions" ? "btn-green shadow-lg shadow-primary/10" : "border-white/10 hover:bg-white/5"
            )}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Submissions
          </Button>
        </div>
      </div>

      {/* Create Assessment Tab */}
      {activeTab === "create" && (
        <div className="space-y-6">
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
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Max Attempts</Label>
                      <Input type="number" min={1} value={form.max_attempts} onChange={e => setForm(p => ({ ...p, max_attempts: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5" />
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
                    {editingAssessmentId ? "Update Assessment" : "Create Assessment"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      {/* Create Assessment Content */}
      {activeTab === "create" && (
        <div className="grid gap-4">
          {assessments.length === 0 ? (
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
                        <span className="text-xs text-white/20 font-bold tracking-widest uppercase">Attempts: {a.max_attempts ?? 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => startEditAssessment(a)} className="text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => deleteAssessment(a.id)} className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
        </div>
      )}

      {/* Submissions/Scoring Tab */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          {attemptStats.length > 0 && (
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/70 mb-4">Attempts Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
                        <th className="text-left py-2">Student</th>
                        <th className="text-left py-2">Assessment</th>
                        <th className="text-left py-2">Attempts</th>
                        <th className="text-left py-2">Best</th>
                        <th className="text-left py-2">Latest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attemptStats.map((row: any) => (
                        <tr key={row.key} className="border-b border-white/5">
                          <td className="py-3 text-white font-semibold">{row.studentName}</td>
                          <td className="py-3 text-white/70">{row.assessmentTitle}</td>
                          <td className="py-3 text-white/70">{row.attemptsUsed}/{row.maxAttempts}</td>
                          <td className="py-3 text-primary font-bold">{row.bestScore ?? "-"}</td>
                          <td className="py-3 text-white/70">{row.latestScore ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {submissionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)}
            </div>
          ) : submissions.length === 0 ? (
            <Card className="glass-card border-white/5 py-20 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-white/10 mb-4" />
              <p className="text-neutral-500">No submissions yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub, i) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-white/5 hover:border-primary/50 transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {sub.student_profiles?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-white">{sub.student_profiles?.full_name || "Unknown Student"}</h4>
                              <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10">
                                {sub.assessments?.title}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/40">{sub.student_profiles?.headline}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {sub.score !== null ? (
                            <div className="text-right">
                              <div className="text-2xl font-black text-primary">{sub.score}</div>
                              <div className="text-xs text-white/40 font-semibold">Score</div>
                            </div>
                          ) : (
                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
                          )}
                          <p className="text-xs text-white/40">
                            {getSubmittedTimestamp(sub) ? new Date(getSubmittedTimestamp(sub)).toLocaleDateString() : "Not submitted"}
                          </p>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setScoringForm({ score: sub.score?.toString() || "", notes: sub.notes || "" });
                            }}
                            className="border-white/10 hover:bg-primary/10 hover:border-primary/50 hover:text-primary rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scoring Sheet */}
      <Sheet open={!!selectedSubmission} onOpenChange={() => {
        setSelectedSubmission(null);
        setScoringForm({ score: "", notes: "" });
      }}>
        <SheetContent side="right" className="w-full max-w-2xl bg-black/95 border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Score Submission</SheetTitle>
          </SheetHeader>
          
          {selectedSubmission && (
            <ScrollArea className="h-full py-6">
              <div className="space-y-8 pr-4">
                {/* Student Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Student Information</h3>
                  <Card className="glass-card border-white/5 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name:</span>
                        <span className="font-bold text-white">{selectedSubmission.student_profiles?.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Assessment:</span>
                        <span className="font-bold text-white">{selectedSubmission.assessments?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Submitted:</span>
                        <span className="font-bold text-white">
                          {getSubmittedTimestamp(selectedSubmission) ? new Date(getSubmittedTimestamp(selectedSubmission)).toLocaleString() : "Not submitted"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Status:</span>
                        <Badge className={cn(
                          "text-xs font-bold",
                          selectedSubmission.status === "graded" ? "bg-primary/20 text-primary" : "bg-yellow-500/20 text-yellow-500"
                        )}>
                          {selectedSubmission.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Answers Review */}
                {selectedSubmission.assessments?.questions && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white">Answers</h3>
                    <div className="space-y-4">
                      {selectedSubmission.assessments.questions.map((q: any, idx: number) => (
                        <Card key={idx} className="glass-card border-white/5 p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-primary font-black text-lg">{idx + 1}.</span>
                              <p className="text-white font-semibold">{q.question_text}</p>
                            </div>
                            <div className="pl-8 space-y-2">
                              <div className="text-sm text-white/60">
                                <span className="font-bold">Student Answer:</span>
                                <span className="ml-2 text-white">{getStudentAnswer(selectedSubmission, q, idx)}</span>
                              </div>
                              <div className="text-sm text-primary">
                                <span className="font-bold">Correct Answer:</span>
                                <span className="ml-2">{q.correct_answer}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scoring */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Grade Submission</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white text-sm font-bold mb-2 block">Score</Label>
                      <Input 
                        type="number"
                        value={scoringForm.score}
                        onChange={(e) => setScoringForm(p => ({ ...p, score: e.target.value }))}
                        placeholder="Enter score (e.g. 85)"
                        className="bg-white/5 border-white/10 text-white h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm font-bold mb-2 block">Notes</Label>
                      <Textarea 
                        value={scoringForm.notes}
                        onChange={(e) => setScoringForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Add feedback or notes for the candidate..."
                        className="bg-white/5 border-white/10 text-white rounded-lg"
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={saveScore}
                      disabled={submittingScore}
                      className="btn-green w-full rounded-lg h-11 font-bold"
                    >
                      {submittingScore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Save Score
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrgAssessments;
