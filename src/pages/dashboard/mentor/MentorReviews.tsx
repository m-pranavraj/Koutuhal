import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const MentorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchReviews(); }, [user]);

  const fetchReviews = async () => {
    const { data: mp } = await supabase.from("mentor_profiles").select("id").eq("user_id", user!.id).single();
    if (!mp) { setLoading(false); return; }
    const { data } = await supabase
      .from("reviews")
      .select("*, student_profiles(profiles(full_name))")
      .eq("mentor_id", mp.id)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-1">Feedback from your students</p>
      </div>

      {reviews.length === 0 ? (
        <Card className="py-12 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reviews yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm">{r.comment || "No comment provided."}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    â€” {r.student_profiles?.profiles?.full_name || "Student"} Â· {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorReviews;

