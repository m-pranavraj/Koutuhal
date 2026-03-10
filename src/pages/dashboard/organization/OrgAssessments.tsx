import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Trash2, HelpCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

const OrgAssessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    job_id: "", title: "", description: "", assessment_type: "mcq", time_limit_minutes: "30"
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
  };

  const updateQuestion = (qId: string, field: string, value: any, optionIndex?: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      if (field === "text") return { ...q, text: value as string };
      if (field === "correctOptionIndex") return { ...q, correctOptionIndex: value as number };
      if (field === "option" && optionIndex !== undefined) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value as string;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org) { setLoading(false); return; }
    setOrgId(org.id);
    const [assessmentsRes, jobsRes] = await Promise.all([
      supabase.from("assessments").select("*, jobs(title), assessment_submissions(count)").eq("org_id", org.id).order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title").eq("org_id", org.id).eq("status", "open"),
    ]);
    if (assessmentsRes.data) setAssessments(assessmentsRes.data);
    if (jobsRes.data) setJobs(jobsRes.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    if (form.assessment_type === "mcq" && questions.length === 0) {
      toast({ title: "Please add at least one question", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("assessments").insert({
      org_id: orgId,
      job_id: form.job_id,
      title: form.title,
      description: form.description || null,
      assessment_type: form.assessment_type,
      time_limit_minutes: parseInt(form.time_limit_minutes) || null,
      questions: form.assessment_type === "mcq" ? (questions as any) : null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment created!" });
      setShowCreate(false);
      setForm({ job_id: "", title: "", description: "", assessment_type: "mcq", time_limit_minutes: "30" });
      setQuestions([]);
      fetchData();
    }
  };

  const deleteAssessment = async (id: string) => {
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Assessment deleted" }); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground mt-1">Create and manage candidate assessments</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" /> Create Assessment
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border">
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job *</Label>
                    <Select value={form.job_id} onValueChange={(v) => setForm(p => ({ ...p, job_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                      <SelectContent>
                        {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.assessment_type} onValueChange={(v) => setForm(p => ({ ...p, assessment_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="coding">Coding Test</SelectItem>
                        <SelectItem value="assignment">Written Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <div className="w-48"><Label>Time Limit (minutes)</Label><Input type="number" value={form.time_limit_minutes} onChange={e => setForm(p => ({ ...p, time_limit_minutes: e.target.value }))} /></div>

                {/* Question Builder */}
                {form.assessment_type === "mcq" && (
                  <div className="mt-6 border-t pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg">Questions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-1" /> Add Question
                      </Button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                        <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">Add your first multiple-choice question</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questions.map((q, qIndex) => (
                          <Card key={q.id} className="border bg-muted/10">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <Label>Question {qIndex + 1}</Label>
                                  <Input
                                    value={q.text}
                                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                                    placeholder="Enter your question here..."
                                    required
                                  />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mt-6 text-destructive" onClick={() => removeQuestion(q.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-primary/20">
                                {q.options.map((opt, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                      <Label className="text-[10px] text-muted-foreground uppercase">Correct</Label>
                                      <Checkbox
                                        checked={q.correctOptionIndex === oIndex}
                                        onCheckedChange={() => updateQuestion(q.id, "correctOptionIndex", oIndex)}
                                      />
                                    </div>
                                    <Input
                                      value={opt}
                                      onChange={(e) => updateQuestion(q.id, "option", e.target.value, oIndex)}
                                      placeholder={`Option ${oIndex + 1}`}
                                      required
                                      className={q.correctOptionIndex === oIndex ? "border-green-500 bg-green-500/5" : ""}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button type="submit">Create Assessment</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {assessments.length === 0 && !showCreate ? (
        <Card className="py-12 text-center border">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assessments created yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assessments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.jobs?.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">{a.assessment_type}</Badge>
                      {a.time_limit_minutes && <Badge variant="secondary" className="text-xs">{a.time_limit_minutes} min</Badge>}
                      <span className="text-xs text-muted-foreground">{(a.assessment_submissions as any)?.[0]?.count || 0} submissions</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteAssessment(a.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgAssessments;

