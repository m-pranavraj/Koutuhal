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
    const { data: org } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org) {
      toast({ title: "Complete your organization profile first", variant: "destructive" });
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
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job posted successfully!" });
      navigate("/dashboard/listings");
    }
    setSubmitting(false);
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post a Job</h1>
        <p className="text-muted-foreground mt-1">Create a new job or internship listing</p>
      </div>

      <Card className="border">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={6} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Type</Label>
                <Select value={form.job_type} onValueChange={(v) => update("job_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_remote} onCheckedChange={(v) => update("is_remote", v)} />
                <Label>Remote position</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input id="skills" value={form.required_skills} onChange={(e) => update("required_skills", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">Min Stipend/Salary</Label>
                <Input id="salaryMin" type="number" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="salaryMax">Max Stipend/Salary</Label>
                <Input id="salaryMax" type="number" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hiring_rounds">Hiring Rounds (comma-separated)</Label>
              <Input id="hiring_rounds" value={form.hiring_rounds} onChange={(e) => update("hiring_rounds", e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.assessment_required} onCheckedChange={(v) => update("assessment_required", v)} />
              <Label>Assessment required for this position</Label>
            </div>
            <Button type="submit" className="w-full h-12 font-bold" disabled={submitting}>
              {submitting ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;

