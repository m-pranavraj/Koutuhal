import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const StudentAssessments = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!sp) { setLoading(false); return; }
    const { data } = await supabase
      .from("assessment_assignments")
      .select("*, assessments(*, jobs(title, organization_profiles(company_name)))")
      .eq("student_id", sp.id)
      .order("created_at", { ascending: false });
    if (data) setSubmissions(data);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assessments</h1>
        <p className="text-muted-foreground mt-1">Complete assessments assigned to you</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="py-12 text-center border">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assessments assigned yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub, i) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{sub.assessments?.title}</h3>
                    <p className="text-sm text-muted-foreground">{sub.assessments?.jobs?.organization_profiles?.company_name} â€” {sub.assessments?.jobs?.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{sub.assessments?.assessment_type}</span>
                      {sub.assessments?.time_limit_minutes && <span>{sub.assessments.time_limit_minutes} min</span>}
                      {sub.score !== null && <span>Score: {sub.score}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={sub.status === "submitted" || sub.status === "completed" ? "default" : sub.status === "evaluated" ? "secondary" : "outline"}>
                      <span className="flex items-center gap-1.5">
                        {sub.status === "pending" ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        <span className="capitalize">{sub.status}</span>
                      </span>
                    </Badge>
                    {sub.status === "pending" && (
                      <Button size="sm" asChild className="h-8">
                        <Link to={`/dashboard/assessments/take/${sub.id}`}>
                          <Play className="h-3.5 w-3.5 mr-1" /> Take
                        </Link>
                      </Button>
                    )}
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

export default StudentAssessments;

