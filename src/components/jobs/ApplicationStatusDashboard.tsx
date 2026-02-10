import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ApplicationStatusDashboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobTitle: string;
    initialRank: number;
    showSuccess?: boolean; // New prop to trigger success animation
}

const mockApplicants = [
    { name: "Alex Chen", score: 98, role: "Senior Dev" },
    { name: "Sarah Jones", score: 95, role: "Tech Lead" },
    { name: "Michael Ross", score: 92, role: "Full Stack" },
    // User will be inserted here
    { name: "David Kim", score: 89, role: "Frontend Dev" },
    { name: "Emily White", score: 85, role: "React Dev" },
];

export const ApplicationStatusDashboard = ({ open, onOpenChange, jobTitle, initialRank, showSuccess = false }: ApplicationStatusDashboardProps) => {
    const [rank, setRank] = useState(initialRank);
    const [view, setView] = useState<'success' | 'dashboard'>(showSuccess ? 'success' : 'dashboard');

    useEffect(() => {
        if (open) {
            if (showSuccess) setView('success');

            // Simulate live movement each time opened to make it feel "active"
            if (rank > 1) {
                const timeout = setTimeout(() => {
                    setRank(r => Math.max(1, r - 1));
                }, 2500); // Slower update for realism
                return () => clearTimeout(timeout);
            }
        }
    }, [open, showSuccess]);

    // Auto-transition from success to dashboard
    useEffect(() => {
        if (view === 'success') {
            const timer = setTimeout(() => setView('dashboard'), 2000);
            return () => clearTimeout(timer);
        }
    }, [view]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-neutral-900 dark:bg-black border border-white/10 shadow-2xl overflow-hidden p-0">

                {view === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-10 flex flex-col items-center justify-center text-center h-[400px]"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-24 h-24 bg-[#ADFF44] rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(173,255,68,0.4)]"
                        >
                            <Trophy className="w-12 h-12 text-black" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">Application Sent!</h2>
                        <p className="text-neutral-400 mb-8">Good luck! We are calculating your rank...</p>

                        <div className="flex items-center gap-2 text-[#ADFF44] font-mono text-sm">
                            <span className="w-2 h-2 bg-[#ADFF44] rounded-full animate-pulse" />
                            ANALYZING COMPETITION
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-black p-6 flex justify-between items-start border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Live Application Status</h2>
                                <p className="text-neutral-500 text-sm">Real-time candidate ranking for <span className="text-white">{jobTitle}</span></p>
                            </div>
                            <button onClick={() => onOpenChange(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 bg-neutral-900/50">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-neutral-300 dark:text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
                                    </h3>
                                    <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse font-medium">
                                        ● Live
                                    </span>
                                </div>

                                <div className="space-y-3 relative">
                                    {/* Static Top Applicant */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5 opacity-50">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-neutral-600 w-6">#1</span>
                                            <span className="text-neutral-500">Alex Chen</span>
                                        </div>
                                        <span className="font-mono text-sm text-neutral-600">98%</span>
                                    </div>

                                    {/* User Row - Animated */}
                                    <motion.div
                                        layout
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        className={`flex items-center justify-between p-4 rounded-xl border z-10 relative overflow-hidden ${rank <= 3 ? 'bg-[#ADFF44]/10 border-[#ADFF44]/50' : 'bg-neutral-800 border-white/10'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`font-bold text-xl w-8 ${rank <= 3 ? 'text-[#ADFF44]' : 'text-white'}`}>#{rank}</span>
                                            <div>
                                                <p className="font-bold text-white text-sm">YOU</p>
                                                <p className="text-xs text-neutral-400">Current Rank</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end relative z-10">
                                            <span className="font-bold text-white">94% Score</span>
                                            <span className="text-[10px] text-[#ADFF44]">Rising...</span>
                                        </div>
                                    </motion.div>

                                    {/* Context Applicant */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5 opacity-50">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-neutral-600 w-6">#{rank + 1}</span>
                                            <span className="text-neutral-500">David Kim</span>
                                        </div>
                                        <span className="font-mono text-sm text-neutral-600">89%</span>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4"
                                >
                                    <div className="flex gap-3">
                                        <TrendingUp className="w-5 h-5 text-blue-400 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-blue-400 text-sm">Action: Boost Your Rank</h4>
                                            <p className="text-blue-200/70 text-xs mt-1">Taking the "Advanced Python" module could increase your match score by 4%.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
