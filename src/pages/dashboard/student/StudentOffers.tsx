import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Award, Download, CheckCircle, XCircle } from "lucide-react";

const StudentOffers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!sp) { setLoading(false); return; }
    const { data: apps } = await supabase.from("applications").select("id").eq("student_id", sp.id);
    if (!apps?.length) { setLoading(false); return; }
    const appIds = apps.map(a => a.id);
    const { data } = await supabase
      .from("offers")
      .select("*, applications(jobs(title, organization_profiles(company_name)))")
      .in("application_id", appIds)
      .order("created_at", { ascending: false });
    if (data) setOffers(data);
    setLoading(false);
  };

  const handleOfferAction = async (offerId: string, status: string) => {
    const { error } = await supabase.from("offers").update({ status }).eq("id", offerId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "accepted" ? "Offer accepted!" : "Offer declined" });
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Offers</h1>
        <p className="text-muted-foreground mt-1">View, accept, or decline your offer letters</p>
      </div>

      {offers.length === 0 ? (
        <Card className="py-12 text-center border">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No offers received yet. Keep applying!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{offer.applications?.jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground">{offer.applications?.jobs?.organization_profiles?.company_name}</p>
                    {offer.salary && <p className="text-sm mt-1">Salary: {offer.salary}</p>}
                    {offer.start_date && <p className="text-xs text-muted-foreground mt-1">Start: {new Date(offer.start_date).toLocaleDateString()}</p>}
                    <Badge variant="default" className="mt-2 capitalize">{offer.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {offer.status === "issued" && (
                      <>
                        <Button size="sm" onClick={() => handleOfferAction(offer.id, "accepted")} className="gap-1">
                          <CheckCircle className="h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOfferAction(offer.id, "rejected")} className="gap-1 text-destructive hover:text-destructive">
                          <XCircle className="h-4 w-4" /> Decline
                        </Button>
                      </>
                    )}
                    {offer.offer_letter_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={offer.offer_letter_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentOffers;

