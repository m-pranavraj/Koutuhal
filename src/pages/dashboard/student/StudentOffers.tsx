import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Award, Download, CheckCircle, XCircle, ArrowRight, FileCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const parseStorageRef = (value?: string | null): { bucket: string; path: string } | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    return { bucket: "attachments", path: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const marker = "/storage/v1/object/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const tail = url.pathname.slice(idx + marker.length);
    const parts = tail.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const offset = ["public", "sign", "authenticated"].includes(parts[0]) ? 1 : 0;
    const bucket = parts[offset];
    const path = parts.slice(offset + 1).join("/");
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
};

const StudentOffers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
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
        .from("offers")
        .select("*, applications(jobs(title, organization_profiles(company_name)))")
        .in("application_id", appIds)
        .order("created_at", { ascending: false });
      if (data) setOffers(data);
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId: string, status: string) => {
    const { data: rpcResult, error } = await (supabase as any).rpc("student_respond_offer", {
      p_offer_id: offerId,
      p_status: status,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (!rpcResult?.ok) {
      toast({ title: "Error", description: rpcResult?.reason || "Could not update offer.", variant: "destructive" });
    } else {
      toast({ title: status === "accepted" ? "Offer accepted! âœ¨" : "Offer declined" });
      await fetchData();
    }
  };

  const openOfferLetter = async (offerLetterUrl: string) => {
    const storageRef = parseStorageRef(offerLetterUrl);
    if (!storageRef) {
      window.open(offerLetterUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const { data, error } = await supabase.storage.from(storageRef.bucket).createSignedUrl(storageRef.path, 3600);
    if (error || !data?.signedUrl) {
      toast({ title: "Error", description: error?.message || "Unable to open offer letter.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>
      <div className="grid gap-4">
        {[1].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Official Offers</h1>
          <p className="text-neutral-500 mt-2 font-medium">Review and manage your professional career milestones.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <Award className="h-4 w-4 text-primary" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{offers.length} Offers</span>
        </div>
      </div>

      {offers.length === 0 ? (
        <Card className="glass-card border-white/5 py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">The hunt continues</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">Your next big opportunity is just an application away. Keep refining your profile!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <motion.div 
              key={offer.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <FileCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {offer.applications?.jobs?.title}
                      </h3>
                      <p className="text-sm font-bold text-white/40 mb-3">
                        {offer.applications?.jobs?.organization_profiles?.company_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        {offer.salary && (
                          <span className="flex items-center gap-1.5 text-primary">
                            Salary: {offer.salary}
                          </span>
                        )}
                        {offer.start_date && (
                          <span className="flex items-center gap-1.5">
                            Start: {new Date(offer.start_date).toLocaleDateString()}
                          </span>
                        )}
                        <Badge className={cn(
                          "px-2 py-0.5 rounded-md",
                          offer.status === "issued" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          <span className="capitalize">{offer.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    {offer.status === "issued" && (
                      <>
                        <Button onClick={() => handleOfferAction(offer.id, "accepted")} className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10 group">
                          Accept Offer <CheckCircle className="h-4 w-4 ml-2 group-hover:scale-110 transition-transform text-black" />
                        </Button>
                        <Button variant="outline" onClick={() => handleOfferAction(offer.id, "rejected")} className="border-white/10 hover:bg-white/5 text-white/60 hover:text-red-500 rounded-xl h-11 px-6 transition-colors">
                          Decline
                        </Button>
                      </>
                    )}
                    {offer.offer_letter_url && (
                      <Button variant="outline" onClick={() => openOfferLetter(offer.offer_letter_url)} className="border-white/10 hover:bg-white/5 text-white rounded-xl h-11 px-6 transition-all group">
                        <Download className="h-4 w-4 mr-2 group-hover:translate-y-1 transition-transform" />
                        View Letter
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

