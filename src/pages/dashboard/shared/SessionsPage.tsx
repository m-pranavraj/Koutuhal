import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, ExternalLink, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface SessionsPageProps {
  role: "student" | "mentor";
}

const SessionsPage = ({ role }: SessionsPageProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const profileTable = role === "student" ? "student_profiles" : "mentor_profiles";
      const { data: profile } = await supabase.from(profileTable).select("id").eq("user_id", user!.id).maybeSingle();
      if (!profile) { setLoading(false); return; }

      const column = role === "student" ? "student_id" : "mentor_id";
      const select = role === "student"
        ? "*, mentor_profiles(headline, profiles(full_name))"
        : "*, student_profiles(headline, profiles(full_name))";

      const { data } = await supabase.from("mentor_sessions").select(select).eq(column, profile.id).order("session_date", { ascending: false });
      if (data) setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMeetingLink = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    return `https://meet.jit.si/Koutuhal-${roomId}`;
  };

  const updateStatus = async (sessionId: string, status: string) => {
    setUpdatingId(sessionId);
    const updates: any = { status: status as any };

    if (status === "confirmed") {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session?.meeting_link) {
        updates.meeting_link = generateMeetingLink();
      }
    }

    const { error } = await supabase.from("mentor_sessions").update(updates).eq("id", sessionId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Session ${status}! âœ¨` });
      fetchSessions();
    }
    setUpdatingId(null);
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 bg-white/5" />
      <div className="grid gap-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight">Mentorship Sessions</h1>
        <p className="text-neutral-500 mt-2 font-medium">{role === "mentor" ? "Orchestrate your mentorship journey." : "Learn from the best in the industry."}</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="glass-card border-white/5 py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Clear Schedule</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">You don't have any sessions scheduled yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s, i) => {
            const otherName = role === "student"
              ? s.mentor_profiles?.profiles?.full_name
              : s.student_profiles?.profiles?.full_name;
            const otherHeadline = role === "student"
              ? s.mentor_profiles?.headline
              : s.student_profiles?.headline;
            
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                         <User className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          {otherName || "Anonymous Professional"}
                        </h3>
                        <p className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">
                          {otherHeadline || "Professional Mentor"}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {new Date(s.session_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {s.start_time} &ndash; {s.end_time}
                          </span>
                          <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md border", statusColors[s.status])}>
                            {s.status}
                          </Badge>
                          {s.session_type === "paid" && (
                             <Badge className="bg-primary/20 text-primary border-primary/20">PAID</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                      {s.meeting_link && s.status === "confirmed" && (
                        <Button asChild className="btn-green rounded-xl h-11 px-6 font-bold text-black flex-1 md:flex-none">
                          <a href={s.meeting_link} target="_blank" rel="noopener noreferrer">
                             <Video className="h-4 w-4 mr-2" /> Join Call
                          </a>
                        </Button>
                      )}
                      
                      {role === "mentor" && s.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "confirmed")} size="icon" variant="outline" className="border-white/10 hover:bg-green-500/10 hover:text-green-500 rounded-xl h-11 w-11 transition-all">
                             {updatingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                          </Button>
                          <Button disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "cancelled")} size="icon" variant="outline" className="border-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-xl h-11 w-11 transition-all">
                             <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      )}

                      {role === "mentor" && s.status === "confirmed" && (
                        <Button disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "completed")} variant="outline" className="border-white/10 hover:border-primary/50 text-white rounded-xl h-11 px-6 font-bold tracking-widest text-[10px] uppercase">
                           {updatingId === s.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                           Complete
                        </Button>
                      )}

                      {role === "student" && s.status === "pending" && (
                        <Button disabled={updatingId === s.id} onClick={() => updateStatus(s.id, "cancelled")} variant="outline" className="border-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-xl h-11 px-6 font-bold tracking-widest text-[10px] uppercase">
                           Cancel
                        </Button>
                      )}
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

export default SessionsPage;

