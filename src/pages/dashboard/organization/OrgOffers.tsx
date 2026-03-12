import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Plus, Upload, CheckCircle, FileText, IndianRupee, Calendar, X, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const OrgOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ application_id: "", salary: "", start_date: "" });
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!org) { setLoading(false); return; }
      const { data: jobs } = await supabase.from("jobs").select("id").eq("org_id", org.id);
      if (!jobs?.length) { setLoading(false); return; }
      const jobIds = jobs.map(j => j.id);
      const { data: apps } = await supabase.from("applications").select("id").in("job_id", jobIds);
      const appIds = apps?.map(a => a.id) || [];

      const [offersRes, selectedApps] = await Promise.all([
        supabase.from("offers")
          .select("*, applications(jobs(title), student_profiles(profiles:user_id(full_name)))")
          .in("application_id", appIds)
          .order("created_at", { ascending: false }),
        supabase.from("applications")
          .select("id, jobs(title), student_profiles(profiles:user_id(full_name))")
          .in("job_id", jobIds)
          .in("status", ["selected", "accepted", "interview", "shortlisted"]),
      ]);
      if (offersRes.data) setOffers(offersRes.data);
      if (selectedApps.data) setApplications(selectedApps.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let offer_letter_url = null;
      if (offerFile) {
        const path = `offers/${form.application_id}/${offerFile.name}`;
        const { error: upErr } = await supabase.storage.from("attachments").upload(path, offerFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
        offer_letter_url = urlData.publicUrl;
      }
      const { error } = await supabase.from("offers").insert({
        application_id: form.application_id,
        salary: form.salary || null,
        start_date: form.start_date || null,
        offer_letter_url,
        status: 'issued'
      });
      if (error) throw error;
      toast({ title: "Offer issued! ✨" });
      setShowCreate(false);
      setForm({ application_id: "", salary: "", start_date: "" });
      setOfferFile(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-10 w-32 bg-white/5" />
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
          <h1 className="text-4xl font-black text-white tracking-tight">Offer Portal</h1>
          <p className="text-neutral-500 mt-2 font-medium">Issue official offer letters and track acceptance status.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="btn-green rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10">
          {showCreate ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showCreate ? "Cancel" : "Issue New Offer"}
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="glass-card border-white/10 shadow-premium p-8">
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Candidate *</Label>
                  <Select value={form.application_id} onValueChange={v => setForm(p => ({ ...p, application_id: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5"><SelectValue placeholder="Choose a candidate" /></SelectTrigger>
                    <SelectContent>
                      {applications.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.student_profiles?.profiles?.full_name || "Applicant"} &ndash; {a.jobs?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Salary / Compensation</Label>
                    <div className="relative mt-1.5">
                      <Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl pl-10" placeholder="e.g. â‚¹12,00,000 PA" />
                      <IndianRupee className="absolute left-3.5 top-4 h-4 w-4 text-white/20" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Expected Start Date</Label>
                    <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="bg-white/5 border-white/10 h-12 rounded-xl mt-1.5 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Offer Letter (PDF)</Label>
                  <div className="mt-1.5 p-8 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer group" onClick={() => document.getElementById('offer-file-input')?.click()}>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-white/60">
                      {offerFile ? offerFile.name : "Click to upload offer letter PDF"}
                    </p>
                    <input id="offer-file-input" type="file" accept=".pdf" className="hidden" onChange={e => setOfferFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="btn-green rounded-xl h-11 px-8 font-bold text-black shadow-lg shadow-primary/20">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Issue Official Offer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-white/10 hover:bg-white/5 text-white rounded-xl h-11 px-6">Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {offers.length === 0 && !showCreate ? (
          <Card className="glass-card border-white/5 py-20 text-center">
            <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Build your team</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">None of your candidates have received offers yet. Start hiring!</p>
          </Card>
        ) : (
          offers.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                       <Award className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {offer.applications?.student_profiles?.profiles?.full_name || "Candidate"}
                      </h3>
                      <p className="text-sm font-bold text-white/40 mb-3 uppercase tracking-wider">
                        {offer.applications?.jobs?.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                        {offer.salary && (
                          <span className="flex items-center gap-1.5 text-primary">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {offer.salary}
                          </span>
                        )}
                        {offer.start_date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Starts: {new Date(offer.start_date).toLocaleDateString()}
                          </span>
                        )}
                        <Badge variant="outline" className={cn(
                          "px-2 py-0.5 rounded-md border",
                          offer.status === "accepted" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                          offer.status === "issued" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                        )}>
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {offer.offer_letter_url && (
                    <Button variant="outline" asChild className="border-white/10 hover:bg-white/5 text-white rounded-xl h-11 px-6 transition-all group w-full md:w-auto">
                      <a href={offer.offer_letter_url} target="_blank" rel="noopener noreferrer">
                         <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" /> 
                         View Letter
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrgOffers;

