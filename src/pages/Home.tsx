import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
import ScrollSequence from "@/components/motion/ScrollSequence";
import udayanImg from '@/assets/mentors/udyan.png.jpeg';
import shireenImg from '@/assets/mentors/shireen.png.jpeg';
import adityaImg from '@/assets/mentors/aditya.png.jpeg';
// Importing Coach Images (Assuming Screenshots correspond to User upload)
import pritamImg from '@/assets/mentors/Screenshot 2026-02-14 134010.png';
import agrimImg from '@/assets/mentors/Screenshot 2026-02-14 134026.png';
// Shuchi's image not found in assets, using placeholder or public path fallback
const shuchiImg = "/mentors/shuchi.jpg";



// Updated Pricing Plans
const pricingPlans = [
  {
    id: 1, name: "Silver", price: "₹15,000", duration: "2 months program",
    features: [
      "8 interactive AI learning sessions",
      "4 sessions with industry experts",
      "1 hands-on live project",
      "5 interactive quizzes",
      "Basic AI tools introduction",
      "Community forum access",
      "Certificate of completion"
    ],
    isPopular: false,
  },
  {
    id: 2, name: "Gold", price: "₹40,000", duration: "4 months program",
    features: [
      "12 interactive AI learning sessions",
      "8 sessions with industry experts",
      "3 hands-on live projects",
      "10 interactive quizzes",
      "Advanced AI tools training",
      "Project certificates",
      "Priority community support",
      "Parent progress reports"
    ],
    isPopular: true,
  },
  {
    id: 3, name: "Platinum", price: "₹75,000", duration: "12 weeks program",
    features: [
      "20 interactive AI learning sessions",
      "20 sessions with industry experts",
      "5 hands-on live projects",
      "15 interactive quizzes",
      "Personal 1:1 mentorship",
      "Advanced project portfolio",
      "Direct mentor access",
      "Career guidance for young learners",
      "Exclusive AI tools access"
    ],
    isPopular: false,
  },
];



/* ── MENTOR DATA (With Real Images) ──────────────────────── */
const mentors = [
  {
    name: "Shehzaad Dhuliawala",
    role: "Research Scientist",
    company: "Meta",
    experience: "8+ years",
    rating: 4.9,
    status: "Available",
    image: "/mentors/shehzaad.png"
  },
  {
    name: "Koushik G",
    role: "Product Manager",
    company: "McKinsey",
    experience: "7+ years",
    rating: 4.9,
    status: "Limited",
    image: "/mentors/koushik.png"
  },
  {
    name: "Arvind Iyer",
    role: "Cybersecurity Advisor",
    company: "Optiv",
    experience: "10+ years",
    rating: 4.9,
    status: "Available",
    image: "/mentors/arvind.jpg"
  },
  {
    name: "Rakind Gupta",
    role: "Strategy Consultant",
    company: "Bain Consulting",
    experience: "12+ years",
    rating: 4.9,
    status: "Waitlist",
    image: "/mentors/rakind.jpg"
  },
  {
    name: "Ronit Khopkar",
    role: "Founder - CEO",
    company: "Barter",
    experience: "10+ years",
    rating: 4.9,
    status: "Limited",
    image: "/mentors/ronit.jpg"
  },
  {
    name: "Udayan Anand",
    role: "Founder - CEO",
    company: "Finish Line Athlete",
    experience: "8+ years",
    rating: 4.9,
    status: "Available",
    image: udayanImg
  },
  {
    name: "Shireen Nagdive",
    role: "Lead Software Engineer",
    company: "Salesforce",
    experience: "8+ years",
    rating: 4.9,
    status: "Available",
    image: shireenImg
  },
  {
    name: "Aditya Kamath",
    role: "Senior Engineer",
    company: "Qualcomm",
    experience: "8+ years",
    rating: 4.9,
    status: "Limited",
    image: adityaImg
  },
];




/* ── CURRICULUM DATA ──────────────────── */
const curriculum = [
  {
    weeks: "Weeks 1-4",
    title: "AI Basics",
    topics: ["ChatGPT & AI Tools", "Simple Coding", "AI for Students", "Smart Study Methods"]
  },
  {
    weeks: "Weeks 5-8",
    title: "AI Learning Tools",
    topics: ["AI Quiz Makers", "Study Assistants", "Smart Presentations", "Learning Apps"]
  },
  {
    weeks: "Weeks 9-16",
    title: "AI Projects",
    topics: ["Build AI Games", "Create AI Helpers", "Make Smart Apps", "AI Art & Videos"]
  },
  {
    weeks: "Weeks 17-24",
    title: "Real AI Projects",
    topics: ["Career AI Guide", "AI Business Ideas", "Share Your Projects", "Future Skills"]
  }
];

/* ── TESTIMONIALS ─────────────────────── */
const testimonials = [
  {
    quote: "Koutuhal transformed my understanding of AI. The practical approach and expert guidance helped me land an internship at a top tech company.",
    name: "Arjun Patel",
    role: "Computer Science Student, IIT Bombay"
  },
  {
    quote: "The course content is incredibly well-structured. I went from AI novice to building my own machine learning models in just 12 weeks.",
    name: "Sneha Reddy",
    role: "Engineering Graduate, BITS Pilani"
  },
  {
    quote: "Perfect blend of technical depth and business applications. Now I can speak confidently about AI strategy in my consulting interviews.",
    name: "Vikram Singh",
    role: "MBA Student, ISB Hyderabad"
  }
];

/* ── Rotating Text ─────────────────────── */
const RotatingText = () => {
  const words = ["Schools", "Colleges", "Businesses"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-flex h-[1.2em] items-center overflow-hidden px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className="bg-clip-text text-transparent bg-gradient-to-r from-[#ADFF44] to-[#44ff9e] font-black italic tracking-tight"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{
            y: { type: "spring", stiffness: 200, damping: 25 },
            opacity: { duration: 0.2 },
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

/* ── Marquee Component ─────────────────── */
const Marquee = ({ children, reverse = false, duration = 30, className }: { children: React.ReactNode; reverse?: boolean; duration?: number; className?: string }) => (
  <div
    className={`flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group ${className}`}
    style={{ '--duration': `${duration}s` } as any}
  >
    <div className={`flex gap-12 shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}>
      {children}
      {children}
    </div>
  </div>
);

/* ── Stat Counter ──────────────────────── */
const AnimatedStat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center group hover:bg-neutral-900/50 p-6 rounded-2xl transition-colors">
    <motion.p
      className="text-4xl md:text-5xl font-display font-black text-[#ADFF44] tracking-tight mb-2 group-hover:scale-105 transition-transform"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
    >
      {value}
    </motion.p>
    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">{label}</p>
  </div>
);

/* ════════════════════════════════════════ */
const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" onMouseMove={handleMouseMove}>

      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative min-h-[110vh] flex flex-col bg-black overflow-hidden select-none">
        {/* State-of-the-art Mesh Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Reactive Mouse Glow */}
          <motion.div
            animate={{
              x: mousePos.x - 400,
              y: mousePos.y - 400,
            }}
            transition={{ type: "spring", damping: 50, stiffness: 200, mass: 0.5 }}
            className="absolute w-[800px] h-[800px] rounded-full bg-[#ADFF44]/[0.05] blur-[150px] z-0"
          />
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,#ADFF44_0%,transparent_70%)] opacity-[0.08] blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,#44ff9e_0%,transparent_70%)] opacity-[0.05] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(173,255,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(173,255,68,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]" />
        </div>

        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center z-10 pointer-events-none">
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center h-full gap-8 md:gap-16 font-display">

            {/* LEFT: Robot Animation */}
            <div className="w-full md:w-5/12 lg:w-4/12 flex items-center justify-center order-1 md:order-1 relative">
              <div className="absolute inset-0 bg-[#ADFF44]/15 blur-[100px] rounded-full scale-75 animate-pulse" />
              <div className="relative w-full aspect-square max-w-[200px] md:max-w-[300px]">
                <ScrollSequence
                  frameCount={80}
                  path="/3d-sequence/ezgif-frame-"
                  digits={3}
                  className="w-full h-full scale-100 drop-shadow-[0_0_30px_rgba(173,255,68,0.2)]"
                  scrollRef={heroRef}
                />
              </div>
            </div>

            {/* RIGHT: Text Content */}
            <motion.div
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="w-full md:flex-1 text-center md:text-left order-2 md:order-2 px-4 flex flex-col justify-center z-20 pointer-events-auto"
            >
              <Badge className="mb-8 bg-white/5 text-[#ADFF44]/90 border border-white/10 px-4 py-1.5 text-[10px] sm:text-xs tracking-[0.2em] backdrop-blur-xl uppercase font-bold self-center md:self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF44] inline-block mr-3 animate-pulse shadow-[0_0_8px_#ADFF44]" />
                Enrollment Live
              </Badge>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                Ready to Start Your
                <span className="block text-[#ADFF44]">AI Journey?</span>
              </motion.h1>

              <motion.p
                className="text-base md:text-xl text-neutral-400 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed font-normal"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Join thousands of students who have transformed their careers with Koutuhal.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <Link to="/career-check">
                  <Button size="lg" className="h-14 px-8 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-full text-base tracking-wide border-0 shadow-[0_0_20px_rgba(173,255,68,0.3)] hover:shadow-[0_0_40px_rgba(173,255,68,0.5)] transition-all group relative overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Sparkles className="mr-2 h-5 w-5 fill-black" />
                    Get Career Readiness Check
                  </Button>
                </Link>

                <Link to="/courses">
                  <Button size="lg" className="h-14 px-10 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-bold rounded-full text-base tracking-wide border border-white/10 hover:border-[#ADFF44]/30 transition-all">
                    Explore For Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ TRUSTED BY LOGO STRIP ━━━━━━━━━━ */}
      <section className="py-10 bg-neutral-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-neutral-500 text-xs font-bold tracking-widest uppercase mb-8">Trusted by Mentors from</p>
          <Marquee className="py-2" duration={20}>
            {["Meta", "Google", "McKinsey & Co", "Bain & Company", "Salesforce", "Qualcomm", "Finish Line", "Microsoft", "Amazon"].map((company, i) => (
              <div key={i} className="mx-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                <span className="text-xl md:text-2xl font-display font-black text-white">{company}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ━━━ EXPLORE COURSES (Premium Spotlight UI) ━━━ */}
      <section className="relative z-20 bg-neutral-950 py-24 px-4 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-0 w-full h-[500px] bg-gradient-to-b from-black via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 flex flex-col md:flex-row items-center justify-center gap-3">
              Explore AI for <RotatingText />
            </h2>
            <p className="text-neutral-500 text-lg">Explore tailored programs for schools, colleges, and businesses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "AI for Schools", icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", desc: "Curriculum aligned with NEP 2020 for young minds." },
              { title: "AI for Colleges", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", desc: "Advanced operational AI skills for undergraduates." },
              { title: "AI for Businesses", icon: Briefcase, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", desc: "Corporate training to boost workforce productivity." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`group relative bg-neutral-900/40 backdrop-blur-xl border ${item.border} rounded-[2rem] p-8 transition-all cursor-pointer overflow-hidden shadow-2xl`}
              >
                {/* Hover Spotlight */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${item.color.split('-')[1]}-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-500`} />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-[50px] group-hover:bg-white/10 transition-colors" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(0,0,0,0.3)]`}>
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                  </div>

                  <h3 className="text-3xl font-bold font-display mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                    {item.title}
                  </h3>

                  <p className="text-neutral-400 text-base mb-8 leading-relaxed border-l-2 border-white/5 pl-4 ml-1">
                    {item.desc}
                  </p>

                  <div className="mt-auto">
                    <Link to="/courses" className="inline-flex items-center justify-center w-full py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold text-white group-hover:tracking-wider">
                      View Programs <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ OUR MENTORS ━━━━━━━━━━━━━━━━━━━━ */}
      <section id="mentors" className="py-24 px-4 bg-neutral-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#ADFF44]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">INDUSTRY LEADERS</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-6">
              Our <span className="text-[#ADFF44]">Mentors</span>
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Get personalized guidance from top AI professionals working at leading tech companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 hover:border-[#ADFF44]/30 hover:bg-neutral-900 transition-all group hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-800">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + mentor.name + "&background=random";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-white">{mentor.rating}</span>
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ADFF44] transition-colors">{mentor.name}</h3>
                  <p className="text-sm text-neutral-400 mb-0.5 font-medium">{mentor.role}</p>
                  <p className="text-xs font-bold text-[#ADFF44] mb-3">{mentor.company}</p>

                  <div className="flex items-center gap-2 text-xs text-neutral-500 border-t border-neutral-800 pt-3 mt-3">
                    <Briefcase className="h-3 w-3" />
                    {mentor.experience} experience
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ MENTORSHIP IMPACT ━━━━━━━━━━━━━━ */}
      <section className="py-20 bg-black border-y border-neutral-900 relative">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(173,255,68,0.03),transparent)] animate-[shimmer_5s_infinite]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedStat value="1500+" label="Students Empowered" />
            <AnimatedStat value="Free" label="AI Tools Access" />
            <AnimatedStat value="24/7" label="Learning Support" />
            <AnimatedStat value="Gov" label="School Friendly" />
          </div>
        </div>
      </section>

      {/* ━━━ CURRICULUM + WHY CHOOSE (Bento Grid) ━━━ */}
      <section className="py-24 px-4 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">PROGRAM OVERVIEW</Badge>

          <div className="grid lg:grid-cols-2 gap-16 mb-24">
            {/* Left: Curriculum */}
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-black mb-8">
                Comprehensive AI <br /><span className="text-[#ADFF44]">Education Program</span>
              </h2>
              <p className="text-neutral-500 mb-8">From fundamentals to advanced applications, our curriculum is designed to make you job-ready in AI.</p>

              <div className="space-y-6">
                {curriculum.map((module, i) => (
                  <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 transition-all duration-300 hover:border-[#ADFF44]/30 hover:shadow-[0_0_30px_rgba(173,255,68,0.1)] flex gap-4 group">
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div className="w-8 h-8 rounded-full bg-[#ADFF44]/10 flex items-center justify-center text-[#ADFF44] text-xs font-bold border border-[#ADFF44]/20">
                        {i + 1}
                      </div>
                      {i !== curriculum.length - 1 && <div className="w-0.5 h-full bg-neutral-800" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#ADFF44] uppercase tracking-wider mb-1 block">{module.weeks}</span>
                      <h3 className="text-xl font-bold text-white mb-3">{module.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map(topic => (
                          <span key={topic} className="px-3 py-1 bg-neutral-950 rounded-full text-xs text-neutral-400 border border-neutral-800">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Why Choose (Bento) */}
            <div>
              <h3 className="text-2xl font-bold font-display mb-8 text-neutral-200">Why Choose Koutuhal?</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Cutting-Edge", desc: "GPT & CV Algorithms", icon: Cpu, colSpan: 2 },
                  { title: "Personal Mentorship", desc: "1-on-1 Experts", icon: Users, colSpan: 1 },
                  { title: "Hands-On", desc: "Real Projects", icon: Code2, colSpan: 1 },
                  { title: "Certification", desc: "Industry Recognized", icon: Award, colSpan: 1 },
                  { title: "Career Support", desc: "Job Placement", icon: Rocket, colSpan: 1 },
                  { title: "Indian Context", desc: "Localized Curriculum", icon: Globe, colSpan: 2 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl hover:bg-neutral-900 transition-colors hover:border-[#ADFF44]/30 group ${item.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#ADFF44]/10 flex items-center justify-center shrink-0 mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="h-5 w-5 text-[#ADFF44]" />
                    </div>
                    <h4 className="font-bold text-white text-lg leading-tight">{item.title}</h4>
                    <p className="text-neutral-500 text-sm mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ COACHES ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4">Meet Our <span className="text-[#ADFF44]">AI Coaches</span></h2>
            <p className="text-neutral-500">Experienced educators dedicated to making AI accessible.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Pritam", role: "AI Automation Expert", desc: "18+ years in AI Automation. Expert in developing intelligent systems.", tags: ["Enterprise AI", "Automation"], image: pritamImg },
              { name: "Shuchi", role: "AI Coach", desc: "10+ years expertise in training students and professionals in AI/ML.", tags: ["Machine Learning", "Training"], image: shuchiImg },
              { name: "Agrim Mehta", role: "Generative AI Expert", desc: "GenAI Engineer at Koutuhal AI. Building AI-first learning products.", tags: ["GenAI", "AI Agents"], image: agrimImg },
            ].map((coach, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl text-center hover:border-[#ADFF44]/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF44]/5 rounded-full blur-2xl group-hover:bg-[#ADFF44]/10 transition-colors" />

                <div className="w-24 h-24 mx-auto bg-neutral-800 rounded-full mb-6 flex items-center justify-center group-hover:bg-[#ADFF44] transition-colors relative z-10 overflow-hidden">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-2xl font-black text-neutral-500 group-hover:text-black absolute">{coach.name[0]}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">{coach.name}</h3>
                <p className="text-[#ADFF44] font-bold text-sm uppercase tracking-wide mb-4 relative z-10">{coach.role}</p>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed relative z-10">{coach.desc}</p>
                <div className="flex justify-center gap-2 relative z-10">
                  {coach.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-neutral-950 rounded text-[10px] text-neutral-500 border border-neutral-800">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-neutral-900/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden border border-neutral-800/50">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ADFF44]/5 via-transparent to-[#ADFF44]/5" />
            <h3 className="text-2xl font-display font-bold mb-8 relative z-10">World-Class Faculty Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              <div><p className="text-4xl font-black text-white">18+</p><p className="text-xs uppercase text-neutral-500 mt-2">Years Experience</p></div>
              <div><p className="text-4xl font-black text-white">20+</p><p className="text-xs uppercase text-neutral-500 mt-2">Research Papers</p></div>
              <div><p className="text-4xl font-black text-white">15k+</p><p className="text-xs uppercase text-neutral-500 mt-2">Students Guided</p></div>
              <div><p className="text-4xl font-black text-white">100%</p><p className="text-xs uppercase text-neutral-500 mt-2">Young Learner Focus</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SUCCESS STORIES (Grid) ━━━━━━━━━ */}
      <section id="reviews" className="py-24 px-4 bg-neutral-950">
        <div className="max-w-full overflow-hidden">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black mb-4">Success <span className="text-[#ADFF44]">Stories</span></h2>
            <p className="text-neutral-500">Hear from our community of learners.</p>
          </div>

          <div className="relative flex flex-col gap-6 mask-linear-fade">
            {/* Row 1: Left to Right */}
            <Marquee className="py-4" duration={40}>
              {testimonials.map((t, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl relative hover:bg-neutral-900 transition-colors w-[350px] shrink-0">
                  <QuoteIcon className="absolute top-6 right-6 w-6 h-6 text-neutral-800/50" />
                  <p className="text-neutral-300 italic mb-6 leading-relaxed font-light text-sm">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 text-sm border border-neutral-700">{t.name[0]}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-[#ADFF44] text-[10px] font-bold uppercase tracking-wide">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>

            {/* Row 2: Right to Left (Reverse) */}
            <Marquee className="py-4" reverse duration={45}>
              {[...testimonials].reverse().map((t, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl relative hover:bg-neutral-900 transition-colors w-[350px] shrink-0">
                  <QuoteIcon className="absolute top-6 right-6 w-6 h-6 text-neutral-800/50" />
                  <p className="text-neutral-300 italic mb-6 leading-relaxed font-light text-sm">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 text-sm border border-neutral-700">{t.name[0]}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-[#ADFF44] text-[10px] font-bold uppercase tracking-wide">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ━━━ PRICING (Updated) ━━━━━━━━━━━━━━ */}
      <section className="py-28 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20 px-4 py-1 text-xs font-display">PRICING</Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight">
              Choose Your <span className="text-[#ADFF44]">Learning Path</span>
            </h2>
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
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-[#ADFF44] text-black text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-wider shadow-sm">
                    MOST POPULAR
                  </div>
                )}
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                  {/* <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                  </div> */}
                  <p className="mb-8 text-xs text-neutral-400 font-medium bg-neutral-800/50 inline-block px-3 py-1.5 rounded-md border border-neutral-700/50">{plan.duration}</p>
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
                    Start Learning
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

// Helper Icon for Quotes
const QuoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21L14.017 18C14.017 16.0547 15.352 15.6875 16.7115 15.6875H16.9805C17.6534 15.6875 18.2393 15.2227 18.3976 14.5801L19.4678 10.2305C19.6468 9.50293 19.0494 8.6875 18.2917 8.6875H15.4219C14.6543 8.6875 14.017 8.05078 14.017 7.2832V4.875C14.017 4.10742 14.6543 3.4707 15.4219 3.4707H19.7227C21.3281 3.4707 22.5625 4.88672 22.5625 6.47461V11.8359C22.5625 15.8652 20.2105 21 15.4219 21H14.017ZM7.0171 21L7.0171 18C7.0171 16.0547 8.35206 15.6875 9.71153 15.6875H9.98053C10.6534 15.6875 11.2393 15.2227 11.3976 14.5801L12.4678 10.2305C12.6468 9.50293 12.0494 8.6875 11.2917 8.6875H8.42188C7.65429 8.6875 7.0171 8.05078 7.0171 7.2832V4.875C7.0171 4.10742 7.65429 3.4707 8.42188 3.4707H12.7227C14.3281 3.4707 15.5625 4.88672 15.5625 6.47461V11.8359C15.5625 15.8652 13.2105 21 8.42188 21H7.0171Z" />
  </svg>
);

export default Home;
