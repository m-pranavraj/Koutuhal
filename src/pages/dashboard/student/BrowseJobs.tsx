import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Search, Briefcase } from "lucide-react";

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", internship: "Internship",
  contract: "Contract", freelance: "Freelance",
};

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const pagination = usePagination({ pageSize: 20 });

  useEffect(() => { fetchJobs(); }, [pagination.page]);

  useEffect(() => { pagination.resetPage(); }, [search, typeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("jobs")
      .select("*, organization_profiles(company_name, logo_url)", { count: "exact" })
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .range(pagination.range.from, pagination.range.to);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (typeFilter !== "all") {
      query = query.eq("job_type", typeFilter as any);
    }

    const { data, count, error } = await query;
    if (!error && data) {
      setJobs(data);
      pagination.setTotalCount(count ?? 0);
    }

    if (user) {
      const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (sp) {
        const { data: apps } = await supabase.from("applications").select("job_id").eq("student_id", sp.id);
        if (apps) setAppliedJobIds(apps.map((a) => a.job_id));
      }
    }

    setLoading(false);
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    const { data: sp } = await supabase.from("student_profiles").select("id, headline, degree, resume_url, skills, graduation_year, college_id").eq("user_id", user.id).maybeSingle();

    if (!sp || !sp.headline || !sp.degree || !sp.resume_url || !sp.skills || !sp.graduation_year || !sp.college_id) {
      toast({ title: "Please complete your profile (Headline, Skills, Degree, Graduation Year, College, Resume) in Settings.", variant: "destructive" });
      return;
    }

    const studentId = sp.id;
    const { error } = await supabase.from("applications").insert({ job_id: jobId, student_id: studentId });
    if (error) {
      if (error.code === "23505") toast({ title: "You've already applied to this job", variant: "destructive" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAppliedJobIds(prev => [...prev, jobId]);
      toast({ title: "Application submitted!" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Jobs & Internships</h1>
        <p className="text-muted-foreground mt-1">Find your next opportunity</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => { if (e.key === "Enter") fetchJobs(); }}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Job Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(jobTypeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchJobs} variant="outline">Search</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : jobs.length === 0 ? (
        <Card className="py-12 text-center border">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No jobs found. Check back soon!</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow border">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-sm font-medium text-primary">{job.organization_profiles?.company_name}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{jobTypeLabels[job.job_type]}</span>
                          {job.salary_min && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}</span>}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        {job.required_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.required_skills.slice(0, 5).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {appliedJobIds.includes(job.id) ? (
                        <Button disabled className="shrink-0 font-bold bg-muted text-muted-foreground">Applied</Button>
                      ) : (
                        <Button onClick={() => handleApply(job.id)} className="shrink-0 font-bold">Apply Now</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onNext={pagination.nextPage}
            onPrev={pagination.prevPage}
            totalCount={pagination.totalCount}
          />
        </>
      )}
    </div>
  );
};

export default BrowseJobs;

