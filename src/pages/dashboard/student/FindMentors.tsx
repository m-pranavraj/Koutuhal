import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Users, DollarSign } from "lucide-react";

const FindMentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchMentors(); }, []);

  const fetchMentors = async () => {
    const { data } = await supabase
      .from("mentor_profiles")
      .select("*, profiles(full_name, avatar_url, bio)")
      .order("created_at", { ascending: false });
    if (data) setMentors(data);
    setLoading(false);
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
                  <Button onClick={() => navigate(`/dashboard/book-mentor?id=${mentor.id}`)} className="mt-4 w-full">
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
