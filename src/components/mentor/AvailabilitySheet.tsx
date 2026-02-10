import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { Check } from "lucide-react";

interface AvailabilitySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export const AvailabilitySheet = ({ open, onOpenChange }: AvailabilitySheetProps) => {
    const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("16:00");
    const [isSaving, setIsSaving] = useState(false);

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-neutral-900 border-l border-neutral-800 text-white sm:max-w-md">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">Set Weekly Availability</SheetTitle>
                    <SheetDescription className="text-neutral-400">
                        Define when you are available for mentorship sessions. Calls will be booked within these windows.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Days Selector */}
                    <div className="space-y-3">
                        <Label className="text-neutral-300">Available Days</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => {
                                const isSelected = selectedDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isSelected
                                                ? 'bg-[#ADFF44] text-black shadow-[0_0_15px_rgba(173,255,68,0.3)] scale-105'
                                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                            }`}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-300">Start Time</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue placeholder="Start" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    {HOURS.map(h => (
                                        <SelectItem key={h} value={`${h}:00`}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-neutral-300">End Time</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                    <SelectValue placeholder="End" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                    {HOURS.map(h => (
                                        <SelectItem key={h} value={`${h}:00`}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Time Zone Note */}
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-blue-400 text-xs font-bold">i</span>
                        </div>
                        <p className="text-xs text-blue-200/70">
                            Availability is set in your local time (UTC+5:30). Students will see slots converted to their timezone.
                        </p>
                    </div>
                </div>

                <SheetFooter className="mt-8">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold h-12"
                    >
                        {isSaving ? "Saving Schedule..." : "Save Availability"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
