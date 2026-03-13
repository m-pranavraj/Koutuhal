import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, Trash2, Plus, Calendar, MapPin, Eye, ArrowRight } from "lucide-react";
import { JobRow } from "@/types/dashboard";

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", internship: "Internship",
  contract: "Contract", freelance: "Freelance",
};

const MyListings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { if (user) fetchJobs(); }, [user]);

  const fetchJobs = async () => {
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle() as any;
    if (!org) { setLoading(false); return; }

    
    const { data } = await supabase
      .from("jobs")
      .select("*, applications(count)")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });
    
    if (data) setJobs(data as unknown as JobRow[]);
    setLoading(false);
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast({ title: "Deletion Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing Deleted", description: "The job posting has been removed." });
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20" />
      <p className="text-neutral-500 font-bold tracking-widest uppercase text-xs">Loading Listings...</p>
    </div>
  );

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight">Active Listings</h1>
          <p className="text-neutral-500 mt-2 font-medium">Manage and track your published job opportunities.</p>
        </motion.div>
        <Button asChild className="btn-green h-14 px-8 font-black rounded-2xl shadow-lg shadow-primary/20 group">
          <Link to="/dashboard/post-job" className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Post New Job
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {jobs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20">
               <Card className="glass-card border-white/5 shadow-premium text-center p-12 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Briefcase className="h-16 w-16 mx-auto text-neutral-700 mb-6 group-hover:text-primary/50 transition-colors duration-500" />
                <h3 className="text-2xl font-bold text-white mb-2">No listings found</h3>
                <p className="text-neutral-500 max-w-sm mx-auto mb-8">You haven't posted any jobs yet. Start building your team today!</p>
                <Button asChild className="btn-green rounded-xl h-12 px-6">
                  <Link to="/dashboard/post-job">Post Your First Job</Link>
                </Button>
              </Card>
            </motion.div>
          ) : (
            jobs.map((job, i) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-1 h-full ${job.status === 'open' ? 'bg-primary' : 'bg-neutral-700'}`} />
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Badge className={cn(
                             "font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full",
                             job.status === 'open' ? "bg-primary/20 text-primary" : "bg-neutral-800 text-neutral-400"
                           )}>
                             {job.status}
                           </Badge>
                           <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-white/10 text-neutral-500">
                             {jobTypeLabels[job.job_type]}
                           </Badge>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium text-neutral-500">
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary/70" /> {job.location || "Remote"}
                            </span>
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary/70" /> Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary/70" /> {(job.applications as any)?.[0]?.count || 0} Candidates Applied
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:self-center">
                        <Button variant="outline" size="lg" asChild className="border-white/10 hover:bg-white/5 text-white rounded-xl h-14 px-6 group/btn">
                          <Link to={`/dashboard/applications?job=${job.id}`} className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-neutral-500 group-hover/btn:text-primary" /> 
                            Applicants
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild className="border-white/10 hover:bg-white/5 text-white rounded-xl h-14 w-14">
                           <Link to={`/jobs/${job.id}`}>
                              <Eye className="h-5 w-5 text-neutral-500" />
                           </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteJob(job.id)} 
                          className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-14 w-14 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default MyListings;
