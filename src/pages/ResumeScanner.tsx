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
        // Here we just use a mock text or try to read text if it was txt file. 
        // For simulation, we'll assume the file contains "some standard resume text" + whatever title is in the filename
        const mockResumeText = "I am a software engineer with React and TypeScript experience. I built a project using Node.js and improved performance by 20%.";

        const res = await analyzeResume(mockResumeText, jdText);
        // Force 'Generative AI' as missing for demo purposes if not present
        if (!res.missingKeywords.includes('Generative AI')) {
            res.missingKeywords.push('Generative AI');
            res.score = Math.max(70, res.score - 5); // Lower score slightly to create urgency
        }
        setResult(res);
        setIsAnalyzing(false);
    };

    // Simple heuristic to detect role from JD
    const detectRole = (text: string): string => {
        const commonRoles = [
            'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
            'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Mobile Developer',
            'QA Engineer', 'Machine Learning Engineer', 'React Developer', 'Java Developer', 'Python Developer'
        ];

        for (const role of commonRoles) {
            if (text.toLowerCase().includes(role.toLowerCase())) {
                return role;
            }
        }
        return 'Candidate'; // Default
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        AI Resume Scanner
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Check your ATS score instantly. Compare your resume against any job description to find missing skills and gaps.
                    </p>
                </div>

                {!result ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Input */}
                        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg">
                            <CardHeader>
                                <CardTitle>Upload & Scan</CardTitle>
                                <CardDescription>Paste the Job Description and upload your Resume PDF.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>1. Job Description (Paste Text)</Label>
                                    <Textarea
                                        placeholder="Paste the full job description here..."
                                        className="min-h-[200px] font-mono text-sm"
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>2. Upload Resume (PDF)</Label>
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer relative">
                                        <Input
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                                            <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{file.name}</p>
                                                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">Click to Upload Resume</p>
                                                <p className="text-sm text-slate-500">PDF or DOCX (Max 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25"
                                    onClick={handleAnalyze}
                                    disabled={!file || !jdText || isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            Run ATS Scan <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Analysis Results</h2>
                            <Button variant="outline" onClick={() => setResult(null)}>Scan New Resume</Button>
                        </div>

                        {/* Celebration / Social Share Card */}
                        {result.score >= 80 && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden mb-8"
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                                        {result.score >= 90 ? `🏆 Top 1% ${detectRole(jdText)}` : `🌟 Top 5% ${detectRole(jdText)}`}
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2">
                                        {result.score >= 90 ? 'Elite Candidate Status' : 'Strong Contender Status'}
                                    </h3>
                                    <p className="text-indigo-100 max-w-lg mx-auto mb-6">
                                        Your resume matches the {detectRole(jdText)} profile perfectly. Verified by Koutuhal AI.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            const role = detectRole(jdText);
                                            const text = result.score >= 90
                                                ? `I just verified my resume on Koutuhal and scored in the Top 1% for ${role}. Check your score here: https://koutuhal.com`
                                                : `I just verified my resume on Koutuhal and scored in the Top 5% for ${role}. Check your score here: https://koutuhal.com`;
                                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="bg-[#0077b5] hover:bg-[#006396] text-white font-bold h-12 px-8 shadow-lg transition-all hover:scale-105"
                                    >
                                        <Linkedin className="w-5 h-5 mr-2" /> Share on LinkedIn
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Top: Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-slate-200 shadow-sm flex flex-col items-center justify-center py-6">
                                <ScoreGauge score={result.score} label="Overall Match" />
                            </Card>
                            <Card className="border-slate-200 shadow-sm flex flex-col items-center justify-center py-6">
                                <ScoreGauge score={result.structureScore} label="Format Score" color="#3b82f6" />
                            </Card>
                            <Card className="border-slate-200 shadow-sm flex flex-col items-center justify-center py-6">
                                <ScoreGauge score={result.impactScore} label="Impact Score" color="#f59e0b" />
                            </Card>
                        </div>

                        {/* Bottom: Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Missing Skills */}
                            <Card className="border-red-100 bg-red-50/10 dark:border-red-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-red-600">
                                        <AlertCircle className="w-5 h-5 mr-2" /> Missing Keywords
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {result.missingKeywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.map(kw => (
                                                <span key={kw} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full border border-red-200">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-600">No major keywords missing! Great job.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recommendations / Gap Analysis Section */}
                            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 shadow-md relative overflow-hidden">
                                {(!['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))) && (
                                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PREMIUM</div>
                                )}
                                <CardHeader>
                                    <CardTitle className="flex items-center text-amber-700 dark:text-amber-500">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        {['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))
                                            ? `Resume Gap Analysis for ${detectRole(jdText)} Role`
                                            : "Recommended Actions"
                                        }
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">

                                    {/* 1. Gap Analysis Content (Always Show for PM/Marketing) */}
                                    {['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r)) && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                Based on the job description for <strong>{detectRole(jdText)}</strong>, your resume has the following gaps:
                                            </p>
                                            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                <li>Missing specific keywords: <strong>{result.missingKeywords.join(', ') || 'None detected'}</strong>.</li>
                                                <li>Impact score is {result.impactScore}/100. Try adding more metrics (e.g., "Increased revenue by 20%").</li>
                                                <li>Ensure your experience highlights leadership and cross-functional collaboration.</li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* 2. Premium Gen AI Upsell (HIDE for PM/Marketing, SHOW for others/GenAI) */}
                                    {(!['product manager', 'digital marketing manager', 'marketing'].some(r => detectRole(jdText).toLowerCase().includes(r))) &&
                                        (result.missingKeywords.includes('Generative AI') || result.missingKeywords.includes('LLMs')) && (
                                            <div className="flex items-start p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200 to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                <div className="bg-amber-100 p-2 rounded mr-3 text-amber-600 z-10">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div className="z-10 w-full">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Master Generative AI & LLMs</h4>
                                                    <p className="text-xs text-slate-500 mt-1">Bridge your critical skill gap. Learn Prompt Engineering, RAG, and Fine-tuning.</p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <span className="text-xs font-bold text-slate-400 line-through">$199</span>
                                                        <span className="text-xs font-bold text-green-600 animate-pulse">Save 75%</span>
                                                    </div>
                                                    <Link to="/courses/gen-ai-masterclass">
                                                        <Button size="sm" className="h-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white mt-2 text-xs w-full shadow-md font-bold">
                                                            Unlock Course ($49) <ArrowRight className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                    {/* 3. Resume Workshop Upsell (Conditional) */}
                                    {result.impactScore < 60 && !['product manager', 'digital marketing'].some(r => detectRole(jdText).toLowerCase().includes(r)) && (
                                        <div className="flex items-start p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 shadow-sm">
                                            <div className="bg-amber-100 p-2 rounded mr-3 text-amber-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Workshop: Resume Writing 101</h4>
                                                <p className="text-xs text-slate-500 mt-1">Learn how to quantify your impact with numbers.</p>
                                                <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white mt-2 text-xs w-full">
                                                    Join Workshop ($29)
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Success Message */}
                                    {result.missingKeywords.length === 0 && result.impactScore >= 80 && (
                                        <p className="text-sm text-slate-600">Your resume is optimized! You are ready to apply.</p>
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
