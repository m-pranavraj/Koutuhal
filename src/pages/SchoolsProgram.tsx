import React from 'react';
import { motion } from 'framer-motion';
import {
    GraduationCap,
    Clock,
    Layers,
    Rocket,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    BookOpen,
    Palette,
    Monitor,
    Cpu,
    Globe,
    LifeBuoy,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SchoolsProgram = () => {
    const curriculum = [
        { week: "Week 1", title: "Introduction to AI", topics: ["What is AI and Machine Learning?", "Real-world AI applications", "Setting up your first AI tools"], icon: Cpu },
        { week: "Week 2", title: "Text Generation with AI", topics: ["Understanding language models", "Creating content with ChatGPT", "Writing assistance and homework help"], icon: BookOpen },
        { week: "Week 3", title: "Image Generation and Visual AI", topics: ["Introduction to image generation", "Creating art with AI tools", "Understanding DALL-E and Midjourney"], icon: Palette },
        { week: "Week 4", title: "AI for Learning and Research", topics: ["Research assistants and AI tools", "Study helpers and note-taking", "Academic integrity with AI"], icon: GraduationCap },
        { week: "Week 5", title: "Video and Multimedia AI", topics: ["AI video creation tools", "Animation and multimedia projects", "Presentation enhancement"], icon: Monitor },
        { week: "Week 6", title: "AI in Science and Math", topics: ["AI for problem-solving", "Scientific simulations", "Math tutoring with AI"], icon: Layers },
        { week: "Week 7", title: "Creative AI Projects", topics: ["Building AI-powered games", "Interactive storytelling", "Music and art generation"], icon: Palette },
        { week: "Week 8", title: "Chatbots and Conversational AI", topics: ["Building simple chatbots", "Understanding NLP basics", "Creating helpful AI assistants"], icon: Users },
        { week: "Week 9", title: "AI Ethics and Responsibility", topics: ["Understanding AI bias", "Privacy and data protection", "Responsible AI use"], icon: Globe },
        { week: "Week 10", title: "AI for Social Good", topics: ["Solving community problems with AI", "Environmental applications", "Healthcare and education AI"], icon: LifeBuoy },
        { week: "Week 11", title: "Final Project Planning", topics: ["Choosing your AI project", "Planning and design", "Team collaboration"], icon: Sparkles },
        { week: "Week 12", title: "Final Project Presentation", topics: ["Completing your AI project", "Presenting to peers", "Reflection and next steps"], icon: Rocket },
    ];

    const projects = [
        { id: 1, title: "AI Story Generator", desc: "Create an interactive storytelling application using AI" },
        { id: 2, title: "Personal Study Assistant", desc: "Build an AI-powered study helper for your subjects" },
        { id: 3, title: "AI Art Gallery", desc: "Generate and curate an AI art collection" },
        { id: 4, title: "Smart Homework Helper", desc: "Develop an AI tool for homework assistance" },
        { id: 5, title: "Environmental Monitor", desc: "Create an AI system for environmental awareness" },
        { id: 6, title: "AI Chatbot Friend", desc: "Build a conversational AI companion" },
        { id: 7, title: "Science Experiment Simulator", desc: "Design AI-powered science simulations" },
        { id: 8, title: "Final Innovation Project", desc: "Your own AI solution for a real-world problem" },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#ADFF44] selection:text-black">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#ADFF44]/10 blur-[120px] rounded-full opacity-50" />
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                            Education Program for Schools
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[0.9]">
                            Future-Proofing <br /> <span className="text-[#ADFF44]">Young Minds</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
                            Comprehensive AI curriculum designed specifically for school students to learn AI fundamentals, tools, and practical applications.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="h-14 px-8 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-2xl text-base shadow-[0_0_20px_rgba(173,255,68,0.2)]">
                                Join PathWay Now
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 border-neutral-800 bg-white/5 hover:bg-white/10 font-bold rounded-2xl text-base text-white">
                                Request Program Info
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20">
                        {[
                            { label: "Duration", value: "12 Weeks", icon: Clock },
                            { label: "AI Tools", value: "25+", icon: Layers },
                            { label: "Projects", value: "8", icon: Rocket },
                            { label: "Grades", value: "8-12", icon: GraduationCap },
                        ].map((stat, i) => (
                            <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl backdrop-blur-xl">
                                <stat.icon className="h-5 w-5 text-[#ADFF44] mb-3 mx-auto md:mx-0" />
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-display font-black tracking-tight mb-6">
                            About This <span className="text-[#ADFF44]">Program</span>
                        </h2>
                        <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                            Designed for school students (Grades 8-12), this program introduces AI concepts through hands-on projects, making learning engaging and practical. We bridge the gap between abstract theory and real-world creativity.
                        </p>
                        <div className="space-y-4">
                            {[
                                "NEP 2020 Aligned Curriculum",
                                "Hands-on AI Tool Mastery",
                                "Project-Based Creative Learning",
                                "Ethics & Responsible AI Use"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-[#ADFF44]" />
                                    <span className="text-white font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-neutral-900 rounded-[2rem] border border-neutral-800 overflow-hidden group shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
                                alt="School AI Learning"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-[#ADFF44] flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-black" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">Guided by AI Experts</p>
                                    <p className="text-neutral-400 text-xs">Learn from industry leaders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Section - THE IMAGE */}
            <section className="py-24 px-4 relative overflow-hidden bg-neutral-950 border-t border-white/5">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl font-display font-black tracking-tight mb-4 text-center">
                        Master the <span className="text-[#ADFF44]">Industry Toolkit</span>
                    </h2>
                    <p className="text-neutral-500 mb-12 text-center max-w-2xl mx-auto">
                        Get hands-on experience with the exact same tools used by professionals at top tech companies.
                    </p>
                    <div className="relative p-8 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/5 overflow-hidden">
                        <img
                            src="/mentors/image.png"
                            alt="AI Tools Toolkit"
                            className="w-full h-auto rounded-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Curriculum Section */}
            <section className="py-24 px-4 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-6">
                            Program <span className="text-[#ADFF44]">Curriculum</span>
                        </h2>
                        <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                            A comprehensive week-by-week journey into the world of Artificial Intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {curriculum.map((week, i) => (
                            <div key={i} className="group bg-neutral-950 border border-neutral-800 p-8 rounded-[2rem] hover:border-[#ADFF44]/30 transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[#ADFF44] font-black text-sm uppercase tracking-widest">{week.week}</span>
                                    <week.icon className="h-6 w-6 text-neutral-600 group-hover:text-[#ADFF44] transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-white">{week.title}</h3>
                                <ul className="space-y-3">
                                    {week.topics.map((topic, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-neutral-500 items-start">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ADFF44]/40 shrink-0" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ADFF44]/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
                        <div className="max-w-2xl text-left">
                            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4">
                                Projects You'll <span className="text-[#ADFF44]">Build</span>
                            </h2>
                            <p className="text-neutral-500 text-lg">
                                Practical implementation is at the core of our learning model. You won't just learn AI, you'll create it.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Badge className="bg-[#ADFF44] text-black border-0 px-4 py-2 rounded-lg font-black uppercase text-xs tracking-tighter">8 Portfolio Pieces</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-black/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-[2rem] hover:bg-neutral-900 transition-all group">
                                <div className="text-3xl font-black text-neutral-800 mb-6 group-hover:text-[#ADFF44]/20 transition-colors">0{project.id}</div>
                                <h4 className="text-lg font-bold text-white mb-3">{project.title}</h4>
                                <p className="text-neutral-500 text-sm leading-relaxed">{project.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Will Learn Section */}
            <section className="py-24 px-4 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-display font-black tracking-tight mb-12">
                        What You Will <span className="text-[#ADFF44]">Gain</span>
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            "Understand fundamental AI and ML concepts",
                            "Use 25+ AI tools effectively and responsibly",
                            "Create content using generative AI",
                            "Build simple AI-powered projects",
                            "Apply AI to learning and problem-solving",
                            "Understand AI ethics and responsible use",
                            "Collaborate on technology projects",
                            "Present technical projects confidently"
                        ].map((outcome, i) => (
                            <div key={i} className="flex items-center gap-4 bg-neutral-900/40 p-5 rounded-2xl border border-white/5 text-left">
                                <div className="w-8 h-8 rounded-full bg-[#ADFF44]/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-[#ADFF44]" />
                                </div>
                                <span className="text-neutral-300 text-sm font-medium">{outcome}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#ADFF44] to-[#7CB915] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-white/30 transition-all duration-1000" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-8 leading-[0.9]">
                            Ready to Shape <br /> the Future?
                        </h2>
                        <p className="text-black/70 text-lg md:text-xl font-medium mb-10 max-w-xl mx-auto uppercase tracking-wide">
                            Enrollment for the next cohort is opening soon. <br /> Don't miss your spot!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="h-16 px-10 bg-black text-[#ADFF44] hover:bg-neutral-900 font-black uppercase text-sm tracking-widest rounded-2xl shadow-2xl transition-all">
                                Apply For Program
                            </Button>
                            <Button variant="outline" className="h-16 px-10 border-black/20 bg-transparent text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-black/5 transition-all">
                                Download Brochure
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SchoolsProgram;
