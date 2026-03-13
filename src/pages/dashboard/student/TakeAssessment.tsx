import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Timer, AlertCircle, CheckCircle, Brain, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TakeAssessment = () => {
    const { assignmentId } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [maxAttempts, setMaxAttempts] = useState(1);

    useEffect(() => {
        if (user && assignmentId) {
            fetchAssignment();
        }
    }, [user, assignmentId]);

    const fetchAssignment = async () => {
        try {
            const { data, error } = await supabase
                .from("assessment_assignments")
              .select("*, assessments(*, jobs(title, organization_profiles(company_name)))")
                .eq("id", assignmentId)
                .single();

            if (error || !data) {
                toast({ title: "Assessment not found", variant: "destructive" });
                navigate("/dashboard/assessments");
                return;
            }

            const maxAllowed = data.assessments?.max_attempts ?? 1;
            const { count } = await supabase
              .from("assessment_submissions")
              .select("id", { count: "exact", head: true })
              .eq("assessment_id", data.assessment_id)
              .eq("student_id", data.student_id);

            const used = count || 0;
            setAttemptsUsed(used);
            setMaxAttempts(maxAllowed);

            if (used >= maxAllowed) {
                toast({ title: "Attempt limit reached", description: `You have used all ${maxAllowed} attempt(s).` });
                navigate("/dashboard/assessments");
                return;
            }

            setAssignment(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let score = 0;
            const questions = assignment.assessments.questions || [];
            const attemptNumber = attemptsUsed + 1;
            const maxAllowed = assignment.assessments?.max_attempts ?? 1;
            if (assignment.assessments.assessment_type === "mcq") {
                questions.forEach((q: any) => {
                    if (answers[q.id] === q.correct_answer) {
                        score += 1;
                    }
                });
                score = questions.length > 0 ? Math.round((score / questions.length) * 100) : 100;
            }

            const { error: subError } = await supabase.from("assessment_submissions").insert({
                assessment_id: assignment.assessment_id,
                student_id: assignment.student_id,
                answers: answers as any,
                score: score,
                status: "submitted",
                attempt_number: attemptNumber,
                submitted_at: new Date().toISOString(),
            });

            if (subError) throw subError;

            // Mark assignment completed when max attempts reached.
            const shouldComplete = attemptNumber >= maxAllowed;
            const { error: assignError } = await supabase
                .from("assessment_assignments")
                .update({ status: shouldComplete ? "completed" : "pending" })
                .eq("id", assignmentId);

            if (assignError) {
              console.warn("Could not update assignment status:", assignError.message);
            }

            toast({
              title: "Assessment submitted successfully!",
              description: shouldComplete
                ? "You have used all attempts. Results are saved."
                : `Attempt ${attemptNumber}/${maxAllowed} submitted. You can retry.`
            });
            navigate("/dashboard/assessments");
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-40 rounded-3xl bg-white/5" />
        <Skeleton className="h-64 rounded-3xl bg-white/5" />
      </div>
    );

    const questions = assignment.assessments.questions || [];
    const currentQuestion = questions[currentQuestionIdx];
    const progress = ((Object.keys(answers).length) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Button variant="ghost" onClick={() => navigate("/dashboard/assessments")} className="mb-4 -ml-2 text-white/40 hover:text-white">
                   <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-4xl font-black text-white tracking-tight">{assignment.assessments.title}</h1>
                <p className="text-neutral-500 mt-2 font-medium">{assignment.assessments.jobs?.organization_profiles?.company_name} &bull; {assignment.assessments.jobs?.title}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {assignment.assessments.time_limit_minutes && (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2">
                       <Timer className="h-4 w-4 text-primary" />
                       <span className="text-xs font-bold text-primary uppercase tracking-widest">{assignment.assessments.time_limit_minutes} Min</span>
                    </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                   Progress: {Math.round(progress)}%
                </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                   Attempts: {attemptsUsed}/{maxAttempts}
                 </div>
              </div>
            </div>

            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
               />
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-card border-white/10 shadow-premium p-8 md:p-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-6xl font-black text-white/[0.02] select-none">
                      Q{currentQuestionIdx + 1}
                   </div>
                   
                   <div className="space-y-8">
                      <div className="flex gap-4">
                        <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black border border-primary/20">
                            {currentQuestionIdx + 1}
                        </span>
                        <div className="pt-2">
                          <h2 className="text-2xl font-bold text-white leading-tight">
                            {currentQuestion.question_text || currentQuestion.text}
                          </h2>
                        </div>
                      </div>

                      <div className="pl-16">
                        {assignment.assessments.assessment_type === "mcq" ? (
                            <RadioGroup
                                value={answers[currentQuestion.id]}
                                onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                                className="grid gap-4"
                            >
                                {(currentQuestion.options || []).map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className={cn(
                                       "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                                       answers[currentQuestion.id] === opt 
                                         ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                                         : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}>
                                        <RadioGroupItem value={opt} id={`q-opt${optIdx}`} className="border-white/20" />
                                        <Label htmlFor={`q-opt${optIdx}`} className="flex-1 font-medium text-white cursor-pointer px-2">
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Your detailed response</Label>
                                <Input
                                    value={answers[currentQuestion.id] || ""}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                    className="bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:border-primary/50 transition-colors"
                                    placeholder="Type your answer here..."
                                />
                            </div>
                        )}
                      </div>
                   </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="border-white/10 text-white rounded-xl h-12 px-6"
              >
                Previous
              </Button>

              {currentQuestionIdx < questions.length - 1 ? (
                <Button 
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="btn-green rounded-xl h-12 px-8 font-bold text-black"
                >
                  Next Question <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || Object.keys(answers).length < questions.length}
                  className="btn-green rounded-xl h-12 px-8 font-bold text-black shadow-lg shadow-primary/20"
                >
                   {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                   Finish Assessment
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 p-6 bg-white/5 rounded-3xl border border-white/10">
                <AlertCircle className="h-5 w-5 text-neutral-500" />
                <p className="text-sm text-neutral-400 font-medium">
                  {Object.keys(answers).length} of {questions.length} questions answered. Once submitted, you cannot change your answers.
                </p>
            </div>
        </div>
    );
};

export default TakeAssessment;
