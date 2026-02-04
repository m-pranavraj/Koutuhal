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
}

const mockApplicants = [
    { name: "Alex Chen", score: 98, role: "Senior Dev" },
    { name: "Sarah Jones", score: 95, role: "Tech Lead" },
    { name: "Michael Ross", score: 92, role: "Full Stack" },
    // User will be inserted here
    { name: "David Kim", score: 89, role: "Frontend Dev" },
    { name: "Emily White", score: 85, role: "React Dev" },
];

export const ApplicationStatusDashboard = ({ open, onOpenChange, jobTitle, initialRank }: ApplicationStatusDashboardProps) => {
    const [rank, setRank] = useState(initialRank);

    useEffect(() => {
        if (open) {
            // Simulate live movement each time opened to make it feel "active"
            if (rank > 1) {
                const timeout = setTimeout(() => {
                    setRank(r => Math.max(1, r - 1));
                }, 1500);
                return () => clearTimeout(timeout);
            }
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl overflow-hidden p-0">

                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Live Application Status</h2>
                        <p className="text-slate-400 text-sm">Real-time candidate ranking for <span className="text-white">{jobTitle}</span></p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
                            </h3>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse font-medium">
                                ● Live
                            </span>
                        </div>

                        <div className="space-y-3 relative">
                            {/* Static Top Applicant */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm opacity-60">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-400 w-6">#1</span>
                                    <span className="text-slate-600">Alex Chen</span>
                                </div>
                                <span className="font-mono text-sm bg-slate-100 px-2 rounded">98%</span>
                            </div>

                            {/* User Row - Animated */}
                            <motion.div
                                layout
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-lg z-10 bg-white ${rank <= 3 ? 'border-yellow-400 bg-yellow-50/50' : 'border-purple-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold text-lg w-6 ${rank <= 3 ? 'text-yellow-600' : 'text-purple-600'}`}>#{rank}</span>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">YOU</p>
                                        <p className="text-xs text-slate-500">Current Rank</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-green-600">94% Score</span>
                                    <span className="text-[10px] text-slate-400">Updated 1m ago</span>
                                </div>
                            </motion.div>

                            {/* Context Applicant */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm opacity-60">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-400 w-6">#{rank + 1}</span>
                                    <span className="text-slate-600">David Kim</span>
                                </div>
                                <span className="font-mono text-sm bg-slate-100 px-2 rounded">89%</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4"
                        >
                            <div className="flex gap-3">
                                <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Status: In Review</h4>
                                    <p className="text-blue-700 text-xs mt-1">Recruiter is currently viewing the top 5 candidates. You are in the consideration set.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
