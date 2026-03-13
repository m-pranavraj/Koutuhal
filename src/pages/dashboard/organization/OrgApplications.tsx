import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  FileText, Search, User, Mail, GraduationCap, 
  MapPin, Calendar, ExternalLink, Download,
  CheckCircle2, XCircle, Clock, Video, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationRow } from "@/types/dashboard";


const pipelineStages = [
  { id: "pending", label: "Applied", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "assessment", label: "Assessment", icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "interview", label: "Interview", icon: Video, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "selected", label: "Offer", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
  { id: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
];

const toPipelineStatus = (rawStatus?: string | null) => {
  const status = (rawStatus || "pending").toLowerCase();
  if (status === "offer") return "selected";
  if (status === "accepted") return "selected";
  if (status === "shortlisted") return "assessment";
  if (status === "screening") return "assessment";
  if (status === "final_review") return "interview";
  if (["pending", "assessment", "interview", "selected", "rejected"].includes(status)) return status;
  return "pending";
};

interface CandidateCardProps {
  app: ApplicationRow;
  selected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onClick: (app: ApplicationRow) => void;
}


const CandidateCard = ({ app, selected, onToggleSelect, onClick }: CandidateCardProps) => {

  const fullName = (app.student_profiles as any)?.full_name;
  const initials = fullName?.split(" ").map((n: any) => n[0]).join("") || "?";
  
  // Debug log to track what's being rendered
  if (!fullName) {
    console.log("⚠️ Missing full_name for app:", app.id, "Data:", app.student_profiles);
  }

  return (
    <div className="group mb-3">
      <Card className="glass-card border-white/5 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 cursor-pointer" onClick={() => onClick(app)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onToggleSelect(app.id, !!checked)}
                className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10 border-2 border-white/20 group-hover:ring-2 group-hover:ring-primary/30 transition-all hover:border-primary/50 shadow-sm">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                {fullName || "Unknown Candidate"}
              </h4>
              <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">
                {app.student_profiles?.headline || "Aspiring Professional"}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {app.student_profiles?.skills?.slice(0, 2).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-[8px] h-4 border-white/5 bg-white/5 text-neutral-400">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-[9px] text-neutral-500 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
                {app.job_match_scores?.[0]?.match_score && (
                  <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {app.job_match_scores[0].match_score}% Match
                  </span>
                )}
                <span className="text-[9px] font-bold text-primary group-hover:underline">Profile</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const OrgApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [bulkTargetStage, setBulkTargetStage] = useState<string>("assessment");

  const { toast } = useToast();

  useEffect(() => { if (user) fetchApplications(); }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      console.log("=== Org Dashboard Debug ===");
      console.log("Current user ID:", user?.id);
      
      const { data: org_p, error: orgError } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      
      if (!org_p) { 
        console.log("No organization profile found");
        setLoading(false); 
        return; 
      }
      const org = org_p as any;
      
      const { data: jobs_p } = await supabase.from("jobs").select("id").eq("org_id", org.id);
      
      if (!jobs_p?.length) { 
        console.log("No jobs found for org");
        setLoading(false); 
        return; 
      }
      const jobs = jobs_p as any[];
      const jobIds = jobs.map((j) => (j as any).id);
      
      const { data } = await supabase
        .from("applications")
        .select("id, job_id, student_id, status, created_at")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      
      console.log("Applications count:", data?.length);
      
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map((app: any) => app.student_id))];
        
        // Fetch ALL fields from student_profiles
        const { data: studentProfiles } = await supabase
          .from("student_profiles")
          .select("id, headline, skills, user_id, degree, resume_url, full_name, linkedin_url, github_url, portfolio_url, education, experience, branch, college_name, graduation_year")
          .in("id", studentIds);
        
        console.log("✅ Student profiles fetched:", studentProfiles);
        console.log("   Raw student profiles data:");
        studentProfiles?.forEach((sp: any) => {
          console.log(`     SP ${sp.id.substring(0,8)}...: full_name="${sp.full_name}", headline="${sp.headline}"`);
        });
        
        // Fetch jobs
        const { data: jobData } = await supabase.from("jobs").select("id, title").in("id", jobIds);
        
        // Merge all data - no fallback needed!
        const enrichedData = data.map((app: any) => {
          const student = studentProfiles?.find((sp: any) => sp.id === app.student_id);
          const job = jobData?.find((j: any) => j.id === app.job_id);
          
          return {
            ...app,
            status: toPipelineStatus(app.status),
            student_profiles: student,
            jobs: job
          };
        });
        
        console.log("✅ Final applications:", enrichedData);
        enrichedData.forEach((app: any, idx: number) => {
          const studentName = app.student_profiles?.full_name;
          console.log(`  [${idx}] App "${app.id.substring(0,8)}..." → Student: "${studentName || "⚠️ NO NAME (NULL)"}" | Headlines: ${app.student_profiles?.headline || "N/A"}`);
          if (!studentName) {
            console.warn(`     ⚠️ WHY NO NAME? Check DB - Full profile object:`, app.student_profiles);
          }
        });
        setApplications(enrichedData as unknown as ApplicationRow[]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch applications error:", err);
      setLoading(false);
    }
  };


  const updateStatus = async (appId: string, status: string): Promise<boolean> => {
    const normalizedStatus = toPipelineStatus(status);
    console.log("📤 updateStatus called with:", { appId, status: normalizedStatus, statusType: typeof normalizedStatus });
    console.log("📋 All pipeline stages:", pipelineStages.map(s => ({ id: s.id, label: s.label })));
    
    const stage = pipelineStages.find(s => s.id === normalizedStatus);
    console.log("🔍 Stage lookup result:", { searchedId: normalizedStatus, foundStage: stage?.label, foundStageId: stage?.id });
    
    console.log("💾 Sending to database via RPC v2 - status value:", normalizedStatus, "type:", typeof normalizedStatus);
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc("org_update_application_status_v2", {
      p_app_id: appId,
      p_status: normalizedStatus,
    });

    const error = rpcError;
    console.log("📊 Database response:", {
      hasError: !!error,
      errorMessage: error?.message,
      sentValue: normalizedStatus,
      rpcResult,
    });

    if (error) {
      console.error("❌ Status update ERROR - Full error object:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      fetchApplications(); // Revert on error
      return false;
    } else {
      // Structured RPC tells us exactly why update failed.
      if (!rpcResult?.ok) {
        console.error("❌ Status update not persisted", { appId, expected: normalizedStatus, rpcResult });
        toast({
          title: "Update failed",
          description: rpcResult?.reason || "Status was not saved in database.",
          variant: "destructive"
        });
        await fetchApplications();
        return false;
      }

      console.log("✅ Status updated successfully");

      // Reflect confirmed DB value in UI immediately.
      setApplications(prev => prev.map(a => (a.id === appId ? { ...a, status: normalizedStatus as any } : a)));
      
      // Log activity
      await supabase.from("application_activity").insert({
        application_id: appId,
        event_type: `Status: ${stage?.label || normalizedStatus}`,
        event_description: `Candidate moved to ${stage?.label || normalizedStatus} stage.`
      } as any);

      toast({ title: "Status Updated", description: `Candidate moved to ${stage?.label || normalizedStatus}` });
      
      // Refetch to sync with database
      await fetchApplications();
      return true;
    }
  };

  const toggleSelection = (appId: string, checked: boolean) => {
    setSelectedApplicationIds(prev => {
      if (checked) return prev.includes(appId) ? prev : [...prev, appId];
      return prev.filter(id => id !== appId);
    });
  };

  const moveSelectedApplications = async () => {
    if (selectedApplicationIds.length === 0) {
      toast({ title: "No candidates selected", description: "Select one or more candidates first." });
      return;
    }

    let successCount = 0;
    for (const appId of selectedApplicationIds) {
      const ok = await updateStatus(appId, bulkTargetStage);
      if (ok) successCount += 1;
    }

    setSelectedApplicationIds([]);
    toast({
      title: "Bulk Move Complete",
      description: successCount === selectedApplicationIds.length
        ? `${selectedApplicationIds.length} candidate(s) moved.`
        : `${successCount}/${selectedApplicationIds.length} moved. Some updates may be blocked by policy.`
    });
  };

  const selectAllInStage = (stageId: string) => {
    const idsInStage = applications
      .filter(a => toPipelineStatus(a.status) === stageId)
      .map(a => a.id);

    setSelectedApplicationIds(prev => {
      const set = new Set(prev);
      const allAlreadySelected = idsInStage.every(id => set.has(id));

      if (allAlreadySelected) {
        idsInStage.forEach(id => set.delete(id));
      } else {
        idsInStage.forEach(id => set.add(id));
      }
      return Array.from(set);
    });
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[400px] rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Hiring Pipeline
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm">{applications.length}</Badge>
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">Manage and track your candidates through the hiring process</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
          Selected: {selectedApplicationIds.length}
        </Badge>
        <Select value={bulkTargetStage} onValueChange={setBulkTargetStage}>
          <SelectTrigger className="w-52 bg-black/30 border-white/20">
            <SelectValue placeholder="Move to stage" />
          </SelectTrigger>
          <SelectContent>
            {pipelineStages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="btn-green" onClick={moveSelectedApplications}>Move Selected</Button>
        <Button variant="outline" className="border-white/20" onClick={() => setSelectedApplicationIds([])}>Clear</Button>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-6 min-h-[600px] scrollbar-hide">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", stage.bg)}>
                    <stage.icon className={cn("h-4 w-4", stage.color)} />
                  </div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-widest">{stage.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white/5 border-white/5 text-neutral-500 text-[10px]">
                    {applications.filter(a => toPipelineStatus(a.status) === stage.id).length}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-white/60 hover:text-primary" onClick={() => selectAllInStage(stage.id)}>
                    Select
                  </Button>
                </div>
              </div>

              <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl p-4 min-h-[500px] transition-all duration-300">
                  <div className="space-y-3">
                    {applications
                      .filter(a => toPipelineStatus(a.status) === stage.id)
                      .map((app) => (
                        <CandidateCard
                          key={app.id}
                          app={app}
                          selected={selectedApplicationIds.includes(app.id)}
                          onToggleSelect={toggleSelection}
                          onClick={setSelectedApp}
                        />
                      ))}
                    
                    {applications.filter(a => toPipelineStatus(a.status) === stage.id).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 pointer-events-none">
                        <stage.icon className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Empty Stage</span>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>

      {/* Candidate Profile Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent className="sm:max-w-xl glass border-white/10 p-0 overflow-hidden rounded-l-3xl shadow-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Candidate Profile: {selectedApp?.student_profiles?.profiles?.full_name}</SheetTitle>
          </SheetHeader>
          {selectedApp && (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl">
              <ScrollArea className="flex-1">
                <div className="p-8">
                  {/* Header Area */}
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-primary/10">
                      <AvatarImage src={selectedApp.student_profiles?.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary text-3xl font-black uppercase">
                        {(selectedApp.student_profiles as any)?.full_name?.split(" ").map((n: any) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-white tracking-tight">
                        {(selectedApp.student_profiles as any)?.full_name || "Unknown Candidate"}
                      </h2>
                      <p className="text-primary font-bold text-sm tracking-wide flex items-center gap-2 mt-1">
                        {selectedApp.student_profiles?.headline || "Aspiring Professional"}
                      </p>
                      <div className="flex flex-col gap-2 mt-3 text-neutral-400 text-xs">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Student Email (from signup)</span>
                        {selectedApp.student_profiles?.degree && (
                          <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{selectedApp.student_profiles.degree}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5 shadow-inner-glow">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Applying For</span>
                      <p className="text-sm font-bold text-white">{selectedApp.jobs?.title}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5 shadow-inner-glow">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Current Status</span>
                      <Badge className={cn("mt-1", pipelineStages.find(s => s.id === toPipelineStatus(selectedApp.status))?.bg, pipelineStages.find(s => s.id === toPipelineStatus(selectedApp.status))?.color)}>
                        {pipelineStages.find(s => s.id === toPipelineStatus(selectedApp.status))?.label || selectedApp.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      Professional Skills
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.student_profiles?.skills && selectedApp.student_profiles.skills.length > 0 ? (
                        selectedApp.student_profiles.skills.map((skill: string) => (
                          <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 py-1 px-3 rounded-lg text-xs font-bold">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  {selectedApp.student_profiles?.degree && (
                    <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Education
                        <div className="h-1 w-1 rounded-full bg-primary" />
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Degree</span>
                          <p className="text-sm font-bold text-white">{selectedApp.student_profiles.degree}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resume Section - PROMINENT */}
                  {selectedApp.student_profiles?.resume_url && (
                    <div className="mb-8 p-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
                      <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resume
                      </h3>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" asChild>
                        <a href={selectedApp.student_profiles.resume_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                          <Download className="h-4 w-4" /> Download/View Resume
                        </a>
                      </Button>
                    </div>
                  )}

                  {!selectedApp.student_profiles?.resume_url && (
                    <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02] opacity-50">
                      <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resume
                      </h3>
                      <p className="text-xs text-neutral-500 italic">No resume uploaded</p>
                    </div>
                  )}

                  {/* Additional Information & Links */}
                  <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      Professional Links
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </h3>
                    <div className="space-y-3">
                      {/* LinkedIn */}
                      {selectedApp.student_profiles?.linkedin_url ? (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                          <a href={selectedApp.student_profiles.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> LinkedIn Profile
                          </a>
                        </Button>
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2 rounded bg-white/5">LinkedIn: Not provided</div>
                      )}
                      
                      {/* GitHub */}
                      {selectedApp.student_profiles?.github_url ? (
                        <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white" asChild>
                          <a href={selectedApp.student_profiles.github_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> GitHub Profile
                          </a>
                        </Button>
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2 rounded bg-white/5">GitHub: Not provided</div>
                      )}
                      
                      {/* Portfolio */}
                      {selectedApp.student_profiles?.portfolio_url ? (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                          <a href={selectedApp.student_profiles.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Portfolio Website
                          </a>
                        </Button>
                      ) : (
                        <div className="text-xs text-neutral-500 italic p-2 rounded bg-white/5">Portfolio: Not provided</div>
                      )}
                    </div>
                  </div>

                  {/* Education Details */}
                  <div className="mb-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education & Background
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </h3>
                    <div className="space-y-3 text-xs">
                      {selectedApp.student_profiles?.degree && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-neutral-400 block mb-1">Degree</span>
                          <p className="text-sm font-bold text-white">{selectedApp.student_profiles.degree}</p>
                        </div>
                      )}
                      {selectedApp.student_profiles?.college_name && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-neutral-400 block mb-1">College/Institution</span>
                          <p className="text-sm font-bold text-white">{selectedApp.student_profiles.college_name}</p>
                        </div>
                      )}
                      {selectedApp.student_profiles?.branch && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-neutral-400 block mb-1">Branch</span>
                          <p className="text-sm font-bold text-white">{selectedApp.student_profiles.branch}</p>
                        </div>
                      )}
                      {selectedApp.student_profiles?.graduation_year && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-neutral-400 block mb-1">Graduation Year</span>
                          <p className="text-sm font-bold text-white">{selectedApp.student_profiles.graduation_year}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      Candidate Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedApp.student_profiles?.resume_url && (
                        <Button className="btn-green shadow-lg" asChild>
                          <a href={selectedApp.student_profiles.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                            <Download className="h-4 w-4" /> View Resume
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white flex items-center gap-2 rounded-xl">
                        <Mail className="h-4 w-4" /> Message
                      </Button>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3">Move Stage</span>
                      <div className="flex flex-wrap gap-2">
                        {pipelineStages.filter(s => s.id !== toPipelineStatus(selectedApp.status)).map(stage => (
                          <Button 
                            key={stage.id} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { 
                              const safeStage = toPipelineStatus(stage.id);
                              console.log("🔘 Move to Stage button clicked:", { buttonLabel: `Move to ${stage.label}`, stageId: stage.id, stageLabel: stage.label, appId: selectedApp.id });
                              updateStatus(selectedApp.id, safeStage); 
                              setSelectedApp(null); 
                            }}
                            className="text-[10px] h-8 border-white/5 hover:border-primary/50 bg-white/5 hover:bg-primary/10 text-white"
                          >
                            Move to {stage.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-6 bg-black/60 border-t border-white/10 flex justify-end">
                <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setSelectedApp(null)}>Close Profile</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrgApplications;

