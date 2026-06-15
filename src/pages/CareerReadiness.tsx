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
    ArrowRight,
    Copy,
    Download,
    RefreshCw,
    Linkedin,
    Sparkles,
    GraduationCap,
    Award,
    Check,
    BookOpen
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
    missing_skills?: Array<{ name: string; type: string }>;
    bullet_rewrites?: Array<{ original: string; rewritten: string }>;
}

const CareerReadiness = () => {
    const [stage, setStage] = useState<"upload" | "results">("upload");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Mode State
    const [mode, setMode] = useState<"resume" | "linkedin">("resume");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        resumeFile: null as File | null,
    });
    const [linkedinFile, setLinkedinFile] = useState<File | null>(null);

    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [newRole, setNewRole] = useState("");
    const [newJD, setNewJD] = useState("");

    // Result State
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [linkedinAnalysis, setLinkedinAnalysis] = useState<any | null>(null);
    const [resumeText, setResumeText] = useState("");
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsRequested, setJobsRequested] = useState(false);
    const [isTailorOpen, setIsTailorOpen] = useState(false);
    const [tailorJobIdx, setTailorJobIdx] = useState(0);

    // Active Results Tab
    const [activeTab, setActiveTab] = useState<string>("ats");

    // Interactive Skills Gap Adder
    const [addedSkills, setAddedSkills] = useState<string[]>([]);

    // Cover Letter State
    const [coverLetter, setCoverLetter] = useState<string>("");
    const [coverLetterTips, setCoverLetterTips] = useState<string[]>([]);
    const [coverLetterLoading, setCoverLetterLoading] = useState<boolean>(false);

    // Bullet Rewriter State
    const [customBullet, setCustomBullet] = useState<string>("");
    const [rewrittenBullet, setRewrittenBullet] = useState<string>("");
    const [rewritingBullet, setRewritingBullet] = useState<boolean>(false);

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
            const res = await fetch(`/api/v1/career/jobs?role=${encodeURIComponent(roleQuery)}&location=Remote&num_pages=1`);
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

        if (mode === "linkedin") {
            if (!formData.name || !formData.email || !linkedinFile) {
                toast.error("Please fill in your name, email, and upload your LinkedIn PDF profile.");
                return;
            }

            setLoading(true);
            setStatus("AI is auditing your LinkedIn profile...");

            try {
                const uploadFormData = new FormData();
                uploadFormData.append("name", formData.name);
                uploadFormData.append("email", formData.email);
                if (roles.length > 0) {
                    uploadFormData.append("role", roles[0].role);
                }
                uploadFormData.append("linkedin_profile", linkedinFile);

                const res = await fetch("/api/v1/career/analyze-linkedin", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || "Failed to analyze LinkedIn profile");
                }

                const data = await res.json();
                setLinkedinAnalysis(data);
                setStage("results");
                setActiveTab("linkedin");
                toast.success("LinkedIn profile audit complete!");
            } catch (err: any) {
                toast.error(err.message || "An unexpected error occurred during LinkedIn analysis.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Resume flow
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
            setAddedSkills([]);
            setStage("results");
            setActiveTab("ats");
            toast.success("Resume analysis complete!");
            

        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!resumeText) {
            toast.error("Please upload a resume first.");
            return;
        }

        const primaryJD = roles[0]?.job_description || "";
        if (!primaryJD.trim()) {
            toast.error("A Job Description (JD) is required to generate a tailored cover letter.");
            return;
        }

        setCoverLetterLoading(true);
        try {
            const res = await fetch("/api/v1/career/generate-cover-letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: primaryJD,
                    role_name: roles[0]?.role || "Target Role",
                }),
            });

            if (!res.ok) throw new Error("Failed to generate cover letter");
            const data = await res.json();
            setCoverLetter(data.cover_letter);
            setCoverLetterTips(data.tips || []);
            toast.success("Cover letter generated successfully!");
        } catch (err: any) {
            toast.error(err.message || "Could not generate cover letter.");
        } finally {
            setCoverLetterLoading(false);
        }
    };

    const handleRewriteBullet = async () => {
        if (!customBullet.trim()) {
            toast.error("Please enter a bullet point to rewrite.");
            return;
        }

        setRewritingBullet(true);
        try {
            const res = await fetch("/api/v1/career/rewrite-bullet-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bullet: customBullet,
                    job_description: roles[0]?.job_description || "",
                }),
            });

            if (!res.ok) throw new Error("Failed to rewrite bullet");
            const data = await res.json();
            setRewrittenBullet(data.rewritten);
            toast.success("Bullet point rewritten successfully!");
        } catch (err: any) {
            toast.error(err.message || "Could not rewrite bullet point.");
        } finally {
            setRewritingBullet(false);
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
                                    <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                                        {/* Mode Switcher Toggle */}
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setMode("resume")}
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "resume" ? "bg-[#ADFF44] text-black" : "text-gray-400 hover:text-white"}`}
                                            >
                                                Resume Optimizer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode("linkedin")}
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "linkedin" ? "bg-[#ADFF44] text-black" : "text-gray-400 hover:text-white"}`}
                                            >
                                                LinkedIn Auditor
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                                <Input
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
                                                    className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                                {mode === "resume" ? "Target Roles & Optional JD" : "Target Roles or Industry (Optional)"}
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] h-12 rounded-xl"
                                                        placeholder={mode === "resume" ? "e.g., Software Engineer" : "e.g., Marketing Manager"}
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
                                                {mode === "resume" && (
                                                    <Textarea
                                                        placeholder="Paste the Job Description (JD) here..."
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] min-h-[100px] rounded-xl text-sm"
                                                        value={newJD}
                                                        onChange={(e) => setNewJD(e.target.value)}
                                                    />
                                                )}
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
                                                        {role.job_description && mode === "resume" && (
                                                            <span className="text-[10px] text-gray-400 font-medium line-clamp-1 border-t border-[#ADFF44]/10 pt-1">
                                                                JD attached
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {mode === "resume" ? (
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
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Upload LinkedIn Profile (PDF)</label>
                                                <div
                                                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group hover:border-[#ADFF44]/50 hover:bg-[#ADFF44]/5
                            ${linkedinFile ? 'border-[#ADFF44]/50 bg-[#ADFF44]/5' : 'border-white/10 bg-black/40'}`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        id="linkedin-upload"
                                                        onChange={(e) => e.target.files && setLinkedinFile(e.target.files[0])}
                                                    />
                                                    <label htmlFor="linkedin-upload" className="cursor-pointer space-y-4 block">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:border-[#ADFF44]/40 transition-colors">
                                                            <Upload className={`${linkedinFile ? 'text-[#ADFF44]' : 'text-gray-500'} group-hover:text-[#ADFF44] transition-colors`} size={28} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-lg">
                                                                {linkedinFile ? linkedinFile.name : "Click to upload LinkedIn PDF"}
                                                            </p>
                                                            <p className="text-gray-500 text-sm italic">Maximum size 5MB • PDF Only</p>
                                                        </div>
                                                    </label>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-2 ml-1 leading-relaxed">
                                                    How to get this? Go to your LinkedIn Profile page → click the <strong className="text-white">More</strong> button → select <strong className="text-white">"Save to PDF"</strong>.
                                                </p>
                                            </div>
                                        )}

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
                                                    <ChevronRight size={20} className="text-black" />
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
                                                      {/* Tab Switcher */}
                            {linkedinAnalysis ? (
                                <div className="flex border-b border-white/10 gap-8 mb-8 overflow-x-auto scrollbar-none">
                                    <button
                                        onClick={() => setActiveTab("linkedin")}
                                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "linkedin" ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                    >
                                        <Linkedin size={16} /> LinkedIn Optimizer
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab("jobs");
                                            if (!jobsRequested) {
                                                fetchRecommendedJobs(roles[0]?.role || "General Professional");
                                            }
                                        }}
                                        className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === "jobs" ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                    >
                                        <Briefcase size={16} /> Job Openings
                                    </button>
                                </div>
                            ) : (
                                <div className="flex border-b border-white/10 gap-8 mb-8 overflow-x-auto scrollbar-none">
                                    {[
                                        { id: "ats", label: "ATS Score & Review", icon: ShieldCheck },
                                        { id: "skills", label: "Skills Gap & Jobs", icon: Target },
                                        { id: "cover", label: "Cover Letter", icon: FileText },
                                        { id: "rewriter", label: "Bullet Rewriter", icon: Sparkles }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setActiveTab(t.id);
                                                if (t.id === "skills" && !jobsRequested) {
                                                    fetchRecommendedJobs(analysis?.best_for?.role || roles[0]?.role || "");
                                                }
                                            }}
                                            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.id ? "border-[#ADFF44] text-[#ADFF44]" : "border-transparent text-gray-400 hover:text-white"}`}
                                        >
                                            <t.icon size={16} /> {t.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tab Contents */}
                            <div>
                                {/* LINKEDIN MODE AUDIT RESULTS */}
                                {linkedinAnalysis && activeTab === "linkedin" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-3 gap-8">
                                            {/* Score circle & audit summary */}
                                            <div className="lg:col-span-1 space-y-6">
                                                <Card className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-6">
                                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Overall LinkedIn Score</h3>
                                                    <div className="relative">
                                                        <svg className="w-48 h-48 transform -rotate-90">
                                                            <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="88" cx="96" cy="96" />
                                                            <circle
                                                                className="text-[#ADFF44] transition-all duration-1000 ease-out"
                                                                strokeWidth="8"
                                                                strokeDasharray={2 * Math.PI * 88}
                                                                strokeDashoffset={2 * Math.PI * 88 * (1 - (linkedinAnalysis.overall_score || 0) / 100)}
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                r="88" cx="96" cy="96"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-6xl font-bold font-sora score-text">{linkedinAnalysis.overall_score}</span>
                                                            <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">Profile Strength</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full space-y-2 border-t border-white/5 pt-4">
                                                        <p className="text-xs text-gray-400 font-medium">Scores weighted out of 100 total points based on section impacts.</p>
                                                    </div>
                                                </Card>

                                                <Card className="p-8 rounded-3xl bg-[#ADFF44]/5 border border-[#ADFF44]/15">
                                                    <h4 className="text-xs font-bold text-[#ADFF44] uppercase tracking-wider mb-2">Audit Verdict</h4>
                                                    <p className="text-sm text-gray-300 leading-relaxed italic">"{linkedinAnalysis.summary}"</p>
                                                </Card>
                                            </div>

                                            {/* Section-by-section audit */}
                                            <div className="lg:col-span-2 space-y-8">
                                                {Object.entries(linkedinAnalysis.sections || {}).map(([secKey, secValue]: [string, any]) => {
                                                    const icons: Record<string, any> = {
                                                        headline: Sparkles,
                                                        about: UserCheck,
                                                        experience: Briefcase,
                                                        skills: Award,
                                                        education: GraduationCap
                                                    };
                                                    const SecIcon = icons[secKey] || Star;
                                                    
                                                    return (
                                                        <Card key={secKey} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] flex items-center justify-center shrink-0">
                                                                        <SecIcon size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-lg capitalize">{secKey} Audit</h4>
                                                                        <p className="text-gray-500 text-xs">Optimization analysis</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-gray-400 uppercase">Weightage:</span>
                                                                    <span className="text-lg font-black text-[#ADFF44]">{secValue.score} <span className="text-xs text-gray-500">/ {secValue.max_points}</span></span>
                                                                </div>
                                                            </div>

                                                            {/* Suggestions List */}
                                                            <div className="space-y-2">
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Improvement Suggestions:</h5>
                                                                <ul className="grid gap-2">
                                                                    {secValue.suggestions?.map((sug: string, idx: number) => (
                                                                        <li key={idx} className="flex gap-2 text-xs text-gray-300 leading-relaxed bg-white/3 p-2.5 rounded-lg border border-white/5">
                                                                            <div className="h-4 w-4 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold shrink-0 text-[10px] mt-0.5">!</div>
                                                                            <span>{sug}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Side-by-side comparison */}
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Current Text</span>
                                                                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 min-h-[120px] text-xs text-gray-400 whitespace-pre-wrap leading-relaxed select-text font-sans">
                                                                        {secValue.current || <span className="italic">No text found or section empty in profile.</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5 relative group">
                                                                    <span className="text-[10px] font-black text-[#ADFF44] uppercase tracking-wider flex items-center gap-1">
                                                                        <Sparkles size={10} /> Optimized AI Draft
                                                                    </span>
                                                                    <div className="bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl p-4 min-h-[120px] text-xs text-gray-200 whitespace-pre-wrap leading-relaxed relative select-text font-sans">
                                                                        {secValue.optimized_draft}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(secValue.optimized_draft);
                                                                                toast.success("Optimized draft copied to clipboard!");
                                                                            }}
                                                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-[#ADFF44] transition-colors"
                                                                            title="Copy Optimized Draft"
                                                                        >
                                                                            <Copy size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: ATS SCORE & REVIEW TAB */}
                                {analysis && activeTab === "ats" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-3 gap-8">
                                            {/* Score circular block */}
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
                                                                strokeDashoffset={2 * Math.PI * 88 * (1 - (Math.min(100, analysis.ats_score.overall + (addedSkills.length * 3)) || 0) / 100)}
                                                                strokeLinecap="round"
                                                                stroke="currentColor"
                                                                fill="transparent"
                                                                r="88" cx="96" cy="96"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
                                                            <span className="text-6xl font-bold font-sora score-text">
                                                                {Math.min(100, analysis.ats_score.overall + (addedSkills.length * 3))}
                                                            </span>
                                                            <span className="text-xs uppercase font-bold text-gray-500 tracking-tighter">Market Readiness</span>
                                                            {addedSkills.length > 0 && (
                                                                <span className="text-[10px] text-[#ADFF44] font-bold mt-1 bg-[#ADFF44]/10 px-2.5 py-0.5 rounded-full animate-bounce">
                                                                    +{addedSkills.length * 3} points optimized
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 w-full">
                                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                            <span>Formatting</span>
                                                            <span className="text-[#ADFF44]">{analysis.ats_score.formatting}/100</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#ADFF44]" style={{ width: `${analysis.ats_score.formatting}%` }} />
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
                                                        {analysis.ats_score.tips.map((tip, i) => (
                                                            <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed group">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF44]/40 mt-1.5 shrink-0 group-hover:bg-[#ADFF44] transition-colors" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Strengths, Gaps, Summary, and Transparency */}
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                                        <h3 className="font-bold text-lg border-l-4 border-[#ADFF44] pl-4">Core Strengths</h3>
                                                        <div className="space-y-4">
                                                            {analysis.strengths?.map((s, i) => (
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
                                                            {analysis.gaps?.map((g, i) => (
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
                                                    <p className="text-gray-400 text-lg italic leading-relaxed font-medium">"{analysis.summary}"</p>
                                                </div>

                                                {/* Transparency Grid */}
                                                <div className="space-y-4 border-t border-white/10 pt-8 mt-8">
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
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: SKILLS GAP & JOB EXPLORATION TAB */}
                                {analysis && activeTab === "skills" && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                                            {/* Left Column: Recommendations & Best Fit */}
                                            <div className="lg:col-span-1 space-y-6">
                                                {/* Best Fit Block */}
                                                <div className="p-8 rounded-3xl bg-[#ADFF44]/5 border border-[#ADFF44]/20 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 text-[#ADFF44]/20">
                                                        <Star size={80} fill="currentColor" stroke="none" />
                                                    </div>
                                                    <div className="relative space-y-4">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ADFF44] text-black text-[10px] font-black uppercase tracking-widest">
                                                            Recommended Fit
                                                        </div>
                                                        <h3 className="text-2xl font-bold font-sora">
                                                            {analysis.best_for.role}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-3xl font-black text-[#ADFF44]">
                                                                {Math.min(100, analysis.best_for.match_percentage + (addedSkills.length * 4))}%
                                                            </span>
                                                            <span className="text-gray-400 text-xs font-medium">Alignment Score</span>
                                                        </div>
                                                        <p className="text-gray-300 leading-relaxed text-xs italic">"{analysis.best_for.reasoning}"</p>
                                                    </div>
                                                </div>

                                                {/* Per-Role list */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Per-Role Breakdown</h4>
                                                    {analysis.role_matches?.map((match, i) => {
                                                        const matchPercentage = Math.min(100, match.match_percentage + (addedSkills.length * 4));
                                                        return (
                                                            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group">
                                                                <div className="flex justify-between items-start">
                                                                    <h5 className="font-bold text-white text-sm">{match.role}</h5>
                                                                    <span className="text-xs font-bold text-[#ADFF44] bg-[#ADFF44]/10 px-2 py-0.5 rounded-full">{matchPercentage}%</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#ADFF44]" style={{ width: `${matchPercentage}%` }} />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] leading-relaxed">
                                                                    <p className="text-gray-400 bg-[#ADFF44]/5 p-2 rounded-lg border border-[#ADFF44]/10"><strong className="text-[#ADFF44] uppercase tracking-wide block text-[9px] mb-0.5">Strengths</strong>{match.why_good}</p>
                                                                    <p className="text-gray-400 bg-red-500/5 p-2 rounded-lg border border-red-500/10"><strong className="text-red-400 uppercase tracking-wide block text-[9px] mb-0.5">Gaps</strong>{match.why_not_good}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setTailorJobIdx(i);
                                                                        setIsTailorOpen(true);
                                                                    }}
                                                                    className="w-full mt-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#ADFF44] hover:text-black transition-all flex items-center justify-center gap-1.5"
                                                                >
                                                                    <Wand2 size={10} /> Tailor Resume
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Right Column: Skills Gap Adder & Jobs */}
                                            <div className="lg:col-span-2 space-y-8">
                                                {/* SKILLS GAP ADDER */}
                                                <Card className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                                                    <div>
                                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                                            <Target className="text-[#ADFF44]" size={20} />
                                                            Required Skills & Gaps
                                                        </h3>
                                                        <p className="text-gray-400 text-xs mt-1">Directly add missing skills required by the JD to optimize your career profile score.</p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Missing Required Skills</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                                                                analysis.missing_skills
                                                                    .filter(sk => !addedSkills.includes(sk.name))
                                                                    .map((sk, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#ADFF44]/30 transition-all"
                                                                        >
                                                                            <span className="text-xs font-medium text-gray-300">{sk.name}</span>
                                                                            <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-bold uppercase tracking-wider">{sk.type}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setAddedSkills([...addedSkills, sk.name]);
                                                                                    toast.success(`Skill "${sk.name}" added to your profile!`);
                                                                                }}
                                                                                className="p-1 rounded bg-[#ADFF44]/10 hover:bg-[#ADFF44] text-[#ADFF44] hover:text-black transition-colors"
                                                                                title="Add Skill"
                                                                            >
                                                                                <Plus size={10} />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No missing skills detected! Your resume is highly optimized for this target role.</p>
                                                            )}
                                                        </div>

                                                        {addedSkills.length > 0 && (
                                                            <div className="pt-4 border-t border-white/5 space-y-2">
                                                                <h4 className="text-xs font-bold text-[#ADFF44] uppercase tracking-wider">Added Skills (Profile Optimization)</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {addedSkills.map((sk, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-white animate-in zoom-in duration-200"
                                                                        >
                                                                            <span className="text-xs font-semibold text-[#ADFF44]">{sk}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setAddedSkills(addedSkills.filter(s => s !== sk));
                                                                                    toast.info(`Removed "${sk}" from optimized skills.`);
                                                                                }}
                                                                                className="p-0.5 rounded-full hover:bg-white/10 text-[#ADFF44]"
                                                                            >
                                                                                <X size={12} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>

                                                {/* MARKET JOBS */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                                <Briefcase size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-bold font-sora">Market Jobs</h3>
                                                                <p className="text-gray-500 text-sm">Live listings matching your best fit role</p>
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
                                                                type="button"
                                                                onClick={() => fetchRecommendedJobs(analysis.best_for.role || roles[0]?.role || '')}
                                                                className="px-8 py-3 rounded-xl bg-[#ADFF44] text-black font-black text-sm hover:bg-[#9BE63D] transition-all hover:scale-105 shadow-lg shadow-[#ADFF44]/20 flex items-center gap-2"
                                                            >
                                                                <Search size={15} /> Explore Live Jobs
                                                            </button>
                                                        </div>
                                                    ) : jobsLoading ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
                                                        </div>
                                                    ) : jobs.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RESUME MODE: COVER LETTER TAB */}
                                {analysis && activeTab === "cover" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {coverLetter ? (
                                            <div className="space-y-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                    <div>
                                                        <h3 className="font-bold text-lg">AI Generated Cover Letter</h3>
                                                        <p className="text-gray-400 text-xs mt-0.5">Tailored specifically for {roles[0]?.role || "Target Role"} using your resume details.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(coverLetter);
                                                                toast.success("Cover letter copied to clipboard!");
                                                            }}
                                                            className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold h-10 px-4 rounded-xl flex items-center gap-1.5"
                                                        >
                                                            <Copy size={14} /> Copy Letter
                                                        </Button>
                                                        <Button
                                                            onClick={handleGenerateCoverLetter}
                                                            disabled={coverLetterLoading}
                                                            variant="outline"
                                                            className="border-white/10 hover:bg-white/5 text-white h-10 px-4 rounded-xl flex items-center gap-1.5"
                                                        >
                                                            <RefreshCw size={14} className={coverLetterLoading ? "animate-spin" : ""} /> Regenerate
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <Card className="md:col-span-2 bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl min-h-[500px] font-serif leading-relaxed text-gray-200 whitespace-pre-wrap select-text selection:bg-[#ADFF44] selection:text-black shadow-xl">
                                                        {coverLetter}
                                                    </Card>

                                                    <div className="space-y-6">
                                                        {/* Tips */}
                                                        <Card className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                                            <h4 className="font-bold text-sm text-[#ADFF44] flex items-center gap-1.5 uppercase tracking-wider">
                                                                <Star size={14} fill="currentColor" stroke="none" /> Cover Letter Tips
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {coverLetterTips.map((tip, idx) => (
                                                                    <li key={idx} className="flex gap-2.5 text-xs text-gray-400 leading-relaxed">
                                                                        <div className="h-4 w-4 rounded-full bg-[#ADFF44]/10 flex items-center justify-center shrink-0 text-[#ADFF44] font-bold text-[9px]">{idx + 1}</div>
                                                                        <span>{tip}</span>
                                                                    </li>
                                                                ))}
                                                                <li className="flex gap-2.5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                                                    <div className="h-4 w-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500 font-bold text-[9px]">!</div>
                                                                    <span>Always verify contact details, target names, dates, and placeholders before sending.</span>
                                                                </li>
                                                            </ul>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Card className="p-12 flex flex-col items-center justify-center text-center gap-6 rounded-3xl border border-dashed border-white/10 bg-white/3 min-h-[400px]">
                                                <div className="w-16 h-16 rounded-2xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44]">
                                                    <FileText size={32} />
                                                </div>
                                                <div className="max-w-md space-y-2">
                                                    <h3 className="text-xl font-bold">Write a Tailored Cover Letter</h3>
                                                    <p className="text-gray-400 text-sm leading-relaxed">
                                                        Generate a professional cover letter linking your achievements directly to the requirements of the job description.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleGenerateCoverLetter}
                                                    disabled={coverLetterLoading}
                                                    className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-black px-8 py-4 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-[#ADFF44]/10"
                                                >
                                                    {coverLetterLoading ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            <span>Writing Cover Letter...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={16} />
                                                            <span>Generate Tailored Cover Letter</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* RESUME MODE: BULLET REWRITER TAB */}
                                {analysis && activeTab === "rewriter" && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        {analysis.bullet_rewrites && analysis.bullet_rewrites.length > 0 ? (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resume Bullets Refined</h4>
                                                <div className="grid gap-4">
                                                    {analysis.bullet_rewrites.map((item, idx) => (
                                                        <div key={idx} className="p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors grid md:grid-cols-2 gap-6 items-start">
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Original Experience Bullet</span>
                                                                <p className="text-sm text-gray-400 leading-relaxed italic">"{item.original}"</p>
                                                            </div>
                                                            <div className="space-y-2 bg-[#ADFF44]/5 p-4 rounded-xl border border-[#ADFF44]/10 relative">
                                                                <span className="text-[10px] font-black text-[#ADFF44] uppercase tracking-widest">AI X-Y-Z Optimized Version</span>
                                                                <p className="text-sm text-gray-200 leading-relaxed font-medium">"{item.rewritten}"</p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(item.rewritten);
                                                                        toast.success("Optimized bullet copied!");
                                                                    }}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-[#ADFF44]/20 text-[#ADFF44] transition-colors"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <Copy size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No original experience bullets detected for auto-rewriting.</p>
                                        )}

                                        <Card className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <Sparkles className="text-[#ADFF44]" size={20} />
                                                    Custom Bullet Rewriter Sandbox
                                                </h3>
                                                <p className="text-gray-400 text-xs mt-1">Paste any sentence from your experience section and let AI rewrite it using strong action verbs and metrics templates.</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 items-start">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Experience Bullet</label>
                                                    <Textarea
                                                        placeholder="e.g., Managed a team of engineers to build a new web application and fixed bugs."
                                                        className="bg-black/50 border-white/10 focus:border-[#ADFF44] min-h-[120px] rounded-xl text-sm"
                                                        value={customBullet}
                                                        onChange={(e) => setCustomBullet(e.target.value)}
                                                    />
                                                    <Button
                                                        onClick={handleRewriteBullet}
                                                        disabled={rewritingBullet || !customBullet.trim()}
                                                        className="bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold h-10 px-5 rounded-xl flex items-center gap-1.5"
                                                    >
                                                        {rewritingBullet ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                                        Rewrite Bullet Point
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics-Driven Rewrite</label>
                                                    <div className="bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-5 min-h-[120px] flex flex-col justify-between relative group">
                                                        {rewrittenBullet ? (
                                                            <>
                                                                <p className="text-sm text-gray-300 leading-relaxed font-medium italic">"{rewrittenBullet}"</p>
                                                                <Button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(rewrittenBullet);
                                                                        toast.success("Rewritten bullet copied!");
                                                                    }}
                                                                    className="mt-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold h-9 text-xs px-3 rounded-lg flex items-center gap-1.5 self-end"
                                                                >
                                                                    <Copy size={12} /> Copy Output
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-center h-full py-6 text-gray-600 gap-2">
                                                                <Wand2 size={24} />
                                                                <p className="text-xs font-semibold uppercase tracking-wider">Output Sandbox</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* LINKEDIN MODE: JOBS EXPLORATION TAB */}
                                {linkedinAnalysis && activeTab === "jobs" && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20 text-[#ADFF44]">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold font-sora">Market Jobs</h3>
                                                    <p className="text-gray-500 text-sm">Live listings matching your LinkedIn profile role</p>
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
                                                    type="button"
                                                    onClick={() => fetchRecommendedJobs(roles[0]?.role || "General Professional")}
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
                                )}
                            </div>
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
