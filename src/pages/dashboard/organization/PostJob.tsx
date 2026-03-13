import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Calendar, Sparkles, CheckCircle2 } from "lucide-react";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", job_type: "internship", category: "",
    location: "", is_remote: false, required_skills: "",
    salary_min: "", salary_max: "", deadline: "",
    hiring_rounds: "", assessment_required: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle() as any;
      if (!org) {

        toast({ title: "Profile Incomplete", description: "Complete your organization profile first", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      
      const { error } = await supabase.from("jobs").insert({
        org_id: org.id,
        title: form.title,
        description: form.description,
        job_type: form.job_type as any,
        category: form.category || null,
        location: form.location || null,
        is_remote: form.is_remote,
        required_skills: form.required_skills ? form.required_skills.split(",").map((s) => s.trim()) : null,
        salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
        salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
        deadline: form.deadline || null,
        hiring_rounds: form.hiring_rounds ? form.hiring_rounds.split(",").map(s => s.trim()) : [],
        assessment_required: form.assessment_required,
        status: 'open' as any,
      } as any);

      if (error) throw error;
      
      toast({ title: "Success! ✨", description: "Your job listing is now live and visible to candidates." });
      navigate("/dashboard/listings");
    } catch (error: any) {
      toast({ title: "Posting Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Create a New Listing
        </h1>
        <p className="text-neutral-500 mt-2 font-medium">Define your next great hire and start receiving high-quality applications.</p>
      </motion.div>

      <Card className="glass-card border-white/5 shadow-premium overflow-hidden">
        <div className="bg-primary/10 border-b border-primary/20 p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-black font-black">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Job Specifications</h2>
            <p className="text-sm text-primary/70 font-medium">All fields marked with * are required for public visibility</p>
          </div>
        </div>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="title" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Job Title *</Label>
                <Input 
                  id="title" 
                  value={form.title} 
                  onChange={(e) => update("title", e.target.value)} 
                  required 
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary text-white"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Description *</Label>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={(e) => update("description", e.target.value)} 
                  rows={8} 
                  required 
                  placeholder="Tell candidates about the role, responsibilities, and team culture..."
                  className="bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label className="text-sm font-black text-neutral-400 uppercase tracking-widest">Job Type</Label>
                  <Select value={form.job_type} onValueChange={(v) => update("job_type", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="category" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Category</Label>
                  <Input 
                    id="category" 
                    value={form.category} 
                    onChange={(e) => update("category", e.target.value)} 
                    placeholder="e.g. Engineering"
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="location" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
                    <Input 
                      id="location" 
                      value={form.location} 
                      onChange={(e) => update("location", e.target.value)} 
                      placeholder="e.g. New York, NY"
                      className="bg-white/5 border-white/10 h-12 rounded-xl pl-11 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <Switch 
                    checked={form.is_remote} 
                    onCheckedChange={(v) => update("is_remote", v)} 
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-sm font-bold text-white">Remote Position</Label>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="skills" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Required Skills</Label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
                  <Input 
                    id="skills" 
                    value={form.required_skills} 
                    onChange={(e) => update("required_skills", e.target.value)} 
                    placeholder="e.g. React, TypeScript, Tailwind (comma-separated)"
                    className="bg-white/5 border-white/10 h-12 rounded-xl pl-11 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="salaryMin" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Min Salary/Stipend</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
                    <Input 
                      id="salaryMin" 
                      type="number" 
                      value={form.salary_min} 
                      onChange={(e) => update("salary_min", e.target.value)} 
                      placeholder="50000"
                      className="bg-white/5 border-white/10 h-12 rounded-xl pl-11 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="salaryMax" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Max Salary/Stipend</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
                    <Input 
                      id="salaryMax" 
                      type="number" 
                      value={form.salary_max} 
                      onChange={(e) => update("salary_max", e.target.value)} 
                      placeholder="120000"
                      className="bg-white/5 border-white/10 h-12 rounded-xl pl-11 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="deadline" className="text-sm font-black text-neutral-400 uppercase tracking-widest">Application Deadline</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-neutral-500" />
                  <Input 
                    id="deadline" 
                    type="date" 
                    value={form.deadline} 
                    onChange={(e) => update("deadline", e.target.value)} 
                    className="bg-white/5 border-white/10 h-12 rounded-xl pl-11 text-white invert-[0.8] brightness-200"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <CheckCircle2 className="h-5 w-5 text-primary" />
                   Hiring Process
                </h3>
                <div className="grid gap-3">
                  <Label htmlFor="hiring_rounds" className="text-xs font-bold text-neutral-500 uppercase">Stages (comma-separated)</Label>
                  <Input 
                    id="hiring_rounds" 
                    value={form.hiring_rounds} 
                    onChange={(e) => update("hiring_rounds", e.target.value)} 
                    placeholder="e.g. Resume Screen, Video Interview, Technical Task"
                    className="bg-white/10 border-white/10 h-12 rounded-xl text-white"
                  />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Switch 
                    checked={form.assessment_required} 
                    onCheckedChange={(v) => update("assessment_required", v)} 
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-sm font-bold text-white">Enable AI Screening Assessment</Label>
                </div>
              </div>
            </div>

            <Button 
                type="submit" 
                className="btn-green w-full h-14 font-black text-lg shadow-lg shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]" 
                disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                  Posting Listing...
                </div>
              ) : "Launch Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
