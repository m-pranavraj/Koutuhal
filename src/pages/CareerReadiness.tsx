import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    Target,
    Search,
    Briefcase,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Plus,
    X,
    Loader2,
    TrendingUp,
    Brain,
    ShieldCheck,
    Star,
    Wand2,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ResumeTailorPanel from "@/components/jobs/ResumeTailorPanel";
import { Job } from "@/types";

// --- Types ---
interface RoleItem {
    role: string;
    job_description: string;
}

interface AnalysisResult {
    is_resume: boolean;
    not_resume_reason: string | null;
    ats_score: {
        overall: number;
        formatting: number;
        keyword_optimization?: number;
        structure?: number;
        quantification?: number;
        readability?: number;
        completeness?: number;
        tips: string[];
    };
    role_matches: Array<{
        role: string;
        match_percentage: number;
        verdict: string;
        why_good: string;
        why_not_good: string;
    }>;
    best_for: {
        role: string;
        match_percentage: number;
        reasoning: string;
    };
    strengths: string[];
    gaps: string[];
    recommendations: Array<{
        role: string;
        score: number;
        reason: string;
    }>;
    summary: string;
}

const CareerReadiness = () => {
    const [stage, setStage] = useState<"upload" | "results">("upload");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        resumeFile: null as File | null,
    });

    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [newRole, setNewRole] = useState("");
    const [newJD, setNewJD] = useState("");

    // Result State
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsRequested, setJobsRequested] = useState(false);
    const [isTailorOpen, setIsTailorOpen] = useState(false);
    const [tailorJobIdx, setTailorJobIdx] = useState(0);

    // --- Handlers ---
    const addRoleItem = () => {
        if (newRole.trim()) {
            setRoles([...roles, { role: newRole.trim(), job_description: newJD.trim() }]);
            setNewRole("");
            setNewJD("");
        }
    };

    const removeRoleItem = (index: number) => {
        setRoles(roles.filter((_, i) => i !== index));
    };
    const fetchRecommendedJobs = async (roleQuery: string) => {
        if (!roleQuery) return;
        setJobsLoading(true);
        setJobsRequested(true);
        try {
            const res = await fetch(`/api/v1/career/jobs?role=${encodeURIComponent(roleQuery)}&location=Remote&num_pages=5`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            } else {
                console.error("Job fetch failed:", res.status);
            }
        } catch (err) {
            console.error("Job fetch failed", err);
        } finally {
            setJobsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalRoles = [...roles];
        if (newRole.trim()) {
            finalRoles.push({ role: newRole.trim(), job_description: newJD.trim() });
            setRoles(finalRoles);
            setNewRole("");
            setNewJD("");
        }

        if (finalRoles.length === 0) {
            toast.error("Please add at least one target role.");
            return;
        }

        if (!formData.name || !formData.email || !formData.resumeFile) {
            toast.error("Please fill in all required fields and upload your resume.");
            return;
        }

        setLoading(true);
        setStatus("Parsing your resume...");

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("name", formData.name);
            uploadFormData.append("email", formData.email);
            uploadFormData.append("phone", formData.phone);
            uploadFormData.append("role", finalRoles[0]?.role || "General");
            uploadFormData.append("resume", formData.resumeFile);
            if (finalRoles[0]?.job_description) {
                uploadFormData.append("job_description", finalRoles[0].job_description);
            }

            // 1. Upload & Parse
            const uploadRes = await fetch("/api/v1/career/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (!uploadRes.ok) throw new Error("Failed to upload resume");
            const uploadData = await uploadRes.json();

            // 2. Analyze
            setStatus("AI is analyzing your profile...");
            const analyzeRes = await fetch("/api/v1/career/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: uploadData.user_id,
                    resume_id: uploadData.resume_id,
                    resume_text: uploadData.resume_text,
                    roles: finalRoles,
                }),
            });

            if (!analyzeRes.ok) throw new Error("AI analysis failed");
            const analysisData = await analyzeRes.json();

            // 3. Fake resume guard
            if (analysisData.is_resume === false) {
                const reason = analysisData.not_resume_reason || "That doesn't look like a resume.";
                toast.error(`Oops! ${reason} Please re-upload a proper resume file.`, { duration: 6000 });
                return;
            }

            setResumeText(uploadData.resume_text || "");
            setAnalysis(analysisData);
            setStage("results");
            // Jobs are now fetched ON-DEMAND — not auto-loaded here

        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white career-readiness-page selection:bg-[#ADFF44] selection:text-black">

            <main className="max-w-7xl mx-auto px-4 py-32">
                <AnimatePresence mode="wait">
                    {stage === "upload" ? (
                        <motion.div
                            key="upload-stage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Hero Header */}
                            <div className="text-center space-y-4 max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold uppercase tracking-widest mb-4"
                                >
                                    <Brain size={14} />
                                    AI-Powered Readiness Check
                                </motion.div>
                                <h1 className="text-5xl md:text-7xl font-bold font-sora tracking-tight leading-none text-white overflow-hidden">
                                    Is Your Career <br />
                                    <span className="text-[#ADFF44]">Market Ready?</span>
                                </h1>
                                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-6">
                                    Upload your resume and get a professional ATS score, gap analysis, and personalized career recommendations in seconds.
                                </p>
                            </div>

                            {/* Main Interaction Area */}
                            <div className="grid lg:grid-cols-2 gap-12 items-start mt-16">
                                {/* Left: Value Props */}
                                <div className="space-y-8 py-4">
                                    <div className="grid gap-6">
                                        {[
                                            { icon: ShieldCheck, title: "ATS Optimization", desc: "Get scored by the same algorithms used by top corporate recruiters." },
                                            { icon: Target, title: "Role Alignment", desc: "See exactly how well your skills match your dream job descriptions." },
                                            { icon: TrendingUp, title: "Gap Discovery", desc: "Uncover missing skills and certifications needed to bridge the gap." }
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 + (i * 0.1) }}
                                                className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center shrink-0 border border-[#ADFF44]/20 group-hover:scale-110 transition-transform">
                                                    <item.icon className="text-[#ADFF44]" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="p-8 rounded-3xl premium-shell relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF44]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#ADFF44]/20 transition-all duration-500" />
                                        <div className="relative space-y-4">
                                            <div className="flex items-center gap-2 text-[#ADFF44]">
                                                <Star size={18} fill="currentColor" />
                                                <span className="text-sm font-bold tracking-widest uppercase">Premium Feature</span>
                                            </div>
                                            <h4 className="text-2xl font-bold leading-tight">Comprehensive AI Career Roadmaps</h4>
                                            <p className="text-gray-400 text-sm">Our AI doesn't just score you—it builds a step-by-step roadmap to your goal role based on current market trends.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Upload Form */}
                                <div className="form-panel p-8 md:p-10 relative overflow-hidden">
                                    <form onSubmit={handleUpload} className="space-y-8 relative z-10">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                                <Input
                                                    placeholder="John Doe"
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Target Roles & Optional JD</label>
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="e.g. Senior Frontend Developer"
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                        value={newRole}
                                                        onChange={(e) => setNewRole(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoleItem())}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={addRoleItem}
                                                        className="h-12 w-12 rounded-xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black shrink-0"
                                                    >
                                                        <Plus size={20} />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    placeholder="Paste Job Description (Optional) - This helps AI give a more accurate match."
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] min-h-[100px] rounded-xl text-sm"
                                                    value={newJD}
                                                    onChange={(e) => setNewJD(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {roles.map((role, idx) => (
                                                    <div key={idx} className="role-chip px-4 py-2 rounded-xl text-xs font-bold flex flex-col gap-1 border border-[#ADFF44]/30 animate-in fade-in zoom-in duration-300 max-w-full">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate">{role.role}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRoleItem(idx)}
                                                                className="hover:text-white transition-colors shrink-0"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        {role.job_description && (
                                                            <span className="text-[10px] text-gray-400 font-medium line-clamp-1 border-t border-[#ADFF44]/10 pt-1">
                                                                JD attached
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload Resume (PDF)</label>
                                            <div
                                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group hover:border-[#ADFF44]/50 hover:bg-[#ADFF44]/5
                        ${formData.resumeFile ? 'border-[#ADFF44]/50 bg-[#ADFF44]/5' : 'border-white/10 bg-black/40'}`}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    id="resume-upload"
                                                    onChange={(e) => e.target.files && setFormData({ ...formData, resumeFile: e.target.files[0] })}
                                                />
                                                <label htmlFor="resume-upload" className="cursor-pointer space-y-4 block">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:border-[#ADFF44]/40 transition-colors">
                                                        <Upload className={`${formData.resumeFile ? 'text-[#ADFF44]' : 'text-gray-500'} group-hover:text-[#ADFF44] transition-colors`} size={28} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-lg">
                                                            {formData.resumeFile ? formData.resumeFile.name : "Click to upload resume"}
                                                        </p>
                                                        <p className="text-gray-500 text-sm italic">Maximum size 5MB • PDF Only</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <Button
                                            disabled={loading}
                                            type="submit"
                                            className="w-full h-14 rounded-2xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold text-lg shadow-2xl shadow-[#ADFF44]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>{status}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>Proceed for Detailed Analysis</span>
                                                    <ChevronRight size={20} />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results-stage"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-10 pb-20"
                        >
                            {/* Results Topbar */}
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#ADFF44] font-bold text-sm uppercase tracking-widest mb-1">
                                        <CheckCircle2 size={16} /> Results Ready
                                    </div>
                                    <h2 className="text-4xl font-bold font-sora">Intelligence Report</h2>
                                    <p className="text-gray-400">Analysis for {formData.name} • {new Date().toLocaleDateString()}</p>
                                </div>
                                <Button
                                    onClick={() => setStage("upload")}
                                    variant="outline"
                                    className="rounded-xl border-white/10 hover:bg-white/5 h-12"
                                >
                                    <X className="mr-2" size={18} /> New Analysis
                                </Button>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Score & ATS Details */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-6">
                                        <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Overall ATS Score</h3>
                                        <div className="relative">
                                            <svg className="w-48 h-48 transform -rotate-90">
                                                <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                                <circle
                                                    className="text-[#ADFF44] transition-all duration-1000 ease-out"
                                                    strokeWidth="8"
                                                    strokeDasharray={2 * Math.PI * 88}
                                                    strokeDashoffset={2 * Math.PI * 88 * (1 - (analysis?.ats_score.overall || 0) / 100)}
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r="88" cx="96" cy="96"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
                                                <span className="text-6xl font-bold font-sora score-text">{analysis?.ats_score.overall}</span>
                                                <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">Market Readiness</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 w-full">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                <span>Formatting</span>
                                                <span className="text-[#ADFF44]">{analysis?.ats_score.formatting}/100</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#ADFF44]" style={{ width: `${analysis?.ats_score.formatting}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tips Card */}
                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <AlertCircle className="text-[#ADFF44]" size={20} />
                                            Improvement Tips
                                        </h3>
                                        <ul className="space-y-4">
                                            {analysis?.ats_score.tips.map((tip, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF44]/40 mt-1.5 shrink-0 group-hover:bg-[#ADFF44] transition-colors" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Role Matches & Analysis */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Best Fit Block */}
                                        <div className="md:col-span-2 p-8 rounded-3xl bg-[#ADFF44]/5 border border-[#ADFF44]/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 text-[#ADFF44]/20">
                                                <Star size={80} fill="currentColor" stroke="none" />
                                            </div>
                                            <div className="relative space-y-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ADFF44] text-black text-[10px] font-black uppercase tracking-widest">
                                                    Recommended Fit
                                                </div>
                                                <h3 className="text-3xl font-bold font-sora">
                                                    {analysis?.best_for.role}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-4xl font-black text-[#ADFF44]">{analysis?.best_for.match_percentage}%</span>
                                                    <span className="text-gray-400 text-sm font-medium">Alignment Score</span>
                                                </div>
                                                <p className="text-gray-300 leading-relaxed text-sm max-w-xl italic">"{analysis?.best_for.reasoning}"</p>
                                            </div>
                                        </div>

                                        {/* Role Match Tabs/Full List */}
                                        <div className="md:col-span-2 space-y-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Per-Role Breakdown</h4>
                                            {analysis?.role_matches?.map((match, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 grid md:grid-cols-4 gap-6 items-center">
                                                    <div className="md:col-span-1 border-r border-white/5 pr-4">
                                                        <h5 className="font-bold text-white mb-1">{match.role}</h5>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#ADFF44]" style={{ width: `${match.match_percentage}%` }} />
                                                            </div>
                                                            <span className="text-sm font-bold text-[#ADFF44]">{match.match_percentage}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-3 grid md:grid-cols-2 gap-6 relative">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-black text-[#ADFF44] uppercase tracking-wider">Strengths</span>
                                                            <p className="text-xs text-gray-400 leading-relaxed bg-[#ADFF44]/5 p-3 rounded-lg border border-[#ADFF44]/10">{match.why_good}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Identified Gaps</span>
                                                            <p className="text-xs text-gray-400 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">{match.why_not_good}</p>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                setTailorJobIdx(i);
                                                                setIsTailorOpen(true);
                                                            }}
                                                            className="absolute -right-2 -bottom-2 px-3 py-1.5 rounded-lg bg-[#ADFF44] text-black text-[10px] font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-lg flex items-center gap-1.5"
                                                        >
                                                            <Wand2 size={10} /> Tailor This Role
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                            <h3 className="font-bold text-lg border-l-4 border-[#ADFF44] pl-4">Core Strengths</h3>
                                            <div className="space-y-4">
                                                {analysis?.strengths?.map((s, i) => (
                                                    <div key={i} className="flex gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#ADFF44]/20 transition-colors">
                                                        <div className="text-[#ADFF44] mt-0.5"><CheckCircle2 size={16} /></div>
                                                        <span className="text-gray-300">{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                            <h3 className="font-bold text-lg border-l-4 border-red-500 pl-4">Critical Gaps</h3>
                                            <div className="space-y-4">
                                                {analysis?.gaps?.map((g, i) => (
                                                    <div key={i} className="flex gap-3 text-sm bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-500/20 transition-colors">
                                                        <div className="text-red-500 mt-0.5"><AlertCircle size={16} /></div>
                                                        <span className="text-gray-300">{g}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Block */}
                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#ADFF44] mb-4">Executive Summary</h3>
                                        <p className="text-gray-400 text-lg italic leading-relaxed font-medium">"{analysis?.summary}"</p>
                                    </div>



                                    {/* ─── Bottom Intelligence Section ──────────────────────────── */}
                                    <div className="space-y-16 mt-16 border-t border-white/10 pt-16">

                                        {/* Transparency Grid — full width */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                    <Search size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold font-sora">Transparency Grid</h3>
                                                    <p className="text-gray-500 text-sm">Review exactly what our AI analyzed side-by-side.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* JD Card */}
                                                <Card className="bg-white/5 border-white/10 ring-1 ring-white/5">
                                                    <CardHeader className="pb-3 border-b border-white/5 bg-[#ADFF44]/5">
                                                        <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Job Description</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4">
                                                        <div className="max-h-[250px] overflow-y-auto text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap">
                                                            {roles[0]?.job_description || "No specific JD provided. Analysis based on general market standards for this role."}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                {/* Resume Text Card */}
                                                <Card className="bg-white/5 border-white/10 ring-1 ring-white/5">
                                                    <CardHeader className="pb-3 border-b border-white/5 bg-[#ADFF44]/5">
                                                        <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Extracted Resume Text</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4">
                                                        <div className="max-h-[250px] overflow-y-auto text-xs text-gray-500 leading-relaxed font-mono">
                                                            {resumeText || "Resume text extraction in progress..."}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Market Jobs — full width below */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold font-sora">Market Jobs</h3>
                                                        <p className="text-gray-500 text-sm">Live listings from LinkedIn, Indeed & more</p>
                                                    </div>
                                                </div>
                                                {jobsRequested && !jobsLoading && jobs.length > 0 && (
                                                    <span className="text-xs text-gray-500 font-medium">{jobs.length} listings found</span>
                                                )}
                                            </div>

                                            {!jobsRequested ? (
                                                <div className="p-10 flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 bg-white/3">
                                                    <Briefcase className="text-[#ADFF44]/50" size={32} />
                                                    <div className="text-center">
                                                        <p className="text-white font-bold text-base">Find Jobs for Your Profile</p>
                                                        <p className="text-gray-500 text-sm mt-1">Get live listings from LinkedIn, Indeed & Glassdoor matched to your best role</p>
                                                    </div>
                                                    <button
                                                        onClick={() => fetchRecommendedJobs(analysis?.best_for?.role || roles[0]?.role || '')}
                                                        className="px-8 py-3 rounded-xl bg-[#ADFF44] text-black font-black text-sm hover:bg-[#9BE63D] transition-all hover:scale-105 shadow-lg shadow-[#ADFF44]/20 flex items-center gap-2"
                                                    >
                                                        <Search size={15} /> Explore Live Jobs
                                                    </button>
                                                </div>
                                            ) : jobsLoading ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
                                                </div>
                                            ) : jobs.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {jobs.map((job, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 16 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                                                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 hover:bg-[#ADFF44]/5 transition-all group flex flex-col gap-3"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                                                                    {job.logo ? (
                                                                        <img src={job.logo} alt={job.company} className="w-8 h-8 rounded-lg object-contain bg-white/10 flex-shrink-0 p-0.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                                            <Briefcase size={13} className="text-[#ADFF44]/60" />
                                                                        </div>
                                                                    )}
                                                                    <div className="overflow-hidden">
                                                                        <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#ADFF44] transition-colors">{job.title}</h4>
                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase truncate mt-0.5">{job.company}</p>
                                                                    </div>
                                                                </div>
                                                                <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#ADFF44]/20 text-gray-500 group-hover:text-[#ADFF44] transition-all flex-shrink-0 ml-2">
                                                                    <ArrowRight size={13} />
                                                                </a>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 uppercase font-bold tracking-wider">{job.location}</span>
                                                                {job.employment_type && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/15 text-[#ADFF44] uppercase font-bold tracking-wider">{job.employment_type.replace(/_/g, ' ')}</span>}
                                                                {job.source && <span className="text-[9px] text-gray-600 font-medium ml-auto">via {job.source}</span>}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 text-gray-500 text-sm italic">
                                                    No listings found. Try a different role.
                                                </div>
                                            )}
                                        </div>

                                    </div> {/* closes space-y-16 */}

                                </div> {/* This closes the div containing the entire content of the page */}
                            </div> {/* This closes the div with className="container max-w-7xl mx-auto py-12 px-4" */}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Resume Tailor Panel */}
            <ResumeTailorPanel
                open={isTailorOpen}
                onClose={() => setIsTailorOpen(false)}
                sharedResume={formData.resumeFile}
                onResumeShared={(f) => setFormData({ ...formData, resumeFile: f })}
                job={{
                    id: 'temp-' + Date.now(),
                    title: analysis?.role_matches?.[tailorJobIdx]?.role || roles[tailorJobIdx]?.role || 'Target Role',
                    company: 'Career Check Match',
                    description: roles[tailorJobIdx]?.job_description || '',
                    location: 'Remote',
                    type: 'Full-time',
                    mode: 'Remote',
                    experience: 'Intermediate',
                    salary: 'Competitive',
                    skills: analysis?.role_matches?.[tailorJobIdx]?.why_good ? [analysis.role_matches[tailorJobIdx].why_good] : analysis?.strengths || [],
                    category: 'Engineering',
                    postedDays: 0
                } as Job}
            />
        </div >
    );
};

export default CareerReadiness;
