import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Search, Briefcase, Building2 } from "lucide-react";

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", internship: "Internship",
  contract: "Contract", freelance: "Freelance",
};

const BrowseJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [salaryFilter, setSalaryFilter] = useState<string>("0");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const { user } = useAuth();
  const { toast } = useToast();
  const pagination = usePagination({ pageSize: 12 });

  useEffect(() => { fetchJobs(); }, [pagination.page]);

  useEffect(() => { pagination.resetPage(); }, [search, typeFilter, salaryFilter, remoteOnly]);

  const calculateMatch = (jobSkills: string[] | null) => {
    if (!jobSkills || jobSkills.length === 0 || studentSkills.length === 0) return 0;
    const matching = jobSkills.filter(skill => 
      studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
    );
    return Math.round((matching.length / jobSkills.length) * 100);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let currentStudentSkills = studentSkills;
      if (user && studentSkills.length === 0) {
        const { data: sp } = await supabase.from("student_profiles").select("skills").eq("user_id", user.id).maybeSingle();
        if (sp?.skills) {
          setStudentSkills(sp.skills);
          currentStudentSkills = sp.skills;
        }
      }

      let query = supabase
        .from("jobs")
        .select("*, organization_profiles(company_name, logo_url)", { count: "exact" })
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (typeFilter !== "all") {
        query = query.eq("job_type", typeFilter as any);
      }
      if (salaryFilter !== "0") {
        query = query.gte("salary_min", parseInt(salaryFilter));
      }
      if (remoteOnly) {
        query = query.eq("is_remote", true);
      }

      const { data, count, error } = await query.range(pagination.range.from, pagination.range.to);
      
      if (!error && data) {
        let finalJobs = data;
        if (filterParam === "high-match" && currentStudentSkills.length > 0) {
          finalJobs = data.filter(job => calculateMatch(job.required_skills) > 70);
          pagination.setTotalCount(finalJobs.length);
        } else {
          pagination.setTotalCount(count ?? 0);
        }
        setJobs(finalJobs);
      }

      if (user && appliedJobIds.length === 0) {
        const { data: sp } = await supabase.from("student_profiles").select("id").eq("user_id", user.id).maybeSingle();
        if (sp) {
          const { data: apps } = await supabase.from("applications").select("job_id").eq("student_id", sp.id);
          if (apps) setAppliedJobIds(apps.map((a) => a.job_id));
        }
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    const { data: sp } = await supabase.from("student_profiles").select("id, headline, degree, resume_url, skills, graduation_year, college_id").eq("user_id", user.id).maybeSingle();

    if (!sp || !sp.headline || !sp.degree || !sp.resume_url || !sp.skills || !sp.graduation_year || !sp.college_id) {
      toast({ 
        title: "Profile Incomplete", 
        description: "Please complete your profile (Headline, Skills, Degree, Graduation Year, College, Resume) in Settings to apply.", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase.from("applications").insert({ job_id: jobId, student_id: sp.id });
    if (error) {
      if (error.code === "23505") toast({ title: "Already Applied", description: "You've already applied to this job.", variant: "destructive" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAppliedJobIds(prev => [...prev, jobId]);
      toast({ title: "Success!", description: "Your application has been submitted successfully." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight">Explore Opportunities</h1>
          <p className="text-neutral-500 mt-2 font-medium">Find the perfect role that matches your skills and career goals.</p>
        </motion.div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{pagination.totalCount} Roles Open</span>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="glass-card border-white/5 shadow-premium overflow-visible">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus-visible:ring-primary/20"
                onKeyDown={(e) => { if (e.key === "Enter") fetchJobs(); }}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:w-[600px] gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(jobTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl">
                  <SelectItem value="0">Any Salary</SelectItem>
                  <SelectItem value="500000">₹5L+ PA</SelectItem>
                  <SelectItem value="1000000">₹10L+ PA</SelectItem>
                  <SelectItem value="1500000">₹15L+ PA</SelectItem>
                  <SelectItem value="2500000">₹25L+ PA</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between px-4 bg-white/5 border border-white/10 rounded-2xl h-14 group hover:border-primary/30 transition-colors">
                <span className="text-sm font-medium text-white/70">Remote Only</span>
                <input 
                  type="checkbox" 
                  checked={remoteOnly} 
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="w-5 h-5 rounded-md border-white/20 bg-transparent text-primary focus:ring-primary/20 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[280px] rounded-3xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="glass-card border-white/5 shadow-premium py-20 text-center">
          <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No matching opportunities</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find more roles.</p>
          <Button onClick={() => { setSearch(""); setTypeFilter("all"); setSalaryFilter("0"); setRemoteOnly(false); }} variant="link" className="mt-4 text-primary font-bold">Clear all filters</Button>
        </Card>
      ) : (
        <div className="space-y-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, i) => {
              const matchPercentage = calculateMatch(job.required_skills);
              return (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300 h-full flex flex-col overflow-hidden">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          {job.organization_profiles?.logo_url ? (
                            <img src={job.organization_profiles.logo_url} alt={job.organization_profiles.company_name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           {matchPercentage > 70 && (
                             <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-tighter shadow-[0_0_15px_rgba(173,255,68,0.2)]">High Match</Badge>
                           )}
                           <div className="flex items-center gap-1.5 bg-neutral-900/50 px-2 py-1 rounded-lg border border-white/5">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                             <span className="text-[10px] font-black text-white/80">{matchPercentage}% Match</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                        <p className="text-sm font-bold text-white/40 mb-4">{job.organization_profiles?.company_name}</p>
                        
                        <div className="space-y-2.5 mb-6">
                          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {job.location || "Remote"}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {jobTypeLabels[job.job_type]}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                            <DollarSign className="h-3.5 w-3.5 text-primary" />
                            {job.salary_min ? `₹${(job.salary_min / 100000).toFixed(1)}L - ${(job.salary_max / 100000).toFixed(1)}L PA` : "Not Disclosed"}
                          </div>
                        </div>

                        {job.required_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {job.required_skills.slice(0, 3).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/60 px-2 py-0 border-transparent">{s}</Badge>
                            ))}
                            {job.required_skills.length > 3 && (
                              <span className="text-[10px] text-white/30 font-bold">+{job.required_skills.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-11"
                        >
                          <Link to={`/dashboard/jobs/${job.id}`}>View Details</Link>
                        </Button>
                        {appliedJobIds.includes(job.id) ? (
                          <Button disabled className="flex-1 bg-white/5 text-white/30 border border-white/10 rounded-xl h-11 text-[11px] font-black uppercase tracking-widest">
                            Applied
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleApply(job.id)} 
                            className="flex-1 btn-green shadow-lg shadow-primary/10 hover:shadow-primary/20 rounded-xl h-11 text-[11px] font-black uppercase tracking-widest"
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          <div className="pt-6">
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              onNext={pagination.nextPage}
              onPrev={pagination.prevPage}
              totalCount={pagination.totalCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;

