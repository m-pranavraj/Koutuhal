import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search as SearchIcon, 
  Eye, 
  ClipboardList, 
  Video, 
  Award,
  MapPin,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusStages = [
  "pending",
  "screening",
  "assessment",
  "interview",
  "final_review",
  "shortlisted",
  "selected"
];

const statusConfig: Record<string, { color: string; label: string; icon: any; description: string }> = {
  pending: { 
    color: "text-neutral-400", 
    label: "Applied", 
    icon: Clock,
    description: "Application successfully submitted"
  },
  screening: { 
    color: "text-blue-400", 
    label: "Screening", 
    icon: Eye,
    description: "Recruiter is reviewing your profile"
  },
  assessment: { 
    color: "text-purple-400", 
    label: "Assessment", 
    icon: ClipboardList,
    description: "Action required: Complete technical test"
  },
  interview: { 
    color: "text-amber-400", 
    label: "Interview", 
    icon: Video,
    description: "Interview scheduled with the team"
  },
  final_review: { 
    color: "text-orange-400", 
    label: "Final Review", 
    icon: SearchIcon,
    description: "Evaluating final performance metrics"
  },
  shortlisted: { 
    color: "text-emerald-400", 
    label: "Shortlisted", 
    icon: CheckCircle,
    description: "Congratulations! You've made the cut"
  },
  selected: { 
    color: "text-primary", 
    label: "Selected", 
    icon: Award,
    description: "Offer issued. Check your email!"
  },
  accepted: { 
    color: "text-primary", 
    label: "Accepted", 
    icon: CheckCircle,
    description: "Welcome to the team!"
  },
  rejected: { 
    color: "text-red-400", 
    label: "Rejected", 
    icon: XCircle,
    description: "Application not selected this time"
  },
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      const student_p = sp as any;
      const { data } = await supabase
        .from("applications")
        .select(`
          *, 
          jobs(title, location, job_type, organization_profiles(company_name)),
          application_activity(*)
        `)
        .eq("student_id", student_p.id)
        .order("created_at", { ascending: false });
        
      if (data) setApplications(data);
    } catch (err) {
      console.error("Fetch apps error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status: string) => {
    if (status === "rejected") return -1;
    if (status === "accepted") return statusStages.length;
    return statusStages.indexOf(status);
  };

  if (loading) return (
    <div className="space-y-8 p-1">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/5 rounded-2xl" />
      </div>
      <div className="grid gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card border-white/5 border-dashed p-8">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-14 w-14 rounded-2xl bg-white/5" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3 bg-white/5" />
                <Skeleton className="h-4 w-1/4 bg-white/5" />
              </div>
              <Skeleton className="h-12 w-32 bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-4 pt-6 border-t border-white/5">
              <Skeleton className="h-2 w-full bg-white/5 rounded-full" />
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map(j => <Skeleton key={j} className="h-8 w-8 rounded-full bg-white/5" />)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Application Activity</h1>
          <p className="text-neutral-500 mt-2 font-medium">Real-time tracking of your professional journey.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{applications.length} Active Tracks</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="glass-card border-white/5 shadow-premium py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No applications yet</h3>
          <p className="text-neutral-500 max-w-sm mx-auto mb-8">Your dream career starts with the first application. Explore open roles today.</p>
          <Button asChild className="btn-green rounded-xl h-12 px-8">
            <Link to="/dashboard/jobs">Browse Openings</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app, i) => {
            const currentStatus = app.status;
            const config = statusConfig[currentStatus] || statusConfig.pending;
            const stageIndex = getStageIndex(currentStatus);
            const isRejected = currentStatus === "rejected";
            const StatusIcon = config.icon;

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/20 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                      <div className="flex items-start gap-6">
                        <div className={`h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0`}>
                           <Briefcase className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{app.jobs?.title}</h3>
                          <p className="text-sm font-bold text-white/40 mb-3">{app.jobs?.organization_profiles?.company_name}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/30">
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{app.jobs?.location || "Remote"}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Applied {new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 text-right">
                         <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 ${config.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">{config.label}</span>
                         </div>
                         <p className="text-[10px] font-medium text-white/30 italic max-w-[200px]">{config.description}</p>
                      </div>
                    </div>

                    {/* Timeline Tracker (Real Data) */}
                    <div className="p-6 md:p-8 bg-black/20">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Application Timeline</h4>
                        </div>
                        
                        {(app.application_activity && app.application_activity.length > 0) ? (
                          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                            {(app.application_activity as any[]).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((activity, idx) => (
                              <div key={activity.id} className="relative">
                                <div className={cn(
                                  "absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-neutral-900 bg-neutral-900 z-10",
                                  idx === 0 ? "bg-primary border-primary animate-pulse" : "bg-white/20 border-white/5"
                                )} />
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className={cn(
                                      "text-sm font-bold",
                                      idx === 0 ? "text-white" : "text-white/40"
                                    )}>
                                      {activity.event_type}
                                    </p>
                                    {activity.event_description && <p className="text-xs text-white/30 mt-1">{activity.event_description}</p>}
                                  </div>
                                  <span className="text-[10px] font-medium text-white/20 mt-1">
                                    {new Date(activity.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-white/20 text-xs italic font-medium">
                            No activity recorded yet
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
