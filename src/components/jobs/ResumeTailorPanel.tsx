import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Job } from '@/types';
import {
    X, Upload, Loader2, Download, CheckCircle, Wand2,
    CircleHelp, ChevronRight, FileText, Pencil
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TailoredSections {
    summary: string;
    skills: string;
    experience: string;
    education: string;
}

interface Gap {
    field: string;
    question: string;
}

interface TailorResult {
    sufficient: boolean;
    tailored_sections: TailoredSections;
    gaps: Gap[];
    insufficient_reason?: string;
}

interface Props {
    job: Job | null;
    open: boolean;
    onClose: () => void;
    sharedResume: File | null;
    onResumeShared: (f: File) => void;
}

// ─── Section Editor (Notion-style) ────────────────────────────────────────────

const EditableSection = ({
    title, content, onChange
}: { title: string; content: string; onChange: (v: string) => void }) => {
    const [editing, setEditing] = useState(false);
    const displayContent = typeof content === 'string'
        ? content
        : typeof content === 'object' && content !== null
            ? JSON.stringify(content, null, 2)
            : String(content || "");

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">{title}</h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-[#ADFF44] p-1 rounded"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </div>
            {editing ? (
                <Textarea
                    value={displayContent}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => setEditing(false)}
                    autoFocus
                    className="min-h-[100px] bg-neutral-900 border-[#ADFF44]/30 focus:ring-[#ADFF44]/40 text-neutral-200 text-sm font-mono resize-y rounded-xl p-3"
                />
            ) : (
                <div
                    className="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 cursor-text text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed transition-colors"
                    onClick={() => setEditing(true)}
                >
                    {displayContent || <span className="text-neutral-600 italic">Click to add content...</span>}
                </div>
            )}
        </div>
    );
};

// ─── Content Sanitizer ──────────────────────────────────────────────

const cleanContent = (text: string) => {
    if (!text) return "";
    return text
        // Clean degree/education markers
        .replace(/(degree|institute|cgpa|year|school|location|degree\/certificate|institute\/board|cgpa\/%):\s*/gi, "")
        // Clean experience markers
        .replace(/(title|company|role|dates|bullet_points|bullet):\s*/gi, "")
        // Remove structural characters that AI might leave
        .replace(/^[•\-\*]\s*/gm, "• ")
        .replace(/(\n• \n)/g, "\n")
        .trim();
};

// ─── PDF Generator (World-Class Two-Column Layout) ───────────────────────────

const generatePDF = async (sections: TailoredSections, jobTitle: string, company: string) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageW = 210;
    const pageH = 297;

    // ── Layout Constants ──────────────────────────────────────────────────────
    const sidebarW = 65;           // left dark sidebar width
    const mainX = sidebarW + 8;   // main content start X
    const mainW = pageW - mainX - 12; // main content width
    const sidebarPad = 8;          // sidebar inner padding
    const sideMargin = sidebarPad; // sidebar text left

    const DARK = [22, 32, 50] as const;       // sidebar bg (#162032)
    const ACCENT = [100, 190, 60] as const;   // green accent (#64BE3C)
    const WHITE = [255, 255, 255] as const;
    const LIGHT_GRAY = [180, 185, 195] as const;
    const BODY_DARK = [45, 50, 58] as const;
    const RULE_GRAY = [210, 215, 220] as const;

    // ── Draw Sidebar Background ───────────────────────────────────────────────
    doc.setFillColor(...DARK);
    doc.rect(0, 0, sidebarW, pageH, 'F');

    // ── SIDEBAR: Name Block ───────────────────────────────────────────────────
    let sy = 22; // sidebar y cursor

    // Accent top bar
    doc.setFillColor(...ACCENT);
    doc.rect(0, 0, sidebarW, 4, 'F');

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    const nameLines = doc.splitTextToSize('CANDIDATE', sidebarW - sidebarPad * 2);
    doc.text(nameLines, sideMargin, sy);
    sy += nameLines.length * 6.5 + 1;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...ACCENT);
    const titleLines = doc.splitTextToSize(jobTitle.toUpperCase(), sidebarW - sidebarPad * 2);
    doc.text(titleLines, sideMargin, sy);
    sy += titleLines.length * 4 + 10;

    // ── SIDEBAR: Section Helper ───────────────────────────────────────────────
    const sideSection = (heading: string, items: string[]) => {
        if (!items.length) return;
        // Section heading
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(heading.toUpperCase(), sideMargin, sy);
        sy += 3;
        // Heading underline
        doc.setDrawColor(...ACCENT);
        doc.setLineWidth(0.3);
        doc.line(sideMargin, sy, sidebarW - sidebarPad, sy);
        sy += 4;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...LIGHT_GRAY);
        for (const item of items) {
            if (!item.trim()) continue;
            const lines = doc.splitTextToSize('• ' + cleanContent(item), sidebarW - sidebarPad * 2);
            if (sy + lines.length * 4 > pageH - 12) break; // avoid overflow
            doc.text(lines, sideMargin, sy);
            sy += lines.length * 4.2 + 1;
        }
        sy += 5;
    };

    // ── SIDEBAR: Contact ──────────────────────────────────────────────────────
    sideSection('Contact', [
        `Email: candidate@email.com`,
        `LinkedIn: linkedin.com/in/candidate`,
        `Role Target: ${company}`,
    ]);

    // ── SIDEBAR: Core Skills (from skills section) ────────────────────────────
    const skillLines = cleanContent(sections.skills || '')
        .split('\n')
        .flatMap(l => l.split(/[,;•]/).map(s => s.replace(/^[\-\*•\s]+/, '').trim()))
        .filter(s => s.length > 1 && s.length < 40)
        .slice(0, 14);
    sideSection('Core Skills', skillLines.length ? skillLines : ['See main content']);

    // ── MAIN CONTENT: y cursor ────────────────────────────────────────────────
    let my = 18; // main content y cursor

    // Main content section helper
    const mainSection = (heading: string, rawContent: any) => {
        const content = typeof rawContent === 'string'
            ? cleanContent(rawContent)
            : JSON.stringify(rawContent, null, 2);
        if (!content || content.trim().length < 5) return;

        if (my > pageH - 25) { doc.addPage(); my = 15; }

        // Section heading
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        doc.text(heading.toUpperCase(), mainX, my);
        my += 2;

        // Underline rule
        doc.setDrawColor(...RULE_GRAY);
        doc.setLineWidth(0.25);
        doc.line(mainX, my, pageW - 12, my);
        my += 5;

        // Body text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BODY_DARK);
        const lines = doc.splitTextToSize(content, mainW);
        // Page overflow guard
        for (let i = 0; i < lines.length; i++) {
            if (my > pageH - 18) { doc.addPage(); my = 15; }
            doc.text(lines[i], mainX, my);
            my += 4.5;
        }
        my += 6;
    };

    // ── MAIN: Header ──────────────────────────────────────────────────────────
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...LIGHT_GRAY);
    doc.text(`Tailored Resume — ${jobTitle} at ${company}`, mainX, 10);
    my = 18;

    // ── MAIN: Sections ────────────────────────────────────────────────────────
    mainSection('Professional Summary', sections.summary);
    mainSection('Professional Experience', sections.experience);
    mainSection('Education & Certifications', sections.education);

    // ── FOOTER ────────────────────────────────────────────────────────────────
    doc.setFontSize(7);
    doc.setTextColor(160, 165, 175);
    doc.text('Generated by Koutuhal AI Career Forge', pageW / 2, pageH - 5, { align: 'center' });

    doc.save(`Resume_${jobTitle.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}.pdf`);
};


// ─── Main Panel ───────────────────────────────────────────────────────────────


const ResumeTailorPanel = ({ job, open, onClose, sharedResume, onResumeShared }: Props) => {
    const [step, setStep] = useState<'upload' | 'jd' | 'loading' | 'gaps' | 'editor'>('upload');
    const [jdText, setJdText] = useState('');
    const [result, setResult] = useState<TailorResult | null>(null);
    const [sections, setSections] = useState<TailoredSections>({ summary: '', skills: '', experience: '', education: '' });
    const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-fill JD from job card when panel opens
    const getAutoJd = useCallback(() => {
        if (!job) return '';
        const parts = [`Role: ${job.title}`, `Company: ${job.company}`, `Location: ${job.location}`, `Type: ${job.type} | ${job.mode}`, ''];
        if (job.description) parts.push('Description:', job.description);
        if (job.skills?.length) parts.push('', 'Required Skills:', job.skills.join(', '));
        return parts.join('\n');
    }, [job]);

    // Reset when job changes
    const handleOpen = useCallback(() => {
        const auto = getAutoJd();
        setJdText(auto);
        setError(null);
        setResult(null);
        setSections({ summary: '', skills: '', experience: '', education: '' });
        setGapAnswers({});
        setStep(sharedResume ? 'jd' : 'upload');
    }, [sharedResume, getAutoJd]);

    // Trigger reset on open
    useEffect(() => {
        if (open) {
            handleOpen();
        }
    }, [open, handleOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            onResumeShared(f);
            setStep('jd');
            setJdText(getAutoJd());
        }
    };

    const runTailor = async (extraContext = '') => {
        if (!sharedResume) return;
        setStep('loading');
        setError(null);

        const formData = new FormData();
        formData.append('resume', sharedResume);
        formData.append('jd_text', jdText + (extraContext ? `\n\nAdditional context from candidate:\n${extraContext}` : ''));

        try {
            const res = await fetch('/api/v1/ai/tailor-resume-quick', { method: 'POST', body: formData });
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                throw new Error(e.detail || 'Tailoring failed');
            }
            const data: TailorResult = await res.json();
            setResult(data);

            if (!data.sufficient && data.gaps.length > 0) {
                setStep('gaps');
            } else {
                setSections(data.tailored_sections);
                if (data.insufficient_reason) {
                    setStep('gaps');
                } else {
                    setStep('editor');
                }
            }
        } catch (err: any) {
            setError(err.message);
            setStep('jd');
        }
    };

    const submitGapAnswers = () => {
        const extra = Object.entries(gapAnswers)
            .map(([field, answer]) => `${field}: ${answer}`)
            .join('\n');
        runTailor(extra);
    };

    if (!open || !job) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-neutral-800 bg-neutral-900/80">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Wand2 className="w-5 h-5 text-[#ADFF44]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#ADFF44]">Resume Tailor</span>
                                </div>
                                <h2 className="text-lg font-bold text-white leading-tight">{job.title}</h2>
                                <p className="text-sm text-neutral-500">{job.company} · {job.location}</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-800 transition mt-1">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Progress steps */}
                        <div className="flex border-b border-neutral-800 bg-neutral-900/50">
                            {[
                                { key: 'upload', label: 'Resume' },
                                { key: 'jd', label: 'JD' },
                                { key: 'editor', label: 'Edit' },
                            ].map((s, i, arr) => {
                                const steps = ['upload', 'jd', 'loading', 'gaps', 'editor'];
                                const cur = steps.indexOf(step);
                                const sIdx = steps.indexOf(s.key);
                                const done = cur > sIdx;
                                const active = s.key === step || (s.key === 'editor' && (step === 'gaps' || step === 'loading'));
                                return (
                                    <div key={s.key} className="flex-1 flex items-center justify-center py-3 text-xs font-semibold relative">
                                        <span className={`${done ? 'text-[#ADFF44]' : active ? 'text-white' : 'text-neutral-600'} transition-colors`}>
                                            {done ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : `${i + 1}. `}{s.label}
                                        </span>
                                        {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-neutral-700 absolute right-0" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* STEP: Upload */}
                            {step === 'upload' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                                    <div
                                        className="w-full border-2 border-dashed border-neutral-700 rounded-2xl p-10 flex flex-col items-center gap-4 hover:border-[#ADFF44]/40 hover:bg-neutral-900/60 transition-all cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700">
                                            <Upload className="w-7 h-7 text-[#ADFF44]" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">Upload Your Resume</p>
                                            <p className="text-neutral-500 text-sm mt-1">PDF, DOCX, or TXT</p>
                                        </div>
                                        <Button className="bg-[#ADFF44] text-black font-bold hover:bg-[#9BE63D] px-8 mt-2">Browse Files</Button>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileSelect} />
                                </motion.div>
                            )}

                            {/* STEP: JD Review */}
                            {step === 'jd' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl">
                                        <FileText className="w-4 h-4 text-[#ADFF44] flex-shrink-0" />
                                        <p className="text-sm text-neutral-300">
                                            Resume: <span className="text-white font-medium">{sharedResume?.name}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Job Description</Label>
                                        <Textarea
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                            className="min-h-[320px] font-mono text-sm bg-neutral-900 border-neutral-800 focus:ring-[#ADFF44]/40 text-neutral-200 rounded-xl resize-none"
                                            placeholder="Paste or edit the job description here..."
                                        />
                                        <p className="text-xs text-neutral-600">Auto-filled from job card. Edit freely before tailoring.</p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP: Loading */}
                            {step === 'loading' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-24 space-y-6 text-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full border-4 border-neutral-800" />
                                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-[#ADFF44] animate-spin" />
                                        <Wand2 className="absolute inset-0 m-auto w-7 h-7 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Tailoring Your Resume</h3>
                                        <p className="text-neutral-500 text-sm mt-1">AI is analysing & rewriting sections...</p>
                                        <p className="text-neutral-600 text-xs mt-2">Only using content from your resume — no hallucinations.</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP: Gap Questions */}
                            {step === 'gaps' && result?.gaps?.length && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CircleHelp className="w-4 h-4 text-amber-400" />
                                            <h3 className="text-amber-400 font-bold text-sm">Resume Needs More Info</h3>
                                        </div>
                                        <p className="text-neutral-400 text-sm">Your resume is a bit sparse for this role. Answer these questions to get a better-tailored result:</p>
                                    </div>

                                    {result.gaps.map((gap, i) => (
                                        <div key={i} className="space-y-2">
                                            <Label className="text-sm font-semibold text-white">{gap.question}</Label>
                                            <Textarea
                                                placeholder="Your answer..."
                                                className="min-h-[80px] bg-neutral-900 border-neutral-800 focus:ring-[#ADFF44]/40 text-neutral-200 text-sm resize-none rounded-xl"
                                                value={gapAnswers[gap.field] || ''}
                                                onChange={(e) => setGapAnswers(prev => ({ ...prev, [gap.field]: e.target.value }))}
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* STEP: Editor */}
                            {step === 'editor' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="p-3 bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl text-xs text-neutral-400 flex items-center gap-2">
                                        <Pencil className="w-3.5 h-3.5 text-[#ADFF44]" />
                                        Click any section to edit it directly. AI only used your original resume content.
                                    </div>

                                    {(['summary', 'skills', 'experience', 'education'] as const).map(key => (
                                        <EditableSection
                                            key={key}
                                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                                            content={sections[key]}
                                            onChange={(v) => setSections(prev => ({ ...prev, [key]: v }))}
                                        />
                                    ))}
                                </motion.div>
                            )}

                        </div>

                        {/* Footer actions */}
                        <div className="border-t border-neutral-800 bg-neutral-900/80 p-4 space-y-2">
                            {step === 'jd' && (
                                <Button
                                    className="w-full bg-[#ADFF44] text-black font-black py-6 text-base hover:bg-[#9BE63D] rounded-xl disabled:opacity-40"
                                    onClick={() => runTailor()}
                                    disabled={!jdText.trim()}
                                >
                                    <Wand2 className="w-5 h-5 mr-2" /> Tailor My Resume with AI
                                </Button>
                            )}

                            {step === 'gaps' && (
                                <Button
                                    className="w-full bg-[#ADFF44] text-black font-black py-6 text-base hover:bg-[#9BE63D] rounded-xl"
                                    onClick={submitGapAnswers}
                                >
                                    <Wand2 className="w-5 h-5 mr-2" /> Generate Tailored Resume
                                </Button>
                            )}

                            {step === 'editor' && (
                                <Button
                                    className="w-full bg-white text-black font-black py-6 text-base hover:bg-neutral-200 rounded-xl"
                                    onClick={() => generatePDF(sections, job.title, job.company)}
                                >
                                    <Download className="w-5 h-5 mr-2" /> Download as PDF
                                </Button>
                            )}

                            {(step === 'jd' || step === 'editor') && (
                                <Button variant="ghost" onClick={onClose} className="w-full text-neutral-600 hover:text-neutral-400">
                                    Close
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ResumeTailorPanel;
