import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

interface SessionsPageProps {
  role: "student" | "mentor";
}

const SessionsPage = ({ role }: SessionsPageProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    const profileTable = role === "student" ? "student_profiles" : "mentor_profiles";
    const { data: profile } = await supabase.from(profileTable).select("id").eq("user_id", user!.id).maybeSingle();
    if (!profile) { setLoading(false); return; }

    const column = role === "student" ? "student_id" : "mentor_id";
    const select = role === "student"
      ? "*, mentor_profiles(headline, profiles(full_name))"
      : "*, student_profiles(headline, profiles(full_name))";

    const { data } = await supabase.from("mentor_sessions").select(select).eq(column, profile.id).order("session_date", { ascending: false });
    if (data) setSessions(data);
    setLoading(false);
  };

  const generateMeetingLink = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    return `https://meet.jit.si/TalentBridge-${roomId}`;
  };

  const updateStatus = async (sessionId: string, status: string) => {
    const updates: any = { status: status as any };

    // Auto-generate meeting link on confirm if not already set
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
      toast({ title: `Session ${status}!` });
      fetchSessions();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground mt-1">{role === "mentor" ? "Manage your mentorship sessions" : "Your booked mentorship sessions"}</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sessions yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s, i) => {
            const otherName = role === "student"
              ? s.mentor_profiles?.profiles?.full_name
              : s.student_profiles?.profiles?.full_name;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Session with {otherName || "User"}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{s.session_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{s.start_time} - {s.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${statusColors[s.status]}`}><span className="capitalize">{s.status}</span></Badge>
                        {s.session_type === "paid" && s.amount > 0 && (
                          <Badge variant="outline">${s.amount} {s.currency}</Badge>
                        )}
                        {s.session_type === "free" && <Badge variant="outline">Free</Badge>}
                      </div>
                      {s.meeting_link && s.status !== "cancelled" && (
                        <a
                          href={s.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary hover:underline"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Meeting <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {role === "mentor" && s.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(s.id, "confirmed")}>Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "cancelled")}>Cancel</Button>
                        </>
                      )}
                      {role === "mentor" && s.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateStatus(s.id, "completed")}>Mark Complete</Button>
                      )}
                      {role === "student" && s.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "cancelled")}>Cancel</Button>
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

