import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle2, Trophy, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ApplicationSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobTitle: string;
}


export const ApplicationSuccessModal = ({ open, onOpenChange, jobTitle }: ApplicationSuccessModalProps) => {
    const [stage, setStage] = useState<'analyzing' | 'ranking' | 'success'>('analyzing');
    const [rank, setRank] = useState(4); // Start at 4

    useEffect(() => {
        if (open) {
            setStage('analyzing');
            setRank(4);

            // Sequence: Analyzing -> Ranking -> Success
            setTimeout(() => setStage('ranking'), 1500);

            // Simulate moving up the rank
            setTimeout(() => setRank(3), 2500);
            setTimeout(() => setRank(2), 3500); // Final Rank 2

            setTimeout(() => setStage('success'), 4500);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-neutral-900 dark:bg-black border-none shadow-2xl overflow-hidden p-0">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#ADFF44] to-[#8BCC36] p-6 text-center text-white">
                    <h2 className="text-2xl font-bold mb-1">Application Sent!</h2>
                    <p className="opacity-90 text-sm">Targeting: {jobTitle}</p>
                </div>

                <div className="p-6">
                    {stage === 'analyzing' && (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-16 h-16 border-4 border-[#ADFF44]/30 border-t-[#ADFF44] rounded-full animate-spin mb-4"></div>
                            <p className="text-neutral-400 font-medium">Analyzing applicant pool...</p>
                        </div>
                    )}

                    {(stage === 'ranking' || stage === 'success') && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-neutral-300 dark:text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" /> Live Leaderboard
                                </h3>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
                                    ● Live Updates
                                </span>
                            </div>

                            <div className="space-y-2 relative">
                                {/* Render sorted list based on current simulated rank */}


                                <div className="space-y-2">
                                    {/* Top 3 + User Context */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 dark:bg-slate-800 opacity-60">
                                        <span className="font-bold text-neutral-500">#1</span>
                                        <span className="text-neutral-400">Alex Chen</span>
                                        <span className="font-mono text-sm">98%</span>
                                    </div>

                                    {/* User Row - Animated */}
                                    <motion.div
                                        layout
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-lg z-10 ${rank <= 2 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-400' : 'bg-neutral-900 border-[#ADFF44]/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold text-lg ${rank <= 2 ? 'text-yellow-600' : 'text-[#ADFF44]'}`}>#{rank}</span>
                                            <div>
                                                <p className="font-bold text-white">YOU</p>
                                                <p className="text-xs text-neutral-500">Your Resume</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600 text-lg">94%</span>
                                    </motion.div>

                                    {rank > 2 && (
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 dark:bg-slate-800 opacity-60">
                                            <span className="font-bold text-neutral-500">#{rank - 1}</span>
                                            <span className="text-neutral-400">Sarah Jones</span>
                                            <span className="font-mono text-sm">95%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {stage === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6 text-center"
                                >
                                    <div className="flex justify-center mb-2">
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h4 className="font-bold text-green-800 text-lg">Top 5% Applicant!</h4>
                                    <p className="text-green-700 text-sm">Your resume is highly optimized for this role. Recruiters are 3x more likely to view your profile.</p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    <div className="mt-6">
                        <Button className="w-full bg-black text-white" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
