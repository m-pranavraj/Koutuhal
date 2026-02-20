import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Wand2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface JobAnalyzerProps {
    onAnalyze: (jd: string) => Promise<void>;
}

export const JobAnalyzer = ({ onAnalyze }: JobAnalyzerProps) => {
    const [jd, setJd] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!jd) return;
        setLoading(true);
        await onAnalyze(jd);
        setLoading(false);
    };

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44]">1</span>
                Job Description
            </h3>

            <div className="flex-1 relative">
                <Textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the Job Description here..."
                    className="w-full h-full bg-black/50 border-neutral-800 rounded-xl p-4 text-neutral-300 resize-none focus:border-[#ADFF44] transition-all"
                />
                {jd && (
                    <button
                        onClick={() => setJd('')}
                        className="absolute top-4 right-4 p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <Button
                onClick={handleAnalyze}
                disabled={!jd || loading}
                className="w-full mt-4 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold h-12 rounded-xl group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Analyzing DNA...
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5" />
                            Analyze & Forge Resume
                        </>
                    )}
                </span>
            </Button>
        </div>
    );
};
