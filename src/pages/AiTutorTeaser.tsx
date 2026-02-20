import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Brain, Sparkles, Zap, BookOpen, MessageSquare, Mic, Video,
    BarChart3, Clock, Star, Users, ArrowRight, Check, ChevronDown,
    Lightbulb, Target, TrendingUp, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/* ── Floating Particle ────────────── */
const Particle = ({ delay = 0, x = 0, size = 4 }: { delay?: number; x?: number; size?: number }) => (
    <motion.div
        className="absolute rounded-full bg-[#ADFF44]/20 pointer-events-none"
        style={{ width: size, height: size, left: `${x}%`, bottom: 0 }}
        animate={{ y: [0, -600], opacity: [0, 0.8, 0] }}
        transition={{ duration: 6 + Math.random() * 4, delay, repeat: Infinity, ease: 'easeOut' }}
    />
);

/* ── Feature Card ─────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }: {
    icon: any; title: string; desc: string; color: string; delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="relative group bg-neutral-900/60 border border-neutral-800 hover:border-[#ADFF44]/40 rounded-2xl p-6 overflow-hidden transition-all duration-300"
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} rounded-2xl`} />
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 flex items-center justify-center mb-4 group-hover:bg-[#ADFF44]/20 transition-colors">
                <Icon className="w-6 h-6 text-[#ADFF44]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);

/* ── Stat Ticker ──────────────────── */
const StatTicker = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
        <div className="text-3xl md:text-4xl font-black text-[#ADFF44] tabular-nums">{value}</div>
        <div className="text-neutral-400 text-xs mt-1 font-medium tracking-wide">{label}</div>
    </div>
);

/* ── Main Page ────────────────────── */
const AiTutorTeaser = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [joined, setJoined] = useState(false);
    const [waitlistCount, setWaitlistCount] = useState(847);
    const [activeFeature, setActiveFeature] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const features = [
        { icon: Brain, title: 'Adaptive Learning Engine', desc: 'AI that learns your pace, style and gaps — and adjusts in real time. No two sessions are the same.', color: 'from-purple-500/5 to-transparent', delay: 0 },
        { icon: MessageSquare, title: 'Conversational Tutoring', desc: 'Ask anything. Get instant, context-aware explanations — not search results. Real understanding, fast.', color: 'from-blue-500/5 to-transparent', delay: 0.1 },
        { icon: Video, title: 'Smart Video + Slides', desc: 'Upload lectures, YouTube links, or slides. Your AI tutor masters the content and quizzes you on it.', color: 'from-[#ADFF44]/5 to-transparent', delay: 0.2 },
        { icon: Mic, title: 'Voice Interaction', desc: 'Speak your questions naturally. Practice verbal answers for interviews or presentations out loud.', color: 'from-orange-500/5 to-transparent', delay: 0.3 },
        { icon: BarChart3, title: 'Deep Progress Analytics', desc: 'See where you\'re strong and where you drift. Weekly insights that actually change how you study.', color: 'from-cyan-500/5 to-transparent', delay: 0.4 },
        { icon: Target, title: 'Goal-Based Roadmaps', desc: 'Tell us your goal (interview, exam, new skill). Your AI builds a custom study plan and tracks it.', color: 'from-pink-500/5 to-transparent', delay: 0.5 },
    ];

    const liveFeatureLabels = [
        'Understanding your question...',
        'Searching knowledge base...',
        'Generating personalized answer...',
        'Ready!',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(p => (p + 1) % liveFeatureLabels.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    const handleWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !name.trim()) {
            toast.error('Please fill in both your name and email.');
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.from('waitlist').insert([{
                name: name.trim(),
                email: email.trim().toLowerCase(),
                product: 'ai_tutor',
                created_at: new Date().toISOString(),
            }]);

            if (error) {
                if (error.code === '23505') {
                    toast.info("You're already on the list! We'll be in touch soon. 🚀");
                } else {
                    throw error;
                }
            } else {
                setJoined(true);
                setWaitlistCount(c => c + 1);
                toast.success("You're on the waitlist! Expect an early-access invite. 🎉");
            }
        } catch (err: any) {
            toast.error('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* ── Background glow ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ADFF44]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* ── Floating particles ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <Particle key={i} delay={i * 0.7} x={8 + i * 8} size={3 + (i % 3)} />
                ))}
            </div>

            {/* ══════════════ HERO ══════════════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-[#ADFF44]/10 border border-[#ADFF44]/30 text-[#ADFF44] px-4 py-2 rounded-full text-sm font-semibold mb-8"
                    >
                        <span className="w-2 h-2 bg-[#ADFF44] rounded-full animate-pulse" />
                        Coming Soon · Join the Waitlist
                        <span className="w-2 h-2 bg-[#ADFF44] rounded-full animate-pulse" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-6"
                    >
                        <span className="block text-white">Meet Your</span>
                        <span className="block bg-gradient-to-r from-[#ADFF44] via-[#c8ff7a] to-[#ADFF44] bg-clip-text text-transparent">
                            AI Tutor
                        </span>
                        <span className="block text-white text-4xl md:text-5xl lg:text-6xl mt-2 font-bold">
                            That Never Sleeps
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        An AI-powered personal tutor that adapts to how <em className="text-white not-italic font-semibold">you</em> learn.
                        Upload any content. Ask anything. Master it — at 10× the speed.
                    </motion.p>

                    {/* Mock AI status indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="inline-flex items-center gap-3 bg-neutral-900/80 border border-neutral-700 rounded-xl px-5 py-3 mb-12 backdrop-blur-sm"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-[#ADFF44] rounded-full"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                                />
                            ))}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={activeFeature}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-sm text-neutral-300 font-medium"
                            >
                                {liveFeatureLabels[activeFeature]}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>

                    {/* CTA Scroll */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <p className="text-neutral-500 text-sm">Scroll to explore • Join waitlist below</p>
                        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <ChevronDown className="w-5 h-5 text-neutral-600" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ══════════════ STATS ══════════════ */}
            <section className="py-16 px-4 border-y border-neutral-800/50">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: `${waitlistCount.toLocaleString()}+`, label: 'On Waitlist' },
                        { value: '10×', label: 'Faster Learning' },
                        { value: '24/7', label: 'Always Available' },
                        { value: 'Q2 2025', label: 'Early Access Launch' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <StatTicker {...s} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ══════════════ FEATURES ══════════════ */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#ADFF44] text-sm font-bold tracking-widest uppercase mb-4">What's Coming</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            The tutor you always<br />
                            <span className="text-[#ADFF44]">wished you had</span>
                        </h2>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Every feature built around one obsession: making <em className="text-white not-italic font-semibold">you</em> genuinely smarter, faster.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <section className="py-24 px-4 bg-neutral-950/50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#ADFF44] text-sm font-bold tracking-widest uppercase mb-4">How It Works</p>
                        <h2 className="text-4xl font-black text-white">Learn like a pro. <span className="text-[#ADFF44]">Effortlessly.</span></h2>
                    </motion.div>

                    <div className="relative">
                        {/* Connecting line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#ADFF44]/50 via-[#ADFF44]/20 to-transparent hidden md:block" />

                        {[
                            { icon: BookOpen, step: '01', title: 'Upload Your Content', desc: 'Upload lecture videos, PDFs, slides or paste a YouTube link. Your AI tutor processes everything instantly.' },
                            { icon: Brain, step: '02', title: 'AI Mastery Mode', desc: 'The AI deeply understands your content — not just keywords. It knows concepts, relationships and context.' },
                            { icon: MessageSquare, step: '03', title: 'Ask, Learn, Master', desc: 'Ask anything. Get clear explanations at your level. Quiz yourself. Master concepts through conversation.' },
                            { icon: TrendingUp, step: '04', title: 'Track Your Growth', desc: 'See real skill gains in your dashboard. Get AI-generated study plans to hit your next milestone.' },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse md:text-right'}`}
                            >
                                <div className="flex-1 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-[#ADFF44]/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#ADFF44]/10 flex items-center justify-center">
                                            <step.icon className="w-5 h-5 text-[#ADFF44]" />
                                        </div>
                                        <span className="text-[#ADFF44]/50 text-sm font-black tracking-widest">{step.step}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ TESTIMONIALS PREVIEW ══════════════ */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-neutral-500 text-sm mb-12 font-medium tracking-wide uppercase"
                    >
                        What beta testers are saying
                    </motion.p>
                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { name: 'Arjun R.', role: 'Engineering Student', text: 'I understood circuits theory in 2 hours that my professor took 2 weeks to explain. This is insane.', stars: 5 },
                            { name: 'Priya M.', role: 'UPSC Aspirant', text: 'The adaptive quizzing alone is worth it. It knows exactly what I keep getting wrong and drills those spots.', stars: 5 },
                            { name: 'Rohan S.', role: 'Software Engineer', text: 'I uploaded a React docs and asked for a roadmap to learn advanced patterns. Got a perfect plan in seconds.', stars: 5 },
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-[#ADFF44] fill-[#ADFF44]" />)}
                                </div>
                                <p className="text-neutral-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t.name}</p>
                                    <p className="text-neutral-500 text-xs">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ WAITLIST ══════════════ */}
            <section id="waitlist" className="py-24 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-neutral-900/80 border border-neutral-700 rounded-3xl p-8 md:p-12 relative overflow-hidden backdrop-blur-sm"
                    >
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[#ADFF44] to-transparent" />
                        <div className="absolute inset-0 bg-[#ADFF44]/2 rounded-3xl" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-[#ADFF44]/10 border border-[#ADFF44]/30 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-[#ADFF44]" />
                            </div>

                            <p className="text-[#ADFF44] text-sm font-bold tracking-widest uppercase mb-3">
                                {waitlistCount.toLocaleString()}+ already joined
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                                Get Early Access
                            </h2>
                            <p className="text-neutral-400 mb-8 leading-relaxed">
                                Be among the first to experience AI Tutor. Early members get <strong className="text-white">3 months free</strong> and shape the product.
                            </p>

                            <AnimatePresence mode="wait">
                                {!joined ? (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleWaitlist}
                                        className="space-y-3"
                                    >
                                        <Input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#ADFF44]/50 h-12 rounded-xl"
                                            disabled={submitting}
                                        />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#ADFF44]/50 h-12 rounded-xl"
                                            disabled={submitting}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-12 bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold rounded-xl text-sm tracking-wide transition-all hover:shadow-[0_0_30px_rgba(173,255,68,0.4)] disabled:opacity-60"
                                        >
                                            {submitting ? 'Joining...' : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Join the Waitlist <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                        <p className="text-neutral-600 text-xs mt-2">No spam. Unsubscribe anytime. 🔒</p>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-8 flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#ADFF44]/20 border-2 border-[#ADFF44] flex items-center justify-center">
                                            <Check className="w-8 h-8 text-[#ADFF44]" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white">You're In! 🎉</h3>
                                        <p className="text-neutral-400 text-sm max-w-sm">
                                            We'll send your early access invite to <strong className="text-white">{email}</strong> when we launch. You're #{waitlistCount}.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Social proof row */}
                            <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-center gap-6 flex-wrap">
                                {[
                                    { icon: Lock, text: 'Privacy First' },
                                    { icon: Zap, text: 'Early Access' },
                                    { icon: Users, text: 'Community Access' },
                                ].map((b, i) => (
                                    <div key={i} className="flex items-center gap-2 text-neutral-500 text-xs">
                                        <b.icon className="w-3.5 h-3.5 text-[#ADFF44]" />
                                        {b.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AiTutorTeaser;
