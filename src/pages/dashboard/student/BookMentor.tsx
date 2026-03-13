import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Star, 
  Video, 
  Calendar as CalendarIcon, 
  User, 
  Languages, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Building2,
  GraduationCap
} from "lucide-react";

import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BookMentor = () => {
  const { mentorId: mentorIdFromPath } = useParams();
  const [searchParams] = useSearchParams();
  const mentorId = mentorIdFromPath || searchParams.get("id");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [mentor, setMentor] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (mentorId) {
      fetchMentorData();
      return;
    }

    setLoading(false);
    toast({
      title: "Invalid mentor link",
      description: "Please select a mentor again from the mentors page.",
      variant: "destructive",
    });
  }, [mentorId]);

  const fetchMentorData = async () => {
    try {
      const [mentorRes, availRes] = await Promise.all([
        supabase
          .from("mentor_profiles")
          .select("*")
          .eq("id", mentorId!)
          .maybeSingle(),
        supabase
          .from("mentor_availability")
          .select("*")
          .eq("mentor_id", mentorId!)
          .eq("is_available", true)
          .order("day_of_week"),
      ]) as any[];

      if (mentorRes.error) throw mentorRes.error;
      if (availRes.error) throw availRes.error;

      if (!mentorRes.data) {
        setMentor(null);
        return;
      }

      const mentorRow = mentorRes.data as any;
      let profileRow: any = null;

      if (mentorRow.user_id) {
        const { data: pData, error: pError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, bio")
          .eq("user_id", mentorRow.user_id)
          .maybeSingle();

        if (pError) throw pError;
        profileRow = pData;
      }

      setMentor({
        ...mentorRow,
        profiles: profileRow,
      });

      if (availRes.data) setAvailability(availRes.data as any[]);

    } catch (err) {
      console.error("Fetch mentor error:", err);
      setMentor(null);
    } finally {
      setLoading(false);
    }
  };

  const availableDaysOfWeek = useMemo(
    () => new Set(availability.map((a) => a.day_of_week)),
    [availability]
  );

  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    if (date > addDays(new Date(), 60)) return true;
    return !availableDaysOfWeek.has(date.getDay());
  };

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availability.filter((a) => a.day_of_week === selectedDate.getDay());
  }, [selectedDate, availability]);

  const generateMeetingLink = () => {
    const seed = `${Date.now().toString(36)}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    return `https://vdo.ninja/?room=koutuhal-${seed}`;
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !user) return;
    setBooking(true);

    try {
      const { data: sp, error: fetchError } = await supabase
        .from("student_profiles")
        .select("id, headline, degree, resume_url, skills, graduation_year, college_id")
        .eq("user_id", user.id)
        .maybeSingle() as any;

      if (fetchError || !sp) {
        toast({
          title: "Profile Not Found",
          description: "Please complete your profile in Settings before booking a session.",
          variant: "destructive",
        });
        setBooking(false);
        return;
      }

      const sessionDate = format(selectedDate, "yyyy-MM-dd");

      const { error } = await (supabase.from("mentor_sessions") as any).insert({
        mentor_id: mentorId!,
        student_id: sp.id,
        session_date: sessionDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        // Mentor sets/refreshes the final room link at approval time.
        meeting_link: null,
        session_type: mentor?.session_type || "free",
        amount: mentor?.session_type === "paid" ? mentor?.hourly_rate || 0 : 0,
        currency: mentor?.currency || "USD",
      });


      if (error) throw error;

      toast({
        title: "Booking Requested! 🎉",
        description: `Your session with ${mentor?.profiles?.full_name} on ${format(selectedDate, "PPP")} has been registered.`,
      });
      navigate("/dashboard/sessions");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
      <p className="text-neutral-500 font-bold animate-pulse">Initializing Calendar...</p>
    </div>
  );

  if (!mentor) return (
    <div className="text-center py-20 px-4">
      <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Mentor Not Found</h3>
      <Button variant="outline" className="mt-4 border-white/10 rounded-xl" onClick={() => navigate("/dashboard/mentors")}>
        Find Other Mentors
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/mentors")} className="group text-neutral-400 hover:text-white rounded-full">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Back to Mentors
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Mentor Card */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          <Card className="glass-card border-white/5 shadow-premium overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pt-6 px-6">
               <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-full">
                  Verified Mentor
               </Badge>
            </div>
            <CardContent className="p-8 -mt-12 text-center">
              <div className="h-24 w-24 rounded-3xl bg-neutral-900 border-4 border-black shadow-xl flex items-center justify-center overflow-hidden mx-auto mb-4 group ring-1 ring-white/10">
                {mentor.profiles?.avatar_url ? (
                  <img src={mentor.profiles.avatar_url} alt={mentor.profiles?.full_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{mentor.profiles?.full_name}</h2>
              <p className="text-primary text-sm font-bold mt-1">{mentor.headline}</p>
              
              <div className="mt-8 space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Experience</p>
                      <p className="text-sm font-bold text-white">{mentor.years_experience}+ Years</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Rate (Session)</p>
                      <p className="text-sm font-bold text-white">{mentor.session_type === "free" ? "Complimentary" : `$${mentor.hourly_rate} / hour`}</p>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                 <p className="text-xs text-neutral-500 leading-relaxed font-medium italic">
                   "{mentor.profiles?.bio || "Expert mentorship to accelerate your professional growth."}"
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking Engine */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5 shadow-premium">
            <CardHeader className="p-8 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                    Reservation Portal
                  </CardTitle>
                  <p className="text-neutral-500 text-sm mt-1 font-medium">Select your preferred date and time slot below.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Calendar Side */}
                <div className="p-8 border-r border-white/5">
                   <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Choose Date</h4>
                      <div className="flex items-center gap-2">
                         {[...availableDaysOfWeek].map(d => (
                           <div key={d} className="h-1.5 w-1.5 rounded-full bg-primary" />
                         ))}
                      </div>
                   </div>
                   <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    disabled={isDateDisabled}
                    className={cn("p-1 pointer-events-auto bg-transparent")}
                  />
                  <p className="mt-4 text-[10px] font-bold text-neutral-500 italic">
                    * Showing availability for the next 60 days
                  </p>
                </div>

                {/* Slots Side */}
                <div className="flex-1 p-8 bg-black/20">
                   <div className="mb-6">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">
                        {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tighter">Available Time Slots</p>
                   </div>

                   <AnimatePresence mode="wait">
                     {!selectedDate ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex flex-col items-center justify-center text-center gap-4">
                           <AlertCircle className="h-8 w-8 text-white/10" />
                           <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Please select a calendar date</p>
                        </motion.div>
                     ) : slotsForDate.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex flex-col items-center justify-center text-center gap-4">
                           <XCircle className="h-8 w-8 text-white/10" />
                           <p className="text-xs text-white/30 font-bold uppercase tracking-widest">No availability on this day</p>
                        </motion.div>
                     ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 gap-3">
                           {slotsForDate.map((slot) => (
                             <button
                               key={slot.id}
                               onClick={() => setSelectedSlot(slot)}
                               className={cn(
                                 "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                 selectedSlot?.id === slot.id 
                                   ? "bg-primary border-primary text-black shadow-lg shadow-primary/20" 
                                   : "bg-white/5 border-white/5 hover:border-primary/30 text-white"
                               )}
                             >
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                    selectedSlot?.id === slot.id ? "bg-black/10" : "bg-white/5"
                                  )}>
                                     <Clock className={cn("h-5 w-5", selectedSlot?.id === slot.id ? "text-white" : "text-primary")} />
                                  </div>
                                  <div className="text-left">
                                     <p className="text-sm font-black">{slot.start_time} - {slot.end_time}</p>
                                     <p className={cn("text-[10px] font-bold uppercase", selectedSlot?.id === slot.id ? "text-black/60" : "text-white/30")}>
                                       60 min Session
                                     </p>
                                  </div>
                               </div>
                               {selectedSlot?.id === slot.id && (
                                  <CheckCircle2 className="h-5 w-5 text-black" />
                               )}
                             </button>
                           ))}
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </CardContent>
            
            <AnimatePresence>
              {selectedSlot && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 pt-0"
                >
                  <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                           <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase tracking-widest">Confirmation Secure</p>
                           <p className="text-[10px] text-neutral-500 font-medium">Auto-generated meeting link will be sent</p>
                        </div>
                     </div>
                     <Button 
                       onClick={handleBook} 
                       disabled={booking} 
                       className="btn-green h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 min-w-[240px]"
                     >
                        {booking ? <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full" /> Finalizing...</span> : "Book My Session"}
                     </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-start gap-4">
             <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
             <div className="space-y-1">
                <p className="text-sm font-bold text-white">Cancellation Policy</p>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Sessions can be rescheduled up to 24 hours before the start time. By booking, you agree to our terms of conduct during mentorship sessions.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookMentor;
