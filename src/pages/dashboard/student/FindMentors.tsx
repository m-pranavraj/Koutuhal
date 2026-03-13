import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Users, DollarSign } from "lucide-react";

const FindMentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMentors();

    const channel = supabase
      .channel("student-find-mentors")
      .on("postgres_changes", { event: "*", schema: "public", table: "mentor_profiles" }, fetchMentors)
      .on("postgres_changes", { event: "*", schema: "public", table: "mentor_availability" }, fetchMentors)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchMentors)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      // Only list mentors who currently have at least one available slot.
      const { data: slots, error: slotsError } = await supabase
        .from("mentor_availability")
        .select("mentor_id")
        .eq("is_available", true);

      if (slotsError) throw slotsError;

      const mentorIds = Array.from(new Set((slots || []).map((s: any) => s.mentor_id).filter(Boolean)));
      if (mentorIds.length === 0) {
        setMentors([]);
        return;
      }

      const { data: mentorRows, error: mentorsError } = await supabase
        .from("mentor_profiles")
        .select("*")
        .in("id", mentorIds)
        .order("created_at", { ascending: false });

      if (mentorsError) throw mentorsError;

      const userIds = Array.from(new Set((mentorRows || []).map((m: any) => m.user_id).filter(Boolean)));
      let profileMap = new Map<string, any>();

      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, bio")
          .in("user_id", userIds);

        profileMap = new Map((profileRows || []).map((p: any) => [p.user_id, p]));
      }

      const hydrated = (mentorRows || []).map((m: any) => ({
        ...m,
        profiles: profileMap.get(m.user_id) || null,
      }));

      setMentors(hydrated);
    } catch (error: any) {
      console.error("FindMentors fetch error:", error);
      toast({
        title: "Could not load mentors",
        description: error?.message || "Please refresh and try again.",
        variant: "destructive",
      });
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Mentors</h1>
        <p className="text-muted-foreground mt-1">Connect with industry experts for guidance</p>
      </div>

      {mentors.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No mentors available yet. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor, i) => (
            <motion.div key={mentor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mentor.profiles?.full_name || "Mentor"}</h3>
                    <p className="text-sm text-primary font-medium">{mentor.headline}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{mentor.profiles?.bio || "No bio available."}</p>
                    {mentor.expertise?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {mentor.expertise.slice(0, 4).map((e: string) => (
                          <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {mentor.session_type === "free" ? "Free sessions" : `$${mentor.hourly_rate}/hr`}
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/dashboard/book-mentor/${mentor.id}`)} className="mt-4 w-full">
                    View & Book Session
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

export default FindMentors;
