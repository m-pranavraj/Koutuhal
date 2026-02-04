import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/data/jobs";
import { Briefcase, MapPin, Banknote, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useApplications } from "@/context/ApplicationContext";

interface JobDetailsSheetProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDashboardOpen: (jobTitle: string, rank: number) => void;
}

export const JobDetailsSheet = ({ job, open, onOpenChange, onDashboardOpen }: JobDetailsSheetProps) => {
    const { applyToJob, hasApplied } = useApplications();
    const [isApplying, setIsApplying] = useState(false);

    if (!job) return null;

    const applied = hasApplied(job.id);

    const handleApply = () => {
        setIsApplying(true);
        setTimeout(() => {
            const rank = Math.floor(Math.random() * 5) + 2;
            applyToJob(job, 95);
            setIsApplying(false);
            onOpenChange(false);
            onDashboardOpen(job.title, rank);
        }, 1500); // Sending simulation
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4 border border-slate-200">
                        <Building2 className="w-8 h-8 text-slate-500" />
                    </div>
                    <SheetTitle className="text-2xl font-bold">{job.title}</SheetTitle>
                    <SheetDescription className="text-lg text-slate-600 font-medium">{job.company}</SheetDescription>

                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary" className="px-3 py-1">{job.type}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{job.mode}</Badge>
                        <div className="flex items-center text-sm text-slate-500 ml-2">
                            <MapPin className="w-4 h-4 mr-1" /> {job.location}
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <span className="text-xs text-slate-500 uppercase font-semibold">Salary</span>
                            <p className="font-bold text-slate-900 mt-1 flex items-center">
                                <Banknote className="w-4 h-4 mr-2 text-green-600" /> {job.salary}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <span className="text-xs text-slate-500 uppercase font-semibold">Experience</span>
                            <p className="font-bold text-slate-900 mt-1 flex items-center">
                                <Briefcase className="w-4 h-4 mr-2 text-blue-600" /> {job.experience}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">About the Role</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {job.description}
                        </p>
                        <p className="text-slate-600 leading-relaxed text-sm mt-4">
                            We are looking for a passionate individual who wants to make a difference.
                            You will be working with a team of talented engineers and designers to build
                            products that users love.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-10 border-t pt-6">
                    {applied ? (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Application Sent
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg"
                            onClick={handleApply}
                            disabled={isApplying}
                        >
                            {isApplying ? <><Loader2 className="animate-spin mr-2" /> Sending Application...</> : "Apply Now"}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
