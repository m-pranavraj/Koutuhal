import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Trash2 } from "lucide-react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MentorAvailability = () => {
  const { user } = useAuth();
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [newSlot, setNewSlot] = useState({ day: "1", start: "09:00", end: "10:00" });

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: mp } = await supabase.from("mentor_profiles").select("id").eq("user_id", user!.id).single();
    if (mp) {
      setMentorId(mp.id);
      const { data } = await supabase.from("mentor_availability").select("*").eq("mentor_id", mp.id).order("day_of_week");
      if (data) setSlots(data);
    }
    setLoading(false);
  };

  const addSlot = async () => {
    if (!mentorId) return;
    const { error } = await supabase.from("mentor_availability").insert({
      mentor_id: mentorId,
      day_of_week: parseInt(newSlot.day),
      start_time: newSlot.start,
      end_time: newSlot.end,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added!" });
      fetchData();
    }
  };

  const removeSlot = async (id: string) => {
    await supabase.from("mentor_availability").delete().eq("id", id);
    toast({ title: "Slot removed" });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground mt-1">Set your weekly availability for sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Time Slot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label>Day</Label>
              <Select value={newSlot.day} onValueChange={(v) => setNewSlot((p) => ({ ...p, day: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {days.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start</Label>
              <Input type="time" value={newSlot.start} onChange={(e) => setNewSlot((p) => ({ ...p, start: e.target.value }))} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="time" value={newSlot.end} onChange={(e) => setNewSlot((p) => ({ ...p, end: e.target.value }))} />
            </div>
            <Button onClick={addSlot}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No availability set. Add your first time slot above.</p>
          ) : (
            <div className="space-y-2">
              {slots.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{days[s.day_of_week]}</span>
                    <span className="text-muted-foreground">{s.start_time} - {s.end_time}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSlot(s.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorAvailability;

