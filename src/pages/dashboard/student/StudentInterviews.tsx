import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Video, Calendar, ExternalLink, ArrowRight, VideoOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-white/5 text-neutral-400 border-white/10",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  rescheduled: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};
const normalizeMeetingLink = (link?: string | null) => {
  if (!link) return null;
  const trimmed = link.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const StudentInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!sp) { setLoading(false); return; }
      const { data: apps } = await supabase.from("applications").select("id").eq("student_id", sp.id);
      if (!apps?.length) { setLoading(false); return; }
      const appIds = apps.map(a => a.id);
      const { data } = await supabase
        .from("interviews")
        .select("*, applications(jobs(title, organization_profiles(company_name)))")
        .in("application_id", appIds)
        .order("scheduled_at", { ascending: true });
      if (data) setInterviews(data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
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
        {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Interview Schedule</h1>
          <p className="text-neutral-500 mt-2 font-medium">Your upcoming sessions and personal feedback area.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <Video className="h-4 w-4 text-primary" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{interviews.length} Sessions</span>
        </div>
      </div>

      {interviews.length === 0 ? (
        <Card className="glass-card border-white/5 py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <VideoOff className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No interviews yet</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">Interviews are typically scheduled after the screening or assessment phase. Keep applying!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((iv, i) => (
            <motion.div 
              key={iv.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <Video className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {iv.applications?.jobs?.title}
                      </h3>
                      <p className="text-sm font-bold text-white/40 mb-3">
                        {iv.applications?.jobs?.organization_profiles?.company_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5 text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(iv.scheduled_at).toLocaleString([], { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge className={cn("px-2 py-0.5 rounded-md", statusColors[iv.status])}>
                          <span className="capitalize">{iv.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {iv.meeting_link && iv.status === "scheduled" && (
                    <Button asChild className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10 group">
                      <a href={normalizeMeetingLink(iv.meeting_link) || "#"} target="_blank" rel="noopener noreferrer">
                        Join Meeting <ExternalLink className="h-4 w-4 ml-2 group-hover:rotate-45 transition-transform text-black" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInterviews;

