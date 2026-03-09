import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Briefcase, Users, Trash2 } from "lucide-react";

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", internship: "Internship",
  contract: "Contract", freelance: "Freelance",
};

const MyListings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { if (user) fetchJobs(); }, [user]);

  const fetchJobs = async () => {
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org) { setLoading(false); return; }
    const { data } = await supabase.from("jobs").select("*, applications(count)").eq("org_id", org.id).order("created_at", { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  };

  const deleteJob = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Job deleted" }); fetchJobs(); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Listings</h1>
        <p className="text-muted-foreground mt-1">Manage your job and internship postings</p>
      </div>

      {jobs.length === 0 ? (
        <Card className="py-12 text-center border">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No listings yet. Post your first job!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary">{jobTypeLabels[job.job_type]}</Badge>
                      <Badge variant={job.status === "open" ? "default" : "secondary"} className="capitalize">{job.status}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />{(job.applications as any)?.[0]?.count || 0} applicants
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteJob(job.id)} className="text-destructive">
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

export default MyListings;

