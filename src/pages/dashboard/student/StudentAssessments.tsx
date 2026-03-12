import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ClipboardList, Clock, CheckCircle, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const StudentAssessments = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!sp) { setLoading(false); return; }
      const { data } = await supabase
        .from("assessment_assignments")
        .select("*, assessments(*, jobs(title, organization_profiles(company_name)))")
        .eq("student_id", sp.id)
        .order("created_at", { ascending: false });
      if (data) setSubmissions(data);
    } catch (err) {
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Technical Assessments</h1>
          <p className="text-neutral-500 mt-2 font-medium">Demonstrate your skills to top employers through targeted tests.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <Brain className="h-4 w-4 text-primary" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{submissions.length} Tasks Assigned</span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card className="glass-card border-white/5 py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to test?</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">Complete your profile to get invited to skill assessments from top companies.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub, i) => (
            <motion.div 
              key={sub.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <ClipboardList className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {sub.assessments?.title}
                      </h3>
                      <p className="text-sm font-bold text-white/40 mb-3">
                        {sub.assessments?.jobs?.organization_profiles?.company_name} &bull; {sub.assessments?.jobs?.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5">{sub.assessments?.assessment_type}</span>
                        {sub.assessments?.time_limit_minutes && (
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {sub.assessments.time_limit_minutes} Min</span>
                        )}
                        {sub.score !== null && (
                          <span className="flex items-center gap-1.5 text-primary"><CheckCircle className="h-3.5 w-3.5" /> Score: {sub.score}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      sub.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      <span className="flex items-center gap-1.5">
                        {sub.status === "pending" ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        {sub.status}
                      </span>
                    </Badge>
                    
                    {sub.status === "pending" && (
                      <Button asChild className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10 group">
                        <Link to={`/dashboard/assessments/take/${sub.id}`}>
                          Start Assessment <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform text-black" />
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
