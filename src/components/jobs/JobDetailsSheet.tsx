import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { Briefcase, MapPin, Banknote, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useApplications } from "@/context/ApplicationContext";

interface JobDetailsSheetProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDashboardOpen: (jobTitle: string, rank: number, isNew?: boolean) => void;
}

export const JobDetailsSheet = ({ job, open, onOpenChange, onDashboardOpen }: JobDetailsSheetProps) => {
    const { applyToJob, hasApplied } = useApplications();
    const [isApplying, setIsApplying] = useState(false);

    if (!job) return null;

    const applied = hasApplied(job.id as number);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const application = await applyToJob(job, 95); // Match score is hardcoded for now, ideal would be to get it from context/props
            onOpenChange(false);
            // Rank is now determined by backend, but we can pass a placeholder or get it from the new application object if we refactor further.
            // For now, we open the dashboard which will show the loading state or the new rank.
            onDashboardOpen(job.title, application.rank, true);
        } catch (error) {
            console.error("Failed to apply:", error);
            // Optionally show an error toast here
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4 border border-neutral-800">
                        <Building2 className="w-8 h-8 text-neutral-500" />
                    </div>
                    <SheetTitle className="text-2xl font-bold">{job.title}</SheetTitle>
                    <SheetDescription className="text-lg text-neutral-400 font-medium">{job.company}</SheetDescription>

                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary" className="px-3 py-1">{job.type}</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{job.mode}</Badge>
                        <div className="flex items-center text-sm text-neutral-500 ml-2">
                            <MapPin className="w-4 h-4 mr-1" /> {job.location}
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                            <span className="text-xs text-neutral-500 uppercase font-semibold">Salary</span>
                            <p className="font-bold text-white mt-1 flex items-center">
                                <Banknote className="w-4 h-4 mr-2 text-green-600" /> {job.salary}
                            </p>
                        </div>
                        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                            <span className="text-xs text-neutral-500 uppercase font-semibold">Experience</span>
                            <p className="font-bold text-white mt-1 flex items-center">
                                <Briefcase className="w-4 h-4 mr-2 text-[#ADFF44]" /> {job.experience}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">About the Role</h3>
                        <p className="text-neutral-400 leading-relaxed text-sm">
                            {job.description}
                        </p>
                        <p className="text-neutral-400 leading-relaxed text-sm mt-4">
                            We are looking for a passionate individual who wants to make a difference.
                            You will be working with a team of talented engineers and designers to build
                            products that users love.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map(skill => (
                                <Badge key={skill} variant="outline" className="border-[#ADFF44]/30 text-[#ADFF44] bg-[#ADFF44]/5">
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
                            className="w-full bg-black hover:bg-slate-800 text-white h-12 text-lg"
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
