import { useEffect, useState } from 'react';
import {
    Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Loader2,
    TrendingUp, Linkedin, XCircle, Star, ShieldAlert, Lightbulb, Award, ChevronUp, ChevronDown,
    Briefcase, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ScoreGauge from '@/components/resume/ScoreGauge';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeTailorPanel from '@/components/jobs/ResumeTailorPanel';
import { Job } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CriticalGap {
    gap: string;
    severity: 'High' | 'Medium' | 'Low';
    fix: string;
}

export interface Strength {
    strength: string;
    evidence: string;
}

export interface AnalysisResult {
    is_resume: boolean;
    score: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    missingKeywords: string[];
    foundKeywords: string[];
    structureScore: number;
    impactScore: number;
    criticalGaps: CriticalGap[];
    strengths: Strength[];
    atsRecommendations: string[];
    resume_text?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_CONFIG = {
    S: { label: 'S — Elite Match', color: '#ADFF44', bg: 'bg-[#ADFF44]/10', border: 'border-[#ADFF44]/40', text: 'text-[#ADFF44]' },
    A: { label: 'A — Strong Match', color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400' },
    B: { label: 'B — Good Match', color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400' },
    C: { label: 'C — Partial Match', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400' },
    D: { label: 'D — Weak Match', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400' },
} as const;

const SEVERITY_CONFIG = {
    High: 'bg-red-500/15 text-red-400 border-red-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
} as const;

const detectRole = (text: string): string => {
    const roles = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
        'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Mobile Developer',
        'QA Engineer', 'Machine Learning Engineer', 'React Developer', 'Java Developer',
        'Python Developer', 'Digital Marketing', 'Marketing Manager',
    ];
    for (const role of roles) {
        if (text.toLowerCase().includes(role.toLowerCase())) return role;
    }
    if (/gen\s*ai|gpt|llm/i.test(text)) return 'Generative AI Engineer';
    return 'the target role';
};

// ─── Sub-components (defined OUTSIDE parent to avoid React crash) ─────────────

interface UploadFormProps {
    file: File | null;
    jdText: string;
    isAnalyzing: boolean;
    error: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onJdChange: (v: string) => void;
    onAnalyze: () => void;
}

const UploadForm = ({ file, jdText, isAnalyzing, error, onFileChange, onJdChange, onAnalyze }: UploadFormProps) => (
    <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl bg-neutral-900/80 backdrop-blur-xl ring-1 ring-neutral-800 overflow-hidden rounded-3xl">
            <div className="h-1.5 bg-gradient-to-r from-[#ADFF44] via-blue-500 to-violet-500 w-full" />
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white">
                    <FileText className="w-6 h-6 text-[#ADFF44]" />
                    AI Career Check & ATS Scanner
                </CardTitle>
                <CardDescription className="text-neutral-400 text-base">
                    Paste the Job Description and upload your Resume PDF for deep ATS analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* JD */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-neutral-300">1. Job Description</Label>
                        <Textarea
                            className="min-h-[240px] font-mono text-sm bg-neutral-900 border-neutral-800 focus:ring-[#ADFF44]/50 resize-none rounded-xl p-4 text-neutral-200"
                            value={jdText}
                            onChange={(e) => onJdChange(e.target.value)}
                        />
                    </div>

                    {/* File */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold text-neutral-300">2. Your Resume</Label>
                        <div className="h-[240px] border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center text-center hover:bg-neutral-800/50 hover:border-[#ADFF44]/40 transition-all cursor-pointer relative group bg-neutral-900/50">
                            <Input
                                type="file"
                                accept=".pdf,.docx,.txt"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={onFileChange}
                            />
                            <div className="bg-neutral-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform border border-neutral-700 group-hover:border-[#ADFF44]/40">
                                <Upload className="w-8 h-8 text-[#ADFF44]" />
                            </div>
                            {file ? (
                                <div className="px-6">
                                    <p className="font-bold text-white text-lg truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-sm text-neutral-500 mt-1">{(file.size / 1024).toFixed(1)} KB · Ready</p>
                                    <div className="mt-3 inline-flex items-center text-xs font-bold text-[#ADFF44] bg-[#ADFF44]/10 px-3 py-1 rounded-full border border-[#ADFF44]/20">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Uploaded
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6">
                                    <p className="font-semibold text-white">Click to Upload Resume</p>
                                    <p className="text-sm text-neutral-500 mt-1">PDF, DOCX, or TXT (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full bg-[#ADFF44] text-black hover:bg-[#9BE63D] py-8 text-lg font-black rounded-xl shadow-[0_0_40px_rgba(173,255,68,0.2)] hover:shadow-[0_0_60px_rgba(173,255,68,0.4)] transition-all hover:scale-[1.01]"
                    onClick={onAnalyze}
                    disabled={!file || !jdText || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing with AI...</>
                    ) : (
                        <>Run FAANG-Level ATS Analysis <ArrowRight className="ml-2 h-6 w-6" /></>
                    )}
                </Button>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
);

const NotResumeScreen = ({ onReset }: { onReset: () => void }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center py-12"
    >
        <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">That's Not a Resume</h2>
        <p className="text-neutral-400 text-lg mb-2">
            The uploaded file doesn't appear to be a professional resume or CV.
        </p>
        <p className="text-neutral-500 text-sm mb-8">
            Please upload a resume containing your work experience, skills, and education.
        </p>
        <Button
            onClick={onReset}
            className="bg-[#ADFF44] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#9BE63D] transition-all"
        >
            <Upload className="w-4 h-4 mr-2" /> Upload a Proper Resume
        </Button>
    </motion.div>
);

interface ResultsScreenProps {
    r: AnalysisResult;
    jdText: string;
    onReset: () => void;
    onTailor: () => void;
}

const ResultsScreen = ({ r, jdText, onReset, onTailor }: ResultsScreenProps) => {
    const [expandedGap, setExpandedGap] = useState<number | null>(null);
    const [marketJobs, setMarketJobs] = useState<any[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const grade = GRADE_CONFIG[r.grade] ?? GRADE_CONFIG['C'];

    useEffect(() => {
        const role = detectRole(jdText);
        const fetchMarket = async () => {
            setJobsLoading(true);
            try {
                const res = await fetch(`/api/v1/career/jobs?role=${encodeURIComponent(role)}&location=Remote&count=4`);
                if (res.ok) setMarketJobs(await res.json());
            } catch (err) {
                console.error("Market fetch failed", err);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchMarket();
    }, [jdText]);

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Header bar — grade + score */}
            <div className="flex flex-wrap justify-between items-center bg-neutral-900 p-4 rounded-2xl border border-neutral-800 gap-4">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 ${grade.bg} ${grade.border}`}>
                        <span className={`text-4xl font-black leading-none ${grade.text}`}>{r.grade}</span>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white leading-none">
                                {r.score}<span className="text-sm font-normal text-neutral-500">/100</span>
                            </span>
                            <span className={`text-xs font-bold mt-0.5 ${grade.text}`}>ATS Score</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{grade.label}</h2>
                        <p className="text-sm text-neutral-500">Target: <span className="font-semibold text-[#ADFF44]">{detectRole(jdText)}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={onTailor}
                        className="rounded-xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black h-10 px-5 font-bold shadow-lg shadow-[#ADFF44]/20"
                    >
                        <Wand2 className="mr-2 w-4 h-4" /> Draft Tailored Resume
                    </Button>
                    <Button variant="ghost" onClick={onReset} className="text-neutral-500 hover:text-white text-sm">
                        ↩ Scan Another
                    </Button>
                </div>
            </div>

            {/* Score gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { score: r.score, label: 'ATS Match', color: grade.color },
                    { score: r.structureScore, label: 'Format Score', color: '#3b82f6' },
                    { score: r.impactScore, label: 'Impact Score', color: '#f59e0b' },
                ].map(({ score, label, color }) => (
                    <Card key={label} className="border-0 bg-neutral-900 ring-1 ring-neutral-800">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                            <ScoreGauge score={score} label={label} color={color} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ✨ UNMISSABLE CTA: AI Resume Forge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ADFF44]/20 via-transparent to-[#ADFF44]/10 pointer-events-none" />
                <Card className="border-2 border-[#ADFF44]/30 bg-neutral-900/80 backdrop-blur-md overflow-hidden ring-1 ring-[#ADFF44]/20">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ADFF44]/10 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold uppercase tracking-widest">
                                <Wand2 className="w-3 h-3" /> New: AI Resume Forge
                            </div>
                            <h3 className="text-3xl font-black text-white leading-tight">Ready to fix these gaps?</h3>
                            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
                                Our AI can instantly draft a professional, ATS-optimized version of your resume tailored precisely to this Job Description.
                                <span className="block mt-2 text-[#ADFF44]/80 text-sm font-medium italic">"It's like having a FAANG career coach in your pocket."</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4 min-w-[240px]">
                            <Button
                                onClick={onTailor}
                                className="w-full h-16 rounded-2xl bg-[#ADFF44] hover:bg-[#9BE63D] text-black text-lg font-black shadow-2xl shadow-[#ADFF44]/20 group-hover:scale-105 transition-all duration-300"
                            >
                                <Wand2 className="mr-3 w-6 h-6" /> Draft Resume Now
                            </Button>
                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Confirm your JD in the next step
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Elite candidate banner */}
            {r.score >= 85 && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 to-black border border-[#ADFF44]/20 p-8 text-center"
                >
                    <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#ADFF44] rounded-full blur-3xl opacity-10 pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-10 pointer-events-none" />
                    <Award className="w-10 h-10 text-[#ADFF44] mx-auto mb-3" />
                    <h3 className="text-2xl font-black text-white mb-2">{r.score >= 92 ? 'Top 1% Candidate' : 'Strong Contender'}</h3>
                    <p className="text-neutral-400 max-w-lg mx-auto mb-6">
                        Your resume scores in the top {r.score >= 92 ? '1%' : '5%'} for <strong className="text-white">{detectRole(jdText)}</strong> roles.
                    </p>
                    <Button
                        onClick={() => {
                            const text = `Just ran my resume through Koutuhal's FAANG-level ATS scanner and scored ${r.score}/100 — Grade ${r.grade} for ${detectRole(jdText)} roles! Try it: https://koutuhal.com`;
                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-[#0077B5] text-white hover:bg-[#005f91] font-bold px-6 rounded-full"
                    >
                        <Linkedin className="w-4 h-4 mr-2" /> Share on LinkedIn
                    </Button>
                </motion.div>
            )}

            {/* Strengths + Critical Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Strengths */}
                <Card className="border-0 bg-neutral-900 ring-1 ring-neutral-800 overflow-hidden">
                    <CardHeader className="border-b border-neutral-800 pb-4 bg-[#ADFF44]/5">
                        <CardTitle className="flex items-center gap-2 text-[#ADFF44] text-lg">
                            <Star className="w-5 h-5" /> Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3">
                        {r.strengths.length > 0 ? r.strengths.map((s, i) => (
                            <div key={i} className="p-4 bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl">
                                <p className="font-semibold text-white text-sm mb-1">{s.strength}</p>
                                <p className="text-xs text-neutral-400 italic">"{s.evidence}"</p>
                            </div>
                        )) : (
                            <p className="text-neutral-500 text-sm">Enrich your resume with specific achievements to highlight strengths.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Critical Gaps */}
                <Card className="border-0 bg-neutral-900 ring-1 ring-neutral-800 overflow-hidden">
                    <CardHeader className="border-b border-neutral-800 pb-4 bg-red-500/5">
                        <CardTitle className="flex items-center gap-2 text-red-400 text-lg">
                            <ShieldAlert className="w-5 h-5" /> Critical Gaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3">
                        {r.criticalGaps.length > 0 ? r.criticalGaps.map((g, i) => (
                            <div key={i} className="border border-neutral-800 rounded-xl overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition"
                                    onClick={() => setExpandedGap(expandedGap === i ? null : i)}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${SEVERITY_CONFIG[g.severity]}`}>
                                            {g.severity.toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium text-white">{g.gap}</span>
                                    </div>
                                    {expandedGap === i ? <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />}
                                </button>
                                <AnimatePresence>
                                    {expandedGap === i && (
                                        <motion.div
                                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 flex items-start gap-2">
                                                <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-neutral-300">{g.fix}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center py-6 text-center">
                                <CheckCircle className="w-8 h-8 text-[#ADFF44] mb-2" />
                                <p className="text-white font-medium">No Critical Gaps!</p>
                                <p className="text-neutral-500 text-sm">Your resume covers the essentials.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-neutral-900 ring-1 ring-neutral-800">
                    <CardHeader className="border-b border-neutral-800 pb-3">
                        <CardTitle className="text-red-400 text-base flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Missing Keywords
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        {r.missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {r.missingKeywords.map(kw => (
                                    <span key={kw} className="px-3 py-1.5 bg-red-500/10 text-red-300 text-sm font-medium rounded-lg border border-red-500/20">{kw}</span>
                                ))}
                            </div>
                        ) : <p className="text-neutral-500 text-sm">All important keywords found!</p>}
                    </CardContent>
                </Card>

                <Card className="border-0 bg-neutral-900 ring-1 ring-neutral-800">
                    <CardHeader className="border-b border-neutral-800 pb-3">
                        <CardTitle className="text-[#ADFF44] text-base flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Matched Keywords
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        {r.foundKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {r.foundKeywords.map(kw => (
                                    <span key={kw} className="px-3 py-1.5 bg-[#ADFF44]/10 text-[#ADFF44] text-sm font-medium rounded-lg border border-[#ADFF44]/20">{kw}</span>
                                ))}
                            </div>
                        ) : <p className="text-neutral-500 text-sm">No keyword matches found yet.</p>}
                    </CardContent>
                </Card>
            </div>

            {/* ATS Recommendations */}
            {r.atsRecommendations.length > 0 && (
                <Card className="border-0 bg-neutral-900 ring-1 ring-neutral-800">
                    <CardHeader className="border-b border-neutral-800 pb-4 bg-violet-500/5">
                        <CardTitle className="flex items-center gap-2 text-violet-400 text-lg">
                            <TrendingUp className="w-5 h-5" /> ATS Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <ul className="space-y-3">
                            {r.atsRecommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 flex-shrink-0 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Context (Side-by-Side) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-neutral-800" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 whitespace-nowrap px-4">Analysis Context: JD vs My Resume</span>
                    <div className="h-px flex-1 bg-neutral-800" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* JD Card */}
                    <Card className="bg-neutral-900/40 border-neutral-800">
                        <CardHeader className="pb-3"><CardTitle className="text-sm text-neutral-400 flex items-center gap-2 underline decoration-[#ADFF44]/30">Job Description Analyzed</CardTitle></CardHeader>
                        <CardContent>
                            <div className="max-h-[300px] overflow-y-auto text-xs text-neutral-400 leading-relaxed font-mono">
                                {jdText}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Resume Text Card */}
                    <Card className="bg-neutral-900/40 border-neutral-800">
                        <CardHeader className="pb-3"><CardTitle className="text-sm text-neutral-400 flex items-center gap-2 underline decoration-[#ADFF44]/30">My Extracted Resume Data</CardTitle></CardHeader>
                        <CardContent>
                            <div className="max-h-[300px] overflow-y-auto text-xs text-neutral-400 leading-relaxed font-mono">
                                {r.resume_text || "Resume text unavailable for preview."}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Market Opportunities */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white">Market Opportunities</h3>
                        <p className="text-sm text-neutral-500">Live listings matching this profile and detects role: <span className="text-[#ADFF44] font-bold">{detectRole(jdText)}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {jobsLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-neutral-900 rounded-2xl animate-pulse ring-1 ring-neutral-800" />)
                    ) : marketJobs.length > 0 ? (
                        marketJobs.map((job, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-[#ADFF44]/30 transition-all group relative"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="group-hover:text-[#ADFF44] transition-colors overflow-hidden">
                                        <h4 className="font-bold text-white text-sm truncate">{job.title}</h4>
                                        <p className="text-[10px] text-neutral-500 font-medium truncate">{job.company}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                                        <Briefcase className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#ADFF44]" />
                                    </div>
                                </div>
                                <p className="text-[11px] text-neutral-400 mb-4 line-clamp-3 leading-tight">{job.snippet || "View description on job board."}</p>
                                <a
                                    href={job.apply_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs font-bold text-[#ADFF44] hover:underline"
                                >
                                    Apply Now <ArrowRight className="w-3 h-3 ml-1" />
                                </a>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-neutral-500 italic border-2 border-dashed border-neutral-800 rounded-2xl">
                            Looking for listings in your area...
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ResumeScanner = () => {
    const [file, setFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTailorOpen, setIsTailorOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jdText) return;
        setIsAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jd_text', jdText);

        try {
            const response = await fetch('/api/v1/ai/analyze-resume-quick', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || errData.message || 'Analysis failed. Please try again.');
            }

            const data: AnalysisResult = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setFile(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Page header */}
                <div className="text-center space-y-4">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#ADFF44]/10 text-[#ADFF44] text-sm font-bold mb-2 uppercase tracking-widest">
                        🚀 Career Readiness Engine
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        Perfect Your Resume for <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ADFF44] to-blue-400">Any Role</span>
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        Upload your resume + paste a JD. Get a letter grade, deep gap analysis, strengths, and actionable ATS optimizations.
                    </p>
                </div>

                {/* Screens */}
                {!result && (
                    <UploadForm
                        file={file}
                        jdText={jdText}
                        isAnalyzing={isAnalyzing}
                        error={error}
                        onFileChange={handleFileChange}
                        onJdChange={setJdText}
                        onAnalyze={handleAnalyze}
                    />
                )}

                {result && !result.is_resume && (
                    <NotResumeScreen onReset={handleReset} />
                )}

                {result && result.is_resume && (
                    <ResultsScreen
                        r={result}
                        jdText={jdText}
                        onReset={handleReset}
                        onTailor={() => setIsTailorOpen(true)}
                    />
                )}

                <ResumeTailorPanel
                    open={isTailorOpen}
                    onClose={() => setIsTailorOpen(false)}
                    sharedResume={file}
                    onResumeShared={setFile}
                    job={{
                        id: 'temp-' + Date.now(),
                        title: detectRole(jdText),
                        company: 'Your Target Role',
                        description: jdText,
                        location: 'Remote',
                        type: 'Full-time',
                        mode: 'Remote',
                        experience: 'Intermediate',
                        salary: 'Competitive',
                        skills: result?.foundKeywords || [],
                        category: 'Engineering',
                        postedDays: 0
                    } as Job}
                />

            </div>
        </div>
    );
};

export default ResumeScanner;
