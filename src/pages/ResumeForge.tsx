import { useState } from 'react';
import { motion } from 'framer-motion';
import { JobAnalyzer } from '@/components/resume/JobAnalyzer';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Placeholder resume for demo - in prod this comes from user profile
const INITIAL_RESUME = `
<h1>John Doe</h1>
<p>Product Manager | AI Enthusiast</p>
<h2>Experience</h2>
<ul>
    <li>Managed a team of 5 developers.</li>
    <li>Launched 3 mobile apps.</li>
    <li>Improved user retention by 20%.</li>
</ul>
`;

const ResumeForge = () => {
    const { user } = useAuth();
    const [resumeContent, setResumeContent] = useState(INITIAL_RESUME);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matchScore, setMatchScore] = useState(0);

    const handleAnalyze = async (jdText: string) => {
        setIsAnalyzing(true);
        try {
            // 1. Analyze JD
            const analyzeRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/resume/analyze-jd`, {
                jd_text: jdText
            });
            const jdAnalysis = analyzeRes.data;

            // 2. Rewrite Resume
            const rewriteRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/resume/tailor-resume`, {
                resume_text: resumeContent,
                jd_analysis: jdAnalysis
            });

            // 3. Update Editor
            const { tailored_experience, match_score_after } = rewriteRes.data;

            // Format HTML for editor
            let newHtml = `<h1>${user?.full_name || 'Candidate Name'}</h1>`;
            newHtml += `<h3>${jdAnalysis.tone === 'formal' ? 'Professional Summary' : 'About Me'}</h3>`;
            newHtml += `<p>${rewriteRes.data.tailored_summary}</p>`;
            newHtml += `<h3>Experience</h3>`;
            tailored_experience.forEach((exp: any) => {
                newHtml += `<h4>${exp.role} at ${exp.company}</h4>`;
                newHtml += `<ul>${exp.description.map((d: string) => `<li>${d}</li>`).join('')}</ul>`;
            });

            setResumeContent(newHtml);
            setMatchScore(match_score_after || 85);
            toast.success("Resume Forged! 🚀", { description: "Optimized for ATS and Keywords." });

        } catch (error) {
            console.error(error);
            toast.error("Forge Failed", { description: "Could not tailor resume. Try again." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <Link to="/dashboard" className="text-neutral-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 flex items-center gap-3">
                            <span className="text-sm text-neutral-400">Match Score</span>
                            <div className="flex items-center gap-1">
                                <span className={`text-xl font-bold ${matchScore > 80 ? 'text-[#ADFF44]' : 'text-yellow-400'}`}>
                                    {matchScore}%
                                </span>
                                <Zap className={`w-4 h-4 ${matchScore > 80 ? 'text-[#ADFF44]' : 'text-yellow-400'}`} />
                            </div>
                        </div>
                        <Button variant="outline" className="border-neutral-800 hover:bg-neutral-900">
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[400px_1fr] gap-8 h-[800px]">
                    {/* Left: JD Input & Analysis */}
                    <div className="h-full">
                        <JobAnalyzer onAnalyze={handleAnalyze} />
                    </div>

                    {/* Right: Resume Editor */}
                    <div className="h-full flex flex-col">
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-t-3xl p-4 border-b-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2 text-sm text-neutral-400 font-medium">Resume_Tailored.pdf</span>
                            </div>
                            <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Live Editor</span>
                        </div>
                        <ResumeEditor
                            content={resumeContent}
                            onUpdate={setResumeContent}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeForge;
