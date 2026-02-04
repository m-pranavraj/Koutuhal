import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
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
        setResult(res);
        setIsAnalyzing(false);
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

                            {/* Recommendations */}
                            <Card className="border-purple-100 bg-purple-50/10 dark:border-purple-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-purple-600">
                                        <CheckCircle className="w-5 h-5 mr-2" /> Recommended Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {result.missingKeywords.some(k => ['React', 'Next.js', 'Vue'].includes(k)) && (
                                        <div className="flex items-start p-3 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 shadow-sm">
                                            <div className="bg-purple-100 p-2 rounded mr-3">
                                                <FileText className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Course: Full Stack Engineering</h4>
                                                <p className="text-xs text-slate-500 mt-1">Master React and Next.js to fill your skill gap.</p>
                                                <Button size="sm" variant="link" className="p-0 h-auto text-purple-600 mt-2">View Course &rarr;</Button>
                                            </div>
                                        </div>
                                    )}
                                    {result.impactScore < 60 && (
                                        <div className="flex items-start p-3 bg-white dark:bg-slate-900 rounded-lg border border-yellow-100 shadow-sm">
                                            <div className="bg-yellow-100 p-2 rounded mr-3">
                                                <FileText className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Workshop: Resume Writing 101</h4>
                                                <p className="text-xs text-slate-500 mt-1">Learn how to quantify your impact with numbers.</p>
                                                <Button size="sm" variant="link" className="p-0 h-auto text-yellow-600 mt-2">Join Workshop &rarr;</Button>
                                            </div>
                                        </div>
                                    )}
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
