import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Loader2, TrendingUp, Linkedin } from 'lucide-react';
import { analyzeResume, AnalysisResult } from '@/lib/ats-simulator';
import ScoreGauge from '@/components/resume/ScoreGauge';
import { motion } from 'framer-motion';

const ResumeScanner = () => {
    const [file, setFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jdText) return;

        setIsAnalyzing(true);
        // Simulate text extraction from PDF (In real app, backend does this)
        const mockResumeText = "I am a software engineer with React and TypeScript experience. I built a project using Node.js and improved performance by 20%.";

        const res = await analyzeResume(mockResumeText, jdText);

        // LOGIC FIX: Only force 'Generative AI' if the JD is related to AI/Gen AI
        const isGenAiRole = /gen\s*ai|generative\s*ai|llm|large\s*language\s*model|artificial\s*intelligence/i.test(jdText);

        if (isGenAiRole && !res.missingKeywords.includes('Generative AI')) {
            res.missingKeywords.push('Generative AI');
            res.score = Math.max(70, res.score - 5);
        }

        setResult(res);
        setIsAnalyzing(false);
    };

    // Simple heuristic to detect role from JD
    const detectRole = (text: string): string => {
        const commonRoles = [
            'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
            'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Mobile Developer',
            'QA Engineer', 'Machine Learning Engineer', 'React Developer', 'Java Developer', 'Python Developer',
            'Digital Marketing', 'Marketing Manager'
        ];

        for (const role of commonRoles) {
            if (text.toLowerCase().includes(role.toLowerCase())) {
                return role;
            }
        }
        if (/gen\s*ai|gpt|llm/i.test(text)) return 'Generative AI Engineer';
        return 'Candidate'; // Default
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pt-28 pb-20 px-4 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-12">

                <div className="text-center space-y-4">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-2">
                        🚀 AI-Powered Application Optimization
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Perfect Your Resume for <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Any Role</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Paste a job description and let our AI analyze your resume's compatibility. Get instant feedback on missing keywords and skill gaps.
                    </p>
                </div>

                {!result ? (
                    <div className="max-w-4xl mx-auto">
                        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden rounded-3xl">
                            <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-violet-600" />
                                    <span>Upload & Scan</span>
                                </CardTitle>
                                <CardDescription className="text-base">Paste the Job Description and upload your Resume PDF.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">1. Job Description</Label>
                                        <Textarea
                                            placeholder="Paste the full job description here (e.g., 'Looking for a Product Manager with...')"
                                            className="min-h-[240px] font-mono text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-violet-500 resize-none rounded-xl p-4"
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">2. Your Resume</Label>
                                        <div className="h-[240px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-violet-400 transition-all cursor-pointer relative group bg-slate-50/50 dark:bg-slate-950/50">
                                            <Input
                                                type="file"
                                                accept=".pdf,.docx,.txt"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileChange}
                                            />
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="w-8 h-8 text-violet-600" />
                                            </div>
                                            {file ? (
                                                <div className="px-6">
                                                    <p className="font-bold text-slate-900 dark:text-white text-lg truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready to Scan</p>
                                                    <div className="mt-3 inline-flex items-center text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> PDF Uploaded
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="px-6">
                                                    <p className="font-semibold text-slate-900 dark:text-white">Click to Upload Resume</p>
                                                    <p className="text-sm text-slate-500 mt-1">PDF or DOCX (Max 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-xl shadow-violet-500/20 py-8 text-lg font-bold rounded-xl transition-all hover:scale-[1.01]"
                                    onClick={handleAnalyze}
                                    disabled={!file || !jdText || isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing Resume compatibility...
                                        </>
                                    ) : (
                                        <>
                                            Run ATS Gap Analysis <ArrowRight className="ml-2 h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Complete</h2>
                                    <p className="text-sm text-slate-500">Target Role: <span className="font-semibold text-violet-600">{detectRole(jdText)}</span></p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setResult(null)} className="text-slate-500 hover:text-slate-900">Scan Another</Button>
                        </div>

                        {/* Top: Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <ScoreGauge score={result.score} label="Overall Match" />
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <ScoreGauge score={result.structureScore} label="Format Score" color="#3b82f6" />
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <ScoreGauge score={result.impactScore} label="Impact Score" color="#f59e0b" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Improved Celebration Card */}
                        {result.score >= 80 && (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-r from-violet-900 to-indigo-900 rounded-3xl p-8 md:p-10 text-white text-center shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                {/* Glow Effects */}
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6">
                                        <span className="text-amber-400">★</span>
                                        <span className="font-bold text-sm tracking-wide uppercase">{result.score >= 90 ? 'Top 1% Talent' : 'Top 5% Talent'}</span>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
                                        {result.score >= 90 ? 'You are an Elite Candidate!' : 'You represent a Strong Contender!'}
                                    </h3>

                                    <p className="text-violet-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                                        Your resume demonstrates exceptional alignment with the <strong>{detectRole(jdText)}</strong> profile. This score puts you ahead of 95% of applicants.
                                    </p>

                                    <Button
                                        onClick={() => {
                                            const role = detectRole(jdText);
                                            const text = `I just analyzed my resume on Koutuhal and scored an ${result.score}/100 match for ${role} roles! Check your ATS score here: https://koutuhal.com`;
                                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="bg-white text-violet-900 hover:bg-violet-50 font-bold h-12 px-8 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <Linkedin className="w-5 h-5 text-[#0077b5]" /> Share Achievement
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Bottom: Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Missing Skills */}
                            <Card className="border-0 shadow-lg overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900">
                                <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-50 dark:border-red-900/20 pb-4">
                                    <CardTitle className="flex items-center text-red-600 dark:text-red-400 text-lg">
                                        <AlertCircle className="w-5 h-5 mr-2" /> Critical Keywords Missing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow">
                                    {result.missingKeywords.length > 0 ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-500">Recruiters and ATS bots look for these exact terms. Add them to your skills or experience section contextually.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missingKeywords.map(kw => (
                                                    <span key={kw} className="px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm font-semibold rounded-md border border-red-100 dark:border-red-800/50">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <p className="text-slate-900 font-medium">No Missing Keywords!</p>
                                            <p className="text-sm text-slate-500">Your resume covers all the essentials.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recommendations / Gap Analysis Section */}
                            <Card className="border-0 shadow-lg overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
                                {(!['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))) && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">RECOMMENDED</div>
                                )}
                                <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-50 dark:border-amber-900/20 pb-4">
                                    <CardTitle className="flex items-center text-amber-700 dark:text-amber-500 text-lg">
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        {['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))
                                            ? "Role-Specific Gap Analysis"
                                            : "Recommended Next Steps"
                                        }
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">

                                    {/* 1. Gap Analysis Content (Always Show for PM/Marketing) */}
                                    {['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r)) && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3">
                                                Analysis for <strong>{detectRole(jdText)}</strong>:
                                            </p>
                                            <ul className="space-y-2">
                                                <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="mr-2 text-amber-500">•</span>
                                                    <span>Missing specific technical keywords: <strong>{result.missingKeywords.join(', ') || 'None detected'}</strong>.</span>
                                                </li>
                                                <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="mr-2 text-amber-500">•</span>
                                                    <span>Impact score is <strong>{result.impactScore}/100</strong>. Quantify your achievements (e.g., "Increased conversion by 15%").</span>
                                                </li>
                                                <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="mr-2 text-amber-500">•</span>
                                                    <span>Highlight cross-functional leadership and data-driven decision making.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* 2. Premium Gen AI Upsell (Correctly Gated) */}
                                    {(!['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))) &&
                                        (result.missingKeywords.includes('Generative AI') || /gen\s*ai|llm/i.test(jdText)) && (
                                            <div className="relative group overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/10 p-5 transition-all hover:shadow-md">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                                                <div className="flex gap-4 relative z-10">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-sm ring-1 ring-amber-100">
                                                        ⚡
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">Master Generative AI & LLMs</h4>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-3">Bridge your critical skill gap. Learn Prompt Engineering, RAG, and Fine-tuning.</p>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-sm font-bold text-slate-400 line-through">$199</span>
                                                                <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-[10px] uppercase">75% OFF</span>
                                                            </div>
                                                            <Link to="/courses/gen-ai-masterclass">
                                                                <Button size="sm" className="h-9 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-amber-500/10 border border-slate-700">
                                                                    Unlock for $49 <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    {/* 3. Resume Workshop Upsell (Conditional) */}
                                    {result.impactScore < 60 && !['product manager', 'digital marketing'].some(r => detectRole(jdText).toLowerCase().includes(r)) && (
                                        <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-colors">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm">Resume Writing 101</h4>
                                                <p className="text-xs text-slate-500">Learn to quantify impact.</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold h-8 text-xs">
                                                Join ($29)
                                            </Button>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {result.missingKeywords.length === 0 && result.impactScore >= 80 && (
                                        <div className="text-center py-4 text-slate-600">
                                            <p className="flex items-center justify-center gap-2 font-medium"><CheckCircle className="w-4 h-4 text-green-500" /> Your resume is fully optimized!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResumeScanner;
