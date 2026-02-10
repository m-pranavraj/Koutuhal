import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Target,
  Zap,
  Code2,
  Monitor,
  PlayCircle,
  ChevronRight,
  Cpu,
  Globe,
  Mail,
  Briefcase,
  Brain,
  Rocket,
  MessageSquare,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MentorCard } from '@/components/cards/MentorCard';
import { mentors } from '@/data/mentors';
import { pricingPlans } from '@/data/instructors';
import ScrollSequence from "@/components/motion/ScrollSequence";

/* ── Rotating Text ─────────────────────── */
const RotatingText = () => {
  const words = ["Schools", "Colleges", "Businesses"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        className="text-[#ADFF44]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.1 },
        }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

/* ── Marquee Component ─────────────────── */
/* ── Marquee Component ─────────────────── */
const Marquee = ({ children, reverse = false, duration = 30, className }: { children: React.ReactNode; reverse?: boolean; duration?: number; className?: string }) => (
  <div className={`flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}>
    <motion.div
      className="flex gap-12 shrink-0"
      animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
      transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
    >
      {children}
      {children}
    </motion.div>
  </div>
);

/* ── Bento Feature Data ────────────────── */
const bentoFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Our adaptive engine customizes your path. Learn exactly what you need, skip what you know.",
    size: "col-span-2 row-span-2",
    accent: true,
  },
  {
    icon: Code2,
    title: "Build Real Projects",
    description: "Ship production AI apps, not toy examples.",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Monitor,
    title: "Any Device",
    description: "Browser-based. No GPU required.",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Users,
    title: "1-on-1 Mentorship",
    description: "Weekly calls with industry professionals from Google, Microsoft, and Amazon.",
    size: "col-span-2 row-span-1",
  },
  {
    icon: Rocket,
    title: "Career Launch",
    description: "Resume, portfolio, and interview prep built in.",
    size: "col-span-1 row-span-1",
  },
  {
    icon: Award,
    title: "Certified",
    description: "Industry-recognized credentials.",
    size: "col-span-1 row-span-1",
  },
];

/* ── Call Features ─────────────────────── */
const callFeatures = [
  { icon: BookOpen, title: "Mock Interviews" },
  { icon: Target, title: "Goal Setting" },
  { icon: Lightbulb, title: "Project Reviews" },
  { icon: MessageSquare, title: "Career Advice" },
  { icon: Code2, title: "Code Reviews" },
  { icon: Star, title: "Portfolio Audit" },
];

/* ── Stat Counter ──────────────────────── */
const AnimatedStat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <motion.p
      className="text-5xl md:text-6xl font-display font-black text-[#ADFF44] tracking-tight"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      {value}
    </motion.p>
    <p className="text-neutral-500 text-sm font-medium mt-2 uppercase tracking-widest">{label}</p>
  </div>
);

/* ════════════════════════════════════════ */
/*                HOME PAGE                */
/* ════════════════════════════════════════ */
const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative min-h-[150vh] flex flex-col bg-black overflow-hidden">
        {/* Grid Pattern Background (Parallax Effect) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(173,255,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(173,255,68,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none z-0" />
        {/* Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#ADFF44]/5 blur-[120px] pointer-events-none z-0" />

        {/* Sticky Container for Animation + Content */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center z-10 pointer-events-none">

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between h-full md:pl-44">

            {/* LEFT: Robot Animation (Top on Mobile, Left on Desktop) */}
            <div className="w-full md:w-3/12 lg:w-3/12 h-[25vh] md:h-[400px] flex items-center justify-center order-1 md:order-1 mt-0 md:mt-0 relative overflow-visible">
              <ScrollSequence
                frameCount={80}
                path="/3d-sequence/ezgif-frame-"
                digits={3}
                className="w-full h-full scale-100 md:scale-90 origin-center"
                scrollRef={heroRef}
              />
              {/* Mobile Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none md:hidden" />
            </div>

            {/* SPACER REMOVED to give text more room */}

            {/* RIGHT: Text Content (Bottom on Mobile, Right on Desktop) */}
            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="w-full md:w-auto md:flex-1 text-center md:text-left order-2 md:order-2 px-4 pt-2 md:pt-0 h-auto md:h-full flex flex-col justify-start md:justify-center z-20 md:pl-24"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border border-[#ADFF44]/20 px-5 py-2 text-sm font-display tracking-wider backdrop-blur-xl">
                  <span className="w-2 h-2 rounded-full bg-[#ADFF44] inline-block mr-3 animate-pulse" />
                  NOW ENROLLING — COHORT 1
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-[0.95] mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <span className="block text-white">AI Education</span>
                <span className="flex items-baseline justify-center md:justify-start gap-[0.3em] mt-2 flex-nowrap whitespace-nowrap">
                  <span>for</span>
                  <RotatingText />
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto md:mx-0 mb-10 leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                From zero to deploying production AI — with mentors from top companies,
                hands-on projects, and career support that actually works.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link to="/courses">
                  <Button size="lg" className="h-14 px-10 text-base bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-full shadow-[0_0_40px_rgba(173,255,68,0.3)] hover:shadow-[0_0_60px_rgba(173,255,68,0.4)] transition-all hover:scale-105 border-0">
                    Explore for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ BRAND MARQUEE (Overlap) ━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-20 bg-black py-12 border-y border-neutral-900 -mt-[50vh]">
        <p className="text-center text-xs text-neutral-600 uppercase tracking-[0.3em] mb-8 font-medium">Trusted by leading institutions</p>
        <Marquee>
          {["IIT Bombay", "BITS Pilani", "NIT Trichy", "VIT", "Manipal", "IIIT Hyderabad", "SRM", "Anna University", "NSUT Delhi", "DTU"].map((name) => (
            <span key={name} className="text-neutral-600 text-lg font-semibold whitespace-nowrap tracking-wide">{name}</span>
          ))}
        </Marquee>
      </section>



      {/* ━━━ BENTO FEATURES ━━━━━━━━━━━━━━━━━━ */}
      <section className="relative z-20 bg-black py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20 px-4 py-1 text-xs font-display tracking-wider">WHY KOUTUHAL</Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight">
              Everything you need.
              <br />
              <span className="text-neutral-500">Nothing you don't.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 auto-rows-fr">
            {/* Main Feature - AI Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-3 md:row-span-2 relative group rounded-[2rem] bg-[#ADFF44] p-8 md:p-10 flex flex-col justify-between overflow-hidden min-h-[320px] md:min-h-[500px]"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-[#ADFF44]" />
                </div>
                <h3 className="text-3xl font-display font-bold text-black mb-3">AI-Powered Learning</h3>
                <p className="text-black/80 font-medium leading-relaxed max-w-sm">
                  Our adaptive engine customizes your path in real-time. Skip what you know, focus on what matters.
                </p>
              </div>

              {/* Decorative visual for main card */}
              <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-20 pointer-events-none">
                <svg viewBox="0 0 400 200" className="w-full h-full text-black fill-current">
                  <path d="M0,100 C50,150 100,50 150,100 C200,150 250,50 300,100 C350,150 400,50 450,100 V200 H0 Z" />
                </svg>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
            </motion.div>

            {/* Build Real Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-3 md:row-span-1 group relative rounded-[2rem] border border-neutral-800 bg-neutral-900/40 p-8 overflow-hidden hover:border-neutral-700 transition-colors min-h-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF44]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex items-start gap-6">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#ADFF44] transition-colors duration-300">
                  <Code2 className="h-6 w-6 text-[#ADFF44] group-hover:text-black transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-[#ADFF44] transition-colors">Build Real Projects</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">No toy examples. Ship production-grade AI applications that solve real problems.</p>
                </div>
              </div>
            </motion.div>

            {/* Any Device */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1 md:row-span-1 group relative rounded-[2rem] border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col justify-center items-center text-center overflow-hidden hover:border-neutral-700 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF44]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Monitor className="h-8 w-8 text-[#ADFF44] mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-sm font-bold text-white">Any Device</h3>
            </motion.div>

            {/* Mentorship */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 md:row-span-1 group relative rounded-[2rem] border border-neutral-800 bg-neutral-900/40 p-8 overflow-hidden hover:border-neutral-700 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF44]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-[#ADFF44]" />
                  <h3 className="text-lg font-display font-bold text-white">1-on-1 Mentorship</h3>
                </div>
                <p className="text-neutral-400 text-sm">Weekly calls with engineers from Google, Amazon, and Microsoft.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ 1:1 CALLS SECTION ━━━━━━━━━━━━━━━ */}
      < section className="py-28 relative overflow-hidden" >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ADFF44]/5 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Content */}
            <div className="flex-1">
              <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20 px-4 py-1 text-xs font-display">PREMIUM SUPPORT</Badge>
              <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6">
                1-on-1 Calls.
                <br />
                <span className="text-[#ADFF44]">100% Prep.</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-xl leading-relaxed">
                Every student gets direct access to industry mentors. Not group calls — real, personalized guidance for your career.
              </p>
              <Link to="/search-experts">
                <Button size="lg" className="h-14 px-10 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-full shadow-[0_0_30px_rgba(173,255,68,0.2)] transition-all hover:scale-105 border-0">
                  Find Your Mentor <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Right: Feature Grid */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {callFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 text-center hover:border-[#ADFF44]/30 hover:bg-neutral-900 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-[#ADFF44] transition-colors">
                      <feature.icon className="h-5 w-5 text-[#ADFF44] group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{feature.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>





      {/* ━━━ MENTORS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 bg-neutral-950 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ADFF44]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">WORLD-CLASS FACULTY</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-6">
              Learn from the <span className="text-[#ADFF44]">best</span>.
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Our mentors lead teams at the world's most innovative companies.
            </p>
          </div>

          <div className="relative py-10 border-y border-neutral-900 bg-neutral-900/20 backdrop-blur-sm">
            <Marquee duration={40}>
              {[
                "Google", "Microsoft", "Amazon", "Meta", "Netflix",
                "Uber", "Airbnb", "McKinsey", "Bain", "Goldman Sachs",
                "Apple", "Tesla", "NVIDIA", "OpenAI"
              ].map((company) => (
                <div key={company} className="mx-8 flex items-center gap-4 group cursor-default">
                  <span className="text-2xl md:text-4xl font-display font-bold text-neutral-700 group-hover:text-white transition-colors duration-500">
                    {company}
                  </span>
                </div>
              ))}
            </Marquee>
          </div>

          <div className="mt-14 text-center">
            <Link to="/search-experts">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900 transition-all">
                Meet Roles & Mentors <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-28 px-4 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20 px-4 py-1 text-xs font-display">PRICING</Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight">
              Invest in <span className="text-[#ADFF44]">your future</span>.
            </h2>
            <p className="text-neutral-500 text-lg mt-4 max-w-xl mx-auto">
              Flexible packages designed for every stage of your journey.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden rounded-3xl border p-8 transition-all group
                  ${plan.isPopular
                    ? 'border-[#ADFF44]/40 bg-[#ADFF44]/5 shadow-[0_0_60px_rgba(173,255,68,0.08)]'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#ADFF44]/5 to-transparent" />

                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-[#ADFF44] text-black text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>

                  <p className="mb-8 text-xs text-neutral-500 font-medium bg-neutral-800/50 inline-block px-3 py-1.5 rounded-full">{plan.duration}</p>
                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-neutral-400">
                        <CheckCircle className="h-4 w-4 text-[#ADFF44] shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 text-sm font-bold rounded-xl transition-all ${plan.isPopular
                      ? 'bg-[#ADFF44] hover:bg-[#9BE63D] text-black border-0 shadow-[0_0_20px_rgba(173,255,68,0.15)]'
                      : 'bg-transparent border border-neutral-700 text-white hover:border-[#ADFF44] hover:text-[#ADFF44]'
                      }`}
                  >
                    Get a Demo Class
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ━━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#ADFF44]/5 blur-[150px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-8 leading-[1.05]">
              Ready to build
              <br />
              <span className="text-[#ADFF44]">the future?</span>
            </h2>
            <p className="text-neutral-500 text-lg mb-12 max-w-xl mx-auto">
              Join 1,500+ students already transforming their careers with AI. Limited seats for the upcoming cohort.
            </p>
            <Link to="/courses">
              <Button size="lg" className="h-16 px-14 text-lg bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-full shadow-[0_0_60px_rgba(173,255,68,0.3)] hover:shadow-[0_0_80px_rgba(173,255,68,0.4)] transition-all hover:scale-105 border-0">
                Join the Program <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
