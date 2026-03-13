import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Search, User, Mail, GraduationCap, 
  MapPin, Calendar, ExternalLink, Download,
  CheckCircle2, XCircle, Clock, Video, ClipboardList
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface CandidateCardProps {
  app: ApplicationRow;
  onClick: (app: ApplicationRow) => void;
}


const SortableCandidateCard = ({ app, onClick }: CandidateCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const initials = app.student_profiles?.profiles?.full_name?.split(" ").map((n: any) => n[0]).join("") || "U";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(app)}
      className="group cursor-grab active:cursor-grabbing mb-3"
    >
      <Card className="glass-card border-white/5 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border border-white/10 group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                {app.student_profiles?.profiles?.full_name}
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { if (user) fetchApplications(); }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data: org_p } = await supabase.from("organization_profiles").select("id").eq("user_id", user!.id).maybeSingle();
    if (!org_p) { setLoading(false); return; }
    const org = org_p as any;
    
    const { data: jobs_p } = await supabase.from("jobs").select("id").eq("org_id", org.id);
    if (!jobs_p?.length) { setLoading(false); return; }
    const jobs = jobs_p as any[];
    
    const jobIds = jobs.map((j) => (j as any).id);
      const { data } = await supabase
        .from("applications")
        .select("*, jobs(title), job_match_scores(match_score), student_profiles(headline, skills, user_id, degree, resume_url, college_profiles(college_name), profiles:user_id(full_name, email, avatar_url))")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
    
      if (data) setApplications(data as unknown as ApplicationRow[]);
      setLoading(false);
    };


  const updateStatus = async (appId: string, status: string) => {
    const stage = pipelineStages.find(s => s.id === status);
    const { error } = await (supabase.from("applications") as any).update({ status: status as any }).eq("id", appId);



    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      fetchApplications(); // Revert on error
    } else {
      // Log activity
      await supabase.from("application_activity").insert({
        application_id: appId,
        event_type: `Status: ${stage?.label || status}`,
        event_description: `Candidate moved to ${stage?.label || status} stage.`
      } as any);

      toast({ title: "Status Updated", description: `Candidate moved to ${stage?.label || status}` });
    }
  };


  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id as string;
    const activeApp = applications.find(a => a.id === active.id);
    
    if (activeApp && pipelineStages.some(s => s.id === overId)) {
      if (activeApp.status !== overId) {
        const newApps = applications.map(a => 
          a.id === active.id ? { ...a, status: overId as any } : a
        );
        setApplications(newApps);
        updateStatus(active.id, overId);
      }
    }

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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                <Badge variant="outline" className="bg-white/5 border-white/5 text-neutral-500 text-[10px]">
                  {applications.filter(a => (stage.id === 'selected' ? ['selected', 'accepted'].includes(a.status) : a.status === stage.id)).length}
                </Badge>
              </div>

              <SortableContext
                id={stage.id}
                items={applications.filter(a => (stage.id === 'selected' ? ['selected', 'accepted'].includes(a.status) : a.status === stage.id)).map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  id={stage.id}
                  className={cn(
                    "bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl p-4 min-h-[500px] transition-all duration-300",
                    activeId && "ring-2 ring-primary/20 bg-primary/[0.01]"
                  )}
                >
                  <div className="space-y-3">
                    {applications
                      .filter(a => (stage.id === 'selected' ? ['selected', 'accepted'].includes(a.status) : a.status === stage.id))
                      .map((app) => (
                        <SortableCandidateCard key={app.id} app={app} onClick={setSelectedApp} />
                      ))}
                    
                    {applications.filter(a => (stage.id === 'selected' ? ['selected', 'accepted'].includes(a.status) : a.status === stage.id)).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 pointer-events-none">
                        <stage.icon className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Empty Stage</span>
                      </div>
                    )}
                  </div>
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="scale-105 shadow-2xl rotate-2 transition-transform">
               <SortableCandidateCard 
                app={applications.find(a => a.id === activeId)} 
                onClick={() => {}} 
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Candidate Profile Drawer */}
      <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent className="sm:max-w-xl glass border-white/10 p-0 overflow-hidden rounded-l-3xl shadow-2xl">
          {selectedApp && (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl">
              <ScrollArea className="flex-1">
                <div className="p-8">
                  {/* Header Area */}
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 shadow-primary/10">
                      <AvatarImage src={selectedApp.student_profiles?.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/20 text-primary text-3xl font-black uppercase">
                        {selectedApp.student_profiles?.profiles?.full_name?.split(" ").map((n: any) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-white tracking-tight">{selectedApp.student_profiles?.profiles?.full_name}</h2>
                      <p className="text-primary font-bold text-sm tracking-wide flex items-center gap-2 mt-1">
                        {selectedApp.student_profiles?.headline}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-neutral-400 text-xs">
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{selectedApp.student_profiles?.profiles?.email}</span>
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
                      <Badge className={cn("mt-1", pipelineStages.find(s => s.id === selectedApp.status)?.bg, pipelineStages.find(s => s.id === selectedApp.status)?.color)}>
                        {pipelineStages.find(s => s.id === selectedApp.status)?.label || selectedApp.status}
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
                      {selectedApp.student_profiles?.skills?.map((skill: string) => (
                        <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 py-1 px-3 rounded-lg text-xs font-bold">
                          {skill}
                        </Badge>
                      ))}
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
                        {pipelineStages.filter(s => s.id !== selectedApp.status).map(stage => (
                          <Button 
                            key={stage.id} 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { updateStatus(selectedApp.id, stage.id); setSelectedApp(null); fetchApplications(); }}
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

