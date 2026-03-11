import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, DollarSign, Star, Video } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BookMentor = () => {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get("id");
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
    if (mentorId) fetchMentorData();
  }, [mentorId]);

  const fetchMentorData = async () => {
    const [mentorRes, availRes] = await Promise.all([
      supabase
        .from("mentor_profiles")
        .select("*, profiles(full_name, avatar_url, bio)")
        .eq("id", mentorId!)
        .single(),
      supabase
        .from("mentor_availability")
        .select("*")
        .eq("mentor_id", mentorId!)
        .eq("is_available", true)
        .order("day_of_week"),
    ]);
    if (mentorRes.data) setMentor(mentorRes.data);
    if (availRes.data) setAvailability(availRes.data);
    setLoading(false);
  };

  // Get available days of week from mentor availability
  const availableDaysOfWeek = useMemo(
    () => new Set(availability.map((a) => a.day_of_week)),
    [availability]
  );

  // Filter calendar to only show days the mentor is available
  const isDateDisabled = (date: Date) => {
    if (date < new Date()) return true;
    if (date > addDays(new Date(), 60)) return true;
    return !availableDaysOfWeek.has(date.getDay());
  };

  // Get slots for selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availability.filter((a) => a.day_of_week === selectedDate.getDay());
  }, [selectedDate, availability]);

  const generateMeetingLink = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    return `https://meet.jit.si/Koutuhal-${roomId}`;
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !user) return;
    setBooking(true);

    try {
      // Get student profile
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("id, headline, degree, resume_url, skills, graduation_year, college_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sp || !sp.headline || !sp.degree || !sp.resume_url || !sp.skills || !sp.graduation_year || !sp.college_id) {
        toast({
          title: "Complete your profile first",
          description: "Please complete your profile (Headline, Skills, Degree, Graduation Year, College, Resume) in Settings.",
          variant: "destructive",
        });
        setBooking(false);
        return;
      }

      const meetingLink = generateMeetingLink();
      const sessionDate = format(selectedDate, "yyyy-MM-dd");

      const { error } = await supabase.from("mentor_sessions").insert({
        mentor_id: mentorId!,
        student_id: sp.id,
        session_date: sessionDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        meeting_link: meetingLink,
        session_type: mentor?.session_type || "free",
        amount: mentor?.session_type === "paid" ? mentor?.hourly_rate || 0 : 0,
        currency: mentor?.currency || "USD",
      });

      if (error) throw error;

      toast({
        title: "Session booked! ðŸŽ‰",
        description: `Your session with ${mentor?.profiles?.full_name || "the mentor"} on ${format(selectedDate, "PPP")} has been requested. You'll be notified once confirmed.`,
      });
      navigate("/dashboard/sessions");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Mentor not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/mentors")}>
          Back to Mentors
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/mentors")} className="gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Mentors
      </Button>

      {/* Mentor info header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{mentor.profiles?.full_name || "Mentor"}</h1>
                <p className="text-primary font-medium">{mentor.headline}</p>
                <p className="text-sm text-muted-foreground mt-2">{mentor.profiles?.bio || "No bio available."}</p>
                {mentor.expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.expertise.map((e: string) => (
                      <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {mentor.session_type === "free" ? "Free sessions" : `$${mentor.hourly_rate}/hr`}
                  </span>
                  {mentor.years_experience && (
                    <span>{mentor.years_experience}+ years experience</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select a Date</CardTitle>
            </CardHeader>
            <CardContent>
              {availability.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  This mentor hasn't set their availability yet.
                </p>
              ) : (
                <>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    disabled={isDateDisabled}
                    className={cn("p-3 pointer-events-auto")}
                  />
                  <div className="mt-3 text-xs text-muted-foreground">
                    Available on: {[...availableDaysOfWeek].map((d) => days[d]).join(", ")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Time slots + booking */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? `Slots for ${format(selectedDate, "EEE, MMM d")}` : "Pick a date first"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedDate ? (
                <p className="text-muted-foreground text-center py-6">Select a date to see available slots.</p>
              ) : slotsForDate.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No slots available for this date.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {slotsForDate.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg border p-3 text-sm transition-colors",
                          selectedSlot?.id === slot.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.start_time} â€“ {slot.end_time}
                        </span>
                        {selectedSlot?.id === slot.id && <Badge>Selected</Badge>}
                      </button>
                    ))}
                  </div>

                  {selectedSlot && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                        <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                        <p><strong>Time:</strong> {selectedSlot.start_time} â€“ {selectedSlot.end_time}</p>
                        <p><strong>Type:</strong> {mentor.session_type === "free" ? "Free" : `Paid â€” $${mentor.hourly_rate}`}</p>
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Video className="h-3.5 w-3.5" /> Meeting link will be generated automatically
                        </p>
                      </div>
                      <Button onClick={handleBook} disabled={booking} className="w-full" size="lg">
                        {booking ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookMentor;

