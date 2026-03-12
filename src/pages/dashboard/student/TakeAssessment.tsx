import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Timer, AlertCircle } from "lucide-react";

const TakeAssessment = () => {
    const { assignmentId } = useParams();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user && assignmentId) {
            fetchAssignment();
        }
    }, [user, assignmentId]);

    const fetchAssignment = async () => {
        const { data, error } = await supabase
            .from("assessment_assignments")
            .select("*, assessments(*, jobs(title))")
            .eq("id", assignmentId)
            .single();

        if (error || !data) {
            toast({ title: "Assessment not found", variant: "destructive" });
            navigate("/dashboard/assessments");
            return;
        }

        if (data.status !== "pending") {
            toast({ title: "Assessment already completed" });
            navigate("/dashboard/assessments");
            return;
        }

        setAssignment(data);
        setLoading(false);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // For now, mock score calculation for MCQs
            let score = 0;
            if (assignment.assessments.assessment_type === "mcq") {
                const questions = assignment.assessments.questions || [];
                questions.forEach((q: any) => {
                    if (answers[q.id] === q.correct_answer) {
                        score += 1;
                    }
                });
                // Normalize score to 100
                score = questions.length > 0 ? Math.round((score / questions.length) * 100) : 100;
            }

            // 1. Mark assignment as completed
            const { error: assignError } = await supabase
                .from("assessment_assignments")
                .update({ status: "completed" })
                .eq("id", assignmentId);

            if (assignError) throw assignError;

            // 2. Create submission record
            const { error: subError } = await supabase.from("assessment_submissions").insert({
                assessment_id: assignment.assessment_id,
                student_id: assignment.student_id,
                answers: answers as any,
                score: score,
                status: "submitted"
            });

            if (subError) throw subError;

            toast({ title: "Assessment submitted successfully!" });
            navigate("/dashboard/assessments");
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    const questions = assignment.assessments.questions || [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">{assignment.assessments.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{assignment.assessments.jobs?.title}</p>
                    </div>
                    {assignment.assessments.time_limit_minutes && (
                        <Badge variant="outline" className="flex items-center gap-1.5 h-8">
                            <Timer className="h-4 w-4" />
                            {assignment.assessments.time_limit_minutes} minutes
                        </Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{assignment.assessments.description}</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {questions.map((q: any, idx: number) => (
                    <Card key={q.id}>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        {idx + 1}
                                    </span>
                                    <p className="font-medium pt-1">{q.question_text || q.text}</p>
                                </div>

                                {assignment.assessments.assessment_type === "mcq" ? (
                                    <RadioGroup
                                        value={answers[q.id]}
                                        onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                                        className="ml-11 grid gap-3"
                                    >
                                        {(q.options || []).map((opt: string, optIdx: number) => (
                                            <div key={optIdx} className="flex items-center space-x-3">
                                                <RadioGroupItem value={opt} id={`q${q.id}-opt${optIdx}`} />
                                                <Label htmlFor={`q${q.id}-opt${optIdx}`} className="font-normal cursor-pointer">
                                                    {opt}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <div className="ml-11">
                                        <Label htmlFor={`q${q.id}-text`}>Your Answer</Label>
                                        <Input
                                            id={`q${q.id}-text`}
                                            value={answers[q.id] || ""}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Make sure you've answered all questions before submitting.
                </div>
                <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Assessment
                </Button>
            </div>
        </div>
    );
};

export default TakeAssessment;
