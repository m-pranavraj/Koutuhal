import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Job } from '@/types';
import {
    X, Upload, Loader2, Download, CheckCircle, Wand2,
    CircleHelp, ChevronRight, FileText, Pencil, LayoutTemplate,
    Sparkles, Plus, Check, AlertTriangle, Copy, RefreshCw
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
    jd_required_skills?: string[];
    ai_suggestions?: string[];
}

interface Props {
    job: Job | null;
    open: boolean;
    onClose: () => void;
    sharedResume: File | null;
    onResumeShared: (f: File) => void;
}

// ─── Resume Templates ─────────────────────────────────────────────────────────

const RESUME_TEMPLATES = [
    {
        id: 'modern',
        name: 'Modern Pro',
        description: 'Dark sidebar with accent color headers',
        colors: { sidebar: '#162032', accent: '#64BE3C', text: '#2D323A' },
        preview: ['#162032', '#64BE3C', '#F5F7FA'],
        badge: 'Most Popular'
    },
    {
        id: 'classic',
        name: 'Classic ATS',
        description: 'Clean single-column, ATS-optimized',
        colors: { sidebar: '#1A1A2E', accent: '#4A90D9', text: '#222222' },
        preview: ['#FFFFFF', '#4A90D9', '#F0F4F8'],
        badge: 'ATS Friendly'
    },
    {
        id: 'minimal',
        name: 'Minimal Elite',
        description: 'Pure white with thin typography',
        colors: { sidebar: '#F8F9FA', accent: '#2C3E50', text: '#1A1A1A' },
        preview: ['#FAFAFA', '#2C3E50', '#ECF0F1'],
        badge: 'Premium'
    },
    {
        id: 'creative',
        name: 'Creative Edge',
        description: 'Bold color blocks for creative roles',
        colors: { sidebar: '#6C3483', accent: '#F39C12', text: '#1A1A1A' },
        preview: ['#6C3483', '#F39C12', '#FAFAFA'],
        badge: 'Creative'
    }
];

// ─── Section Editor ────────────────────────────────────────────────────────────

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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { navigator.clipboard.writeText(displayContent); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-blue-400 p-1 rounded"
                        title="Copy"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-[#ADFF44] p-1 rounded"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                </div>
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
        .replace(/(degree|institute|cgpa|year|school|location|degree\/certificate|institute\/board|cgpa\/%): */gi, "")
        .replace(/(title|company|role|dates|bullet_points|bullet): */gi, "")
        .replace(/^[•\-\*]\s*/gm, "• ")
        .replace(/(\n• \n)/g, "\n")
        .trim();
};

// ─── PDF Generator ────────────────────────────────────────────────────────────

const generatePDF = async (
    sections: TailoredSections,
    jobTitle: string,
    company: string,
    templateId: string
) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const template = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0];
    const pageW = 210;
    const pageH = 297;

    if (templateId === 'classic') {
        // Single column ATS layout
        const margin = 18;
        const contentW = pageW - margin * 2;
        let y = 20;

        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b] as const;
        };

        const accentRgb = hexToRgb(template.colors.accent);
        const textRgb = hexToRgb(template.colors.text);

        doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textRgb);
        doc.text('CANDIDATE NAME', margin, y); y += 7;

        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...accentRgb);
        doc.text(jobTitle, margin, y); y += 10;

        const drawSection = (heading: string, content: string) => {
            if (!content?.trim()) return;
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentRgb);
            doc.text(heading.toUpperCase(), margin, y); y += 2;
            doc.setDrawColor(...accentRgb); doc.setLineWidth(0.3);
            doc.line(margin, y, pageW - margin, y); y += 5;
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textRgb);
            const lines = doc.splitTextToSize(cleanContent(content), contentW);
            for (const line of lines) {
                if (y > pageH - 15) { doc.addPage(); y = 15; }
                doc.text(line, margin, y); y += 4.5;
            }
            y += 5;
        };
        drawSection('Professional Summary', sections.summary);
        drawSection('Skills', sections.skills);
        drawSection('Experience', sections.experience);
        drawSection('Education', sections.education);

    } else {
        // Two-column layout (Modern / Minimal / Creative)
        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b] as const;
        };

        const sidebarW = 65;
        const mainX = sidebarW + 8;
        const mainW = pageW - mainX - 12;
        const sidebarPad = 8;

        const DARK = hexToRgb(template.colors.sidebar);
        const ACCENT = hexToRgb(template.colors.accent);
        const WHITE = [255, 255, 255] as const;
        const LIGHT_GRAY = [180, 185, 195] as const;
        const BODY_DARK = hexToRgb(template.colors.text);
        const RULE_GRAY = [210, 215, 220] as const;

        doc.setFillColor(...DARK);
        doc.rect(0, 0, sidebarW, pageH, 'F');

        doc.setFillColor(...ACCENT);
        doc.rect(0, 0, sidebarW, 4, 'F');

        let sy = 22;
        doc.setFontSize(15); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...WHITE);
        const nameLines = doc.splitTextToSize('CANDIDATE', sidebarW - sidebarPad * 2);
        doc.text(nameLines, sidebarPad, sy);
        sy += nameLines.length * 6.5 + 1;

        doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...ACCENT);
        const titleLines = doc.splitTextToSize(jobTitle.toUpperCase(), sidebarW - sidebarPad * 2);
        doc.text(titleLines, sidebarPad, sy);
        sy += titleLines.length * 4 + 10;

        const sideSection = (heading: string, items: string[]) => {
            if (!items.length) return;
            doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
            doc.setTextColor(...ACCENT);
            doc.text(heading.toUpperCase(), sidebarPad, sy); sy += 3;
            doc.setDrawColor(...ACCENT); doc.setLineWidth(0.3);
            doc.line(sidebarPad, sy, sidebarW - sidebarPad, sy); sy += 4;
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.setTextColor(...LIGHT_GRAY);
            for (const item of items) {
                if (!item.trim()) continue;
                const lines = doc.splitTextToSize('• ' + cleanContent(item), sidebarW - sidebarPad * 2);
                if (sy + lines.length * 4 > pageH - 12) break;
                doc.text(lines, sidebarPad, sy);
                sy += lines.length * 4.2 + 1;
            }
            sy += 5;
        };

        sideSection('Contact', [`Email: candidate@email.com`, `Role: ${company}`]);
        const skillLines = cleanContent(sections.skills || '')
            .split('\n').flatMap(l => l.split(/[,;•]/).map(s => s.replace(/^[\-\*•\s]+/, '').trim()))
            .filter(s => s.length > 1 && s.length < 40).slice(0, 14);
        sideSection('Core Skills', skillLines.length ? skillLines : ['See main content']);

        let my = 18;
        doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...LIGHT_GRAY);
        doc.text(`Tailored Resume — ${jobTitle} at ${company}`, mainX, 10);
        my = 18;

        const mainSection = (heading: string, rawContent: any) => {
            const content = typeof rawContent === 'string' ? cleanContent(rawContent) : JSON.stringify(rawContent, null, 2);
            if (!content || content.trim().length < 5) return;
            if (my > pageH - 25) { doc.addPage(); my = 15; }
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.setTextColor(...BODY_DARK);
            doc.text(heading.toUpperCase(), mainX, my); my += 2;
            doc.setDrawColor(...RULE_GRAY); doc.setLineWidth(0.25);
            doc.line(mainX, my, pageW - 12, my); my += 5;
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.setTextColor(...BODY_DARK);
            const lines = doc.splitTextToSize(content, mainW);
            for (let i = 0; i < lines.length; i++) {
                if (my > pageH - 18) { doc.addPage(); my = 15; }
                doc.text(lines[i], mainX, my); my += 4.5;
            }
            my += 6;
        };
        mainSection('Professional Summary', sections.summary);
        mainSection('Professional Experience', sections.experience);
        mainSection('Education & Certifications', sections.education);
    }

    doc.setFontSize(7); doc.setTextColor(160, 165, 175);
    doc.text('Generated by Koutuhal AI Career Forge', pageW / 2, pageH - 5, { align: 'center' });
    doc.save(`Resume_${template.name}_${jobTitle.replace(/\s+/g, '_')}.pdf`);
};


// ─── Main Panel ───────────────────────────────────────────────────────────────

const ResumeTailorPanel = ({ job, open, onClose, sharedResume, onResumeShared }: Props) => {
    const [step, setStep] = useState<'upload' | 'template' | 'jd' | 'loading' | 'gaps' | 'editor'>('upload');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
    const [jdText, setJdText] = useState('');
    const [result, setResult] = useState<TailorResult | null>(null);
    const [sections, setSections] = useState<TailoredSections>({ summary: '', skills: '', experience: '', education: '' });
    const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [checkedSuggestions, setCheckedSuggestions] = useState<Set<number>>(new Set());
    const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAutoJd = useCallback(() => {
        if (!job) return '';
        const parts = [`Role: ${job.title}`, `Company: ${job.company}`, `Location: ${job.location}`, `Type: ${job.type} | ${job.mode}`, ''];
        if (job.description) parts.push('Description:', job.description);
        if (job.skills?.length) parts.push('', 'Required Skills:', job.skills.join(', '));
        return parts.join('\n');
    }, [job]);

    const handleOpen = useCallback(() => {
        const auto = getAutoJd();
        setJdText(auto);
        setError(null);
        setResult(null);
        setSections({ summary: '', skills: '', experience: '', education: '' });
        setGapAnswers({});
        setCheckedSuggestions(new Set());
        setAddedSkills(new Set());
        setStep(sharedResume ? 'template' : 'upload');
    }, [sharedResume, getAutoJd]);

    useEffect(() => {
        if (open) handleOpen();
    }, [open, handleOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) { onResumeShared(f); setStep('template'); setJdText(getAutoJd()); }
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
                if (data.insufficient_reason) { setStep('gaps'); }
                else { setStep('editor'); }
            }
        } catch (err: any) {
            setError(err.message);
            setStep('jd');
        }
    };

    const submitGapAnswers = () => {
        const extra = Object.entries(gapAnswers).map(([field, answer]) => `${field}: ${answer}`).join('\n');
        runTailor(extra);
    };

    const addSkillToSections = (skill: string) => {
        setSections(prev => ({
            ...prev,
            skills: prev.skills ? prev.skills + `\n• ${skill}` : `• ${skill}`
        }));
        setAddedSkills(prev => new Set([...prev, skill]));
    };

    const toggleSuggestion = (idx: number) => {
        setCheckedSuggestions(prev => {
            const n = new Set(prev);
            if (n.has(idx)) n.delete(idx);
            else n.add(idx);
            return n;
        });
    };

    if (!open || !job) return null;

    const stepOrder = ['upload', 'template', 'jd', 'loading', 'gaps', 'editor'];

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-5 border-b border-neutral-800 bg-neutral-900/80">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Wand2 className="w-5 h-5 text-[#ADFF44]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#ADFF44]">AI Resume Tailor</span>
                                </div>
                                <h2 className="text-lg font-bold text-white leading-tight">{job.title}</h2>
                                <p className="text-sm text-neutral-500">{job.company} · {job.location}</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-800 transition mt-1">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex border-b border-neutral-800 bg-neutral-900/50 text-[10px]">
                            {[
                                { key: 'upload', label: 'Resume' },
                                { key: 'template', label: 'Template' },
                                { key: 'jd', label: 'JD + Skills' },
                                { key: 'editor', label: 'Edit & Export' },
                            ].map((s, i, arr) => {
                                const cur = stepOrder.indexOf(step);
                                const sIdx = stepOrder.indexOf(s.key);
                                const done = cur > sIdx;
                                const active = s.key === step || (s.key === 'editor' && (step === 'gaps' || step === 'loading'));
                                return (
                                    <div key={s.key} className="flex-1 flex items-center justify-center py-3 font-bold relative">
                                        <span className={`${done ? 'text-[#ADFF44]' : active ? 'text-white' : 'text-neutral-600'} transition-colors flex items-center gap-1`}>
                                            {done ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}.</span>}{s.label}
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
                                            <p className="text-neutral-500 text-sm mt-1">PDF, DOCX, or TXT — AI will read and tailor it</p>
                                        </div>
                                        <Button className="bg-[#ADFF44] text-black font-bold hover:bg-[#9BE63D] px-8 mt-2">Browse Files</Button>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileSelect} />
                                </motion.div>
                            )}

                            {/* STEP: Template Picker */}
                            {step === 'template' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                    <div>
                                        <h3 className="text-white font-bold text-base flex items-center gap-2 mb-1">
                                            <LayoutTemplate className="w-4 h-4 text-[#ADFF44]" /> Choose Your Resume Template
                                        </h3>
                                        <p className="text-neutral-500 text-xs">The tailored content will be exported using this layout.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {RESUME_TEMPLATES.map((tmpl) => (
                                            <button
                                                key={tmpl.id}
                                                onClick={() => setSelectedTemplate(tmpl.id)}
                                                className={`relative rounded-2xl border-2 p-4 text-left transition-all group ${selectedTemplate === tmpl.id ? 'border-[#ADFF44] bg-[#ADFF44]/5' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/40'}`}
                                            >
                                                {/* Template Preview */}
                                                <div className="flex gap-1 mb-3 h-16 rounded-xl overflow-hidden">
                                                    <div className="w-1/3 rounded-l-lg" style={{ background: tmpl.preview[0] }} />
                                                    <div className="flex-1 flex flex-col gap-1 p-2" style={{ background: tmpl.preview[2] }}>
                                                        <div className="h-2 rounded w-3/4" style={{ background: tmpl.preview[1] }} />
                                                        <div className="h-1.5 rounded w-full bg-gray-300/40" />
                                                        <div className="h-1.5 rounded w-5/6 bg-gray-300/40" />
                                                        <div className="h-1.5 rounded w-4/6 bg-gray-300/40" />
                                                    </div>
                                                </div>

                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{tmpl.name}</p>
                                                        <p className="text-neutral-500 text-[10px] mt-0.5">{tmpl.description}</p>
                                                    </div>
                                                    {selectedTemplate === tmpl.id && (
                                                        <CheckCircle className="w-4 h-4 text-[#ADFF44] shrink-0 mt-0.5" />
                                                    )}
                                                </div>

                                                <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ADFF44]/10 text-[#ADFF44]">
                                                    {tmpl.badge}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {sharedResume && (
                                        <div className="flex items-center gap-2 p-3 bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl">
                                            <FileText className="w-4 h-4 text-[#ADFF44] flex-shrink-0" />
                                            <p className="text-sm text-neutral-300">
                                                Resume: <span className="text-white font-medium">{sharedResume.name}</span>
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP: JD + Skills */}
                            {step === 'jd' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                    <div className="flex items-center gap-2 p-3 bg-[#ADFF44]/5 border border-[#ADFF44]/15 rounded-xl">
                                        <FileText className="w-4 h-4 text-[#ADFF44] flex-shrink-0" />
                                        <p className="text-sm text-neutral-300">
                                            Resume: <span className="text-white font-medium">{sharedResume?.name}</span>
                                            <span className="ml-2 text-[10px] px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
                                                Template: {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Job Description</Label>
                                        <Textarea
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                            className="min-h-[280px] font-mono text-sm bg-neutral-900 border-neutral-800 focus:ring-[#ADFF44]/40 text-neutral-200 rounded-xl resize-none"
                                        />
                                        <p className="text-xs text-neutral-600">Auto-filled from job card. Edit freely before tailoring.</p>
                                    </div>

                                    {/* JD Skills Quick-add */}
                                    {job?.skills && job.skills.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-[#ADFF44]" /> Required Skills from JD
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {job.skills.slice(0, 16).map((skill, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:border-[#ADFF44]/40 hover:text-[#ADFF44] transition-all"
                                                    >
                                                        + {skill}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-neutral-600">These will be prioritized during AI tailoring.</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
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
                                        <p className="text-neutral-500 text-sm mt-1">AI is reading and rewriting for {job.title} at {job.company}...</p>
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
                                        <p className="text-neutral-400 text-sm">Your resume is a bit sparse for this role. Answer these to get a better result:</p>
                                    </div>

                                    {result.gaps.map((gap, i) => (
                                        <div key={i} className="space-y-2">
                                            <Label className="text-sm font-semibold text-white">{gap.question}</Label>
                                            <Textarea
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
                                        Click any section to edit. Hover to copy. AI only used your original resume content.
                                    </div>

                                    {/* JD-Required Skills Quick Add */}
                                    {result?.jd_required_skills && result.jd_required_skills.length > 0 && (
                                        <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" /> JD-Required Skills — Add to Resume
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.jd_required_skills.map((skill, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => addSkillToSections(skill)}
                                                        disabled={addedSkills.has(skill)}
                                                        className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                                                            addedSkills.has(skill)
                                                                ? 'border-[#ADFF44]/30 bg-[#ADFF44]/10 text-[#ADFF44] cursor-default'
                                                                : 'border-blue-500/20 bg-blue-500/5 text-blue-300 hover:border-blue-400/40 hover:bg-blue-500/10'
                                                        }`}
                                                    >
                                                        {addedSkills.has(skill) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                        {skill}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Suggestions Checklist */}
                                    {result?.ai_suggestions && result.ai_suggestions.length > 0 && (
                                        <div className="space-y-3 p-4 bg-[#ADFF44]/5 border border-[#ADFF44]/10 rounded-2xl">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-[#ADFF44] flex items-center gap-1.5">
                                                <Wand2 className="w-3.5 h-3.5" /> AI Improvement Suggestions
                                            </h4>
                                            <div className="space-y-2">
                                                {result.ai_suggestions.map((sug, i) => (
                                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                                        <div
                                                            className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                                                                checkedSuggestions.has(i)
                                                                    ? 'bg-[#ADFF44] border-[#ADFF44]'
                                                                    : 'border-neutral-600 group-hover:border-[#ADFF44]/50'
                                                            }`}
                                                            onClick={() => toggleSuggestion(i)}
                                                        >
                                                            {checkedSuggestions.has(i) && <Check className="w-2.5 h-2.5 text-black" />}
                                                        </div>
                                                        <span className={`text-xs leading-relaxed ${checkedSuggestions.has(i) ? 'text-[#ADFF44] line-through opacity-60' : 'text-neutral-300'}`}>
                                                            {sug}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Editable Sections */}
                                    {(['summary', 'skills', 'experience', 'education'] as const).map(key => (
                                        <EditableSection
                                            key={key}
                                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                                            content={sections[key]}
                                            onChange={(v) => setSections(prev => ({ ...prev, [key]: v }))}
                                        />
                                    ))}

                                    {/* Retailor button */}
                                    <button
                                        type="button"
                                        onClick={() => runTailor()}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-800 text-xs text-neutral-500 hover:text-white hover:border-neutral-600 transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Re-tailor with AI
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-neutral-800 bg-neutral-900/80 p-4 space-y-2">
                            {step === 'upload' && (
                                <p className="text-center text-xs text-neutral-600">Upload a resume to begin</p>
                            )}

                            {step === 'template' && (
                                <Button
                                    className="w-full bg-[#ADFF44] text-black font-black py-6 text-base hover:bg-[#9BE63D] rounded-xl"
                                    onClick={() => setStep('jd')}
                                >
                                    <ChevronRight className="w-5 h-5 mr-2" /> Continue with {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                </Button>
                            )}

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
                                    onClick={() => generatePDF(sections, job.title, job.company, selectedTemplate)}
                                >
                                    <Download className="w-5 h-5 mr-2" /> Download as PDF ({RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name})
                                </Button>
                            )}

                            {(step === 'jd' || step === 'editor' || step === 'template') && (
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
