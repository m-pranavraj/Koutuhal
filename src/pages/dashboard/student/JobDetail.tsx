import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Globe, 
  ShieldCheck,
  Star,
  Users,
  Loader2,
  ExternalLink,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", internship: "Internship",
  contract: "Contract", freelance: "Freelance",
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [matchScore, setMatchScore] = useState(0);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, organization_profiles(company_name, logo_url, website_url, description)")
        .eq("id", id)
        .single();

      if (error) throw error;
      setJob(data);

      if (user) {
        // Get student profile for match scoring and application check
        const { data: sp } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setStudentProfile(sp);

        if (sp) {
          // Check if already applied
          const { data: app } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", id)
            .eq("student_id", sp.id)
            .maybeSingle();
          
          if (app) setApplied(true);

          // Calculate Match Score
          if (data.required_skills && sp.skills) {
            const matching = data.required_skills.filter((skill: string) => 
              sp.skills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
            );
            setMatchScore(Math.round((matching.length / data.required_skills.length) * 100));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      toast({ title: "Error", description: "Could not load job details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !studentProfile) return;
    
    // Check profile completion (matches BrowseJobs logic)
    if (!studentProfile.headline || !studentProfile.degree || !studentProfile.resume_url || !studentProfile.skills || !studentProfile.graduation_year || !studentProfile.college_id) {
      toast({ 
        title: "Profile Incomplete", 
        description: "Please complete your profile in Settings to apply.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .insert({ job_id: id, student_id: studentProfile.id });

      if (error) throw error;
      
      setApplied(true);
      toast({ title: "Success!", description: "Application submitted successfully." });
    } catch (err: any) {
      if (err.code === "23505") {
        toast({ title: "Already Applied", description: "You've already applied for this role.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-32 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[300px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
          <Skeleton className="h-[500px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
        <p className="text-neutral-500 mb-8 max-w-xs">The job you're looking for might have been closed or removed.</p>
        <Button onClick={() => navigate("/dashboard/jobs")} variant="outline" className="border-white/10 rounded-xl">
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/jobs")} 
          className="group text-neutral-400 hover:text-white rounded-full pl-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-white hover:bg-white/5">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-white hover:bg-white/5">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-white/5 shadow-premium overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(173,255,68,0.1),transparent)]" />
              </div>
              <CardContent className="p-8 -mt-16 flex flex-col md:flex-row items-start gap-6">
                <div className="h-24 w-24 rounded-2xl bg-neutral-900 border-4 border-black shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                  {job.organization_profiles?.logo_url ? (
                    <img src={job.organization_profiles.logo_url} alt={job.organization_profiles?.company_name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-bold py-0.5 rounded-full uppercase tracking-tighter">
                      {jobTypeLabels[job.job_type]}
                    </Badge>
                    {job.is_remote && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 text-[10px] font-bold py-0.5 rounded-full uppercase tracking-tighter">
                        Remote
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{job.title}</h1>
                  <p className="text-lg font-bold text-white/50 flex items-center gap-2">
                    {job.organization_profiles?.company_name}
                    {job.organization_profiles?.website_url && (
                      <a href={job.organization_profiles.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-primary hover:scale-110 transition-transform" />
                      </a>
                    )}
                  </p>
                </div>
              </CardContent>
              
              <div className="px-8 pb-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Location</p>
                   <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                     <MapPin className="h-4 w-4 text-primary" />
                     {job.location || "Remote"}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Experience</p>
                   <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                     <Users className="h-4 w-4 text-primary" />
                     {job.experience_level || "Any"}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Salary (PA)</p>
                   <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                     <DollarSign className="h-4 w-4 text-primary" />
                     {job.salary_min ? `₹${(job.salary_min / 100000).toFixed(1)}L - ${(job.salary_max / 100000).toFixed(1)}L` : "Not Disclosed"}
                   </div>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Posted on</p>
                   <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                     <Calendar className="h-4 w-4 text-primary" />
                     {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </div>
                 </div>
              </div>
            </Card>
          </motion.div>

          {/* Description & Requirements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-white/5 shadow-premium">
              <CardContent className="p-8 space-y-10">
                <section className="space-y-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-3 decoration-primary/30 decoration-4 underline-offset-8">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Role Description
                  </h2>
                  <div className="text-neutral-400 leading-relaxed whitespace-pre-wrap font-medium">
                    {job.description}
                  </div>
                </section>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Key Responsibilities
                    </h2>
                    <ul className="grid grid-cols-1 gap-3">
                      {job.responsibilities.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-neutral-300 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      Perks & Benefits
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {job.benefits.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 text-white/60 px-4 py-2 rounded-xl text-sm capitalize">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Match Score & Action */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-white/5 shadow-premium sticky top-8">
              <CardContent className="p-8 space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251} 
                        strokeDashoffset={251 - (251 * matchScore) / 100} 
                        className="text-primary transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <span className="absolute text-2xl font-black text-white">{matchScore}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Match Probability</h3>
                    <p className="text-sm text-neutral-500">Based on your shared skills</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-xs font-black text-white/30 uppercase tracking-widest text-center">Required Skills</p>
                   <div className="flex flex-wrap justify-center gap-2">
                     {job.required_skills?.map((s: string) => {
                       const isMatch = studentProfile?.skills?.some((ss: string) => ss.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ss.toLowerCase()));
                       return (
                         <Badge key={s} className={`rounded-lg px-3 py-1 text-[10px] font-bold ${isMatch ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
                           {s}
                           {isMatch && <CheckCircle2 className="h-2 w-2 ml-1" />}
                         </Badge>
                       );
                     })}
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  {applied ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-full bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 font-black uppercase tracking-widest text-xs">
                        Already Applied
                      </div>
                      <Link to="/dashboard/applications" className="text-xs text-primary font-bold hover:underline underline-offset-4">
                        View Application Status
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleApply} 
                      className="w-full h-14 btn-green shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-widest"
                    >
                      Apply for this Role
                    </Button>
                  )}
                  <p className="text-[10px] text-center text-neutral-500 leading-relaxed px-4">
                    By applying, you agree to share your student profile and resume with <strong>{job.organization_profiles?.company_name}</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Company Brief */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card border-white/5 shadow-premium">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {job.organization_profiles?.logo_url ? (
                      <img src={job.organization_profiles.logo_url} alt={job.organization_profiles?.company_name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none mb-1">About {job.organization_profiles?.company_name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                      <Globe className="h-3 w-3" />
                      Company Overview
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed line-clamp-4">
                  {job.organization_profiles?.description || "A forward-thinking organization dedicated to professional excellence and growth."}
                </p>
                <Button variant="outline" className="w-full border-white/10 rounded-xl text-xs font-bold text-white/70 h-10 hover:bg-white/5" asChild>
                   <Link to="#">View Company Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
