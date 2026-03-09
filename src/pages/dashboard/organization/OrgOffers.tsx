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
import { motion } from "framer-motion";
import { Award, Plus, Upload } from "lucide-react";

const OrgOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ application_id: "", salary: "", start_date: "" });
  const [offerFile, setOfferFile] = useState<File | null>(null);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
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
        .in("status", ["selected", "accepted"]),
    ]);
    if (offersRes.data) setOffers(offersRes.data);
    if (selectedApps.data) setApplications(selectedApps.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    let offer_letter_url = null;
    if (offerFile) {
      const path = `offers/${form.application_id}/${offerFile.name}`;
      const { error: upErr } = await supabase.storage.from("attachments").upload(path, offerFile, { upsert: true });
      if (upErr) { toast({ title: "Upload error", description: upErr.message, variant: "destructive" }); return; }
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(path);
      offer_letter_url = urlData.publicUrl;
    }
    const { error } = await supabase.from("offers").insert({
      application_id: form.application_id,
      salary: form.salary || null,
      start_date: form.start_date || null,
      offer_letter_url,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Offer issued!" }); setShowCreate(false); setForm({ application_id: "", salary: "", start_date: "" }); setOfferFile(null); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offer Management</h1>
          <p className="text-muted-foreground mt-1">Issue and manage offer letters</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" /> Issue Offer
        </Button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border">
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Candidate *</Label>
                  <Select value={form.application_id} onValueChange={v => setForm(p => ({ ...p, application_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                    <SelectContent>
                      {applications.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.student_profiles?.profiles?.full_name || "Applicant"} â€” {a.jobs?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Salary / Stipend</Label><Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="â‚¹25,000/month" /></div>
                  <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                </div>
                <div>
                  <Label>Offer Letter (PDF)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Label htmlFor="offer-file" className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Upload className="h-4 w-4" /> Upload File
                    </Label>
                    <input id="offer-file" type="file" accept=".pdf" className="hidden" onChange={e => setOfferFile(e.target.files?.[0] || null)} />
                    {offerFile && <span className="text-xs text-muted-foreground">{offerFile.name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Issue Offer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {offers.length === 0 && !showCreate ? (
        <Card className="py-12 text-center border">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No offers issued yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow border">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{offer.applications?.student_profiles?.profiles?.full_name || "Candidate"}</h3>
                    <p className="text-sm text-muted-foreground">{offer.applications?.jobs?.title}</p>
                    {offer.salary && <p className="text-sm mt-1">Salary: {offer.salary}</p>}
                    <Badge variant="default" className="mt-2 capitalize">{offer.status}</Badge>
                  </div>
                  {offer.offer_letter_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={offer.offer_letter_url} target="_blank" rel="noopener noreferrer">View Letter</a>
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

export default OrgOffers;

