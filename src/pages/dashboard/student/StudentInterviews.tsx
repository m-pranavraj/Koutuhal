import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Video, Calendar, ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  rescheduled: "bg-muted text-muted-foreground",
};

const StudentInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
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
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Interviews</h1>
        <p className="text-muted-foreground mt-1">Your scheduled and past interviews</p>
      </div>

      {interviews.length === 0 ? (
        <Card className="py-12 text-center border">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No interviews scheduled yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((iv, i) => (
            <motion.div key={iv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{iv.applications?.jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground">{iv.applications?.jobs?.organization_profiles?.company_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(iv.scheduled_at).toLocaleString()}
                    </div>
                    <Badge className={`mt-2 ${statusColors[iv.status]}`}><span className="capitalize">{iv.status}</span></Badge>
                  </div>
                  {iv.meeting_link && iv.status === "scheduled" && (
                    <Button size="sm" asChild>
                      <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> Join
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

