import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Clock,
    Layers,
    Rocket,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    TrendingUp,
    Target,
    Users,
    MessageSquare,
    Zap,
    BarChart,
    ShieldAlert,
    Globe,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BusinessProgram = () => {
    const navigate = useNavigate();
    const curriculum = [
        { week: "Week 1", title: "Introduction to AI & Business Fundamentals", topics: ["Understanding AI, Machine Learning, and Business Applications", "Overview of AI-powered business tools and platforms", "Setting up your AI toolkit for business"], icon: Briefcase },
        { week: "Week 2", title: "Strategic AI for Product Creation", topics: ["Using Generative AI for product development", "Creating prototypes and MVPs with AI tools", "AI-powered market research and validation"], icon: Target },
        { week: "Week 3", title: "AI-Driven Agent & Communications", topics: ["Building AI chatbots for customer service", "Implementing AI communication strategies", "Automating customer interactions"], icon: MessageSquare },
        { week: "Week 4", title: "Intermediate Tools & Value Extraction", topics: ["Advanced AI tool integration", "Data analysis with AI", "ROI measurement and optimization"], icon: TrendingUp },
        { week: "Week 5", title: "AI Research Agents & Workflow", topics: ["Creating AI research assistants", "Automating business intelligence", "Building efficient AI workflows"], icon: Zap },
        { week: "Week 6", title: "Advanced AI Agent Orchestration", topics: ["Multi-agent systems for business", "Coordinating AI tools for complex tasks", "Enterprise AI implementation"], icon: Layers },
        { week: "Week 7", title: "Sales & Workflow Integration", topics: ["AI-powered customer surveys and feedback", "Sales automation with AI", "CRM integration and optimization"], icon: BarChart },
        { week: "Week 8", title: "Enterprise Systems & Future Ops", topics: ["Integrating AI across business functions", "Professional AI communication strategies", "Future-proofing your business with AI"], icon: Globe },
    ];

    const projects = [
        { id: 1, title: "AI Marketing Campaign", desc: "Create a complete marketing campaign using AI tools for content, design, and automation" },
        { id: 2, title: "Customer Service Chatbot", desc: "Build and deploy an AI chatbot for customer support" },
        { id: 3, title: "Business Intel Dashboard", desc: "Create an AI-powered analytics dashboard for business insights" },
        { id: 4, title: "Sales Automation System", desc: "Implement AI-driven sales workflows and lead management" },
        { id: 5, title: "Content Marketing Engine", desc: "Build an automated content creation and distribution system" },
        { id: 6, title: "AI Strategy Roadmap", desc: "Develop a comprehensive AI integration plan for your business" },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#ADFF44] selection:text-black">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 blur-[150px] rounded-full opacity-30" />
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="mb-6 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                            AI Strategies for Business Growth
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
                            Exponential <br /> <span className="text-[#ADFF44]">Business Velocity</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                            Learn how to leverage AI tools and strategies to drive business growth, improve efficiency, and stay competitive in the digital age.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" onClick={() => navigate('/contact')} className="h-16 px-10 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-black rounded-2xl text-base tracking-widest uppercase shadow-[0_0_30px_rgba(173,255,68,0.2)]">
                                Transform My Business
                            </Button>
                            <Button size="lg" onClick={() => navigate('/contact')} variant="outline" className="h-16 px-10 border-neutral-800 bg-white/5 hover:bg-white/10 font-bold rounded-2xl text-base text-white">
                                Request Program Info
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20">
                        {[
                            { label: "Duration", value: "8 Weeks", icon: Clock },
                            { label: "AI Tools", value: "30+", icon: Layers },
                            { label: "Projects", value: "6", icon: Rocket },
                            { label: "Price", value: "₹49,999", icon: DollarSign },
                        ].map((stat, i) => (
                            <div key={i} className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2rem] backdrop-blur-xl">
                                <stat.icon className="h-6 w-6 text-[#ADFF44] mb-3 mx-auto md:mx-0" />
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-8 leading-tight">
                            AI-First <br /> <span className="text-[#ADFF44]">Transformation</span>
                        </h2>
                        <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
                            Designed for business professionals, entrepreneurs, and decision-makers, this bootcamp provides practical AI strategies to transform your business operations, marketing, and customer engagement.
                        </p>
                        <div className="space-y-6">
                            {[
                                { title: "No-Code Automation", desc: "Build enterprise systems without writing a single line of code." },
                                { title: "AI-Powered Sales", desc: "Scale your outreach and conversion using intelligent agents." },
                                { title: "Workflow Orchestration", desc: "Automate complex business processes for massive efficiency." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[#ADFF44]/20 flex items-center justify-center shrink-0 mt-1">
                                        <CheckCircle2 className="h-4 w-4 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold block">{item.title}</span>
                                        <span className="text-neutral-500 text-sm">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative p-2 bg-gradient-to-br from-neutral-800 to-transparent rounded-[2.5rem]">
                        <div className="aspect-square bg-neutral-900 rounded-[2.4rem] overflow-hidden border border-white/5 relative group">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-20 h-20 rounded-full bg-[#ADFF44] flex items-center justify-center animate-pulse">
                                    <TrendingUp className="h-10 w-10 text-black" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Section - THE IMAGE */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5 relative overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-black tracking-tight mb-4">
                            The <span className="text-[#ADFF44]">Business</span> AI Stack
                        </h2>
                        <p className="text-neutral-500 max-w-2xl mx-auto font-medium">
                            We focus on practical, no-code and low-code AI tools that deliver immediate ROI for your organization.
                        </p>
                    </div>
                    <div className="relative p-10 bg-white rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/5 overflow-hidden">
                        <img
                            src="/mentors/image.png"
                            alt="Business AI Toolkit"
                            className="w-full h-auto rounded-xl"
                        />
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[3rem]" />
                    </div>
                </div>
            </section>

            {/* Curriculum Grid */}
            <section className="py-24 px-4 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="bg-[#ADFF44]/10 text-[#ADFF44] border-0 mb-4 px-4 py-1.5 font-black uppercase tracking-tighter">Roadmap to Growth</Badge>
                        <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6">Program <span className="text-[#ADFF44]">Journey</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {curriculum.map((week, i) => (
                            <div key={i} className="flex flex-col bg-neutral-900/20 border border-neutral-800/50 p-8 rounded-[2.5rem] hover:border-[#ADFF44]/30 hover:bg-neutral-900 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-[#ADFF44]/10 border border-[#ADFF44]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <week.icon className="h-6 w-6 text-[#ADFF44]" />
                                </div>
                                <h4 className="text-white font-bold mb-4">{week.title}</h4>
                                <ul className="space-y-3 mt-auto">
                                    {week.topics.map((topic, idx) => (
                                        <li key={idx} className="flex gap-2 text-xs text-neutral-500 leading-relaxed font-medium">
                                            <div className="w-1 h-1 rounded-full bg-neutral-700 mt-1.5 shrink-0" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-4 border-t border-neutral-800 text-[10px] font-black text-neutral-600 uppercase tracking-widest">{week.week}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Timeline-like Grid */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-display font-black tracking-tight mb-16 text-center">Outcome <span className="text-[#ADFF44]">Projects</span></h2>
                    <div className="space-y-4">
                        {projects.map((project, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-6 p-8 bg-black/40 border border-neutral-900 rounded-[2rem] hover:border-[#ADFF44]/20 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white font-black shrink-0 group-hover:bg-[#ADFF44] group-hover:text-black transition-colors">{i + 1}</div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                                    <p className="text-neutral-500 text-sm leading-relaxed">{project.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Will Learn Section */}
            <section className="py-24 px-4 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-neutral-950 border border-neutral-800 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#ADFF44]" />
                        <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-12">Skills You'll <br /> <span className="text-[#ADFF44]">Master</span></h2>
                        <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                            {[
                                "Understand AI fundamentals and business applications",
                                "Master 30+ AI tools for business operations",
                                "Build AI-powered workflows and automations",
                                "Create AI chatbots and customer service solutions",
                                "Implement AI-driven marketing strategies",
                                "Develop data-driven decision-making skills",
                                "Design and execute AI integration roadmaps",
                                "Measure and optimize AI ROI"
                            ].map((skill, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <Sparkles className="h-5 w-5 text-[#ADFF44] shrink-0 mt-0.5" />
                                    <span className="text-neutral-300 text-sm font-medium leading-relaxed">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-display font-black tracking-tight mb-12 text-center underline decoration-[#ADFF44] decoration-4 underline-offset-8">Strategy FAQ</h2>
                    <div className="space-y-6">
                        {[
                            { q: "Who is this program for?", a: "This bootcamp is designed for business owners, entrepreneurs, managers, and professionals looking to integrate AI into their business operations." },
                            { q: "Do I need technical background?", a: "No technical background is required. The program focuses on practical AI application using no-code and low-code tools." },
                            { q: "What tools will I learn?", a: "You will learn 30+ AI tools including ChatGPT, Claude, Midjourney, HubSpot AI, Zapier, and many more business-focused AI platforms." },
                            { q: "Will I get a certificate?", a: "Yes, you will receive an AI Business Strategy Certificate upon successful completion." }
                        ].map((faq, i) => (
                            <div key={i} className="p-8 bg-black/50 border border-neutral-900 rounded-[2rem]">
                                <h4 className="text-white font-bold mb-4 flex gap-4">
                                    <span className="text-[#ADFF44] font-black">?</span> {faq.q}
                                </h4>
                                <p className="text-neutral-500 text-sm pl-8 leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 bg-black">
                <div className="max-w-7xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-[#ADFF44] blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity rounded-[3.5rem]" />
                    <div className="relative bg-neutral-950 border border-white/5 p-12 md:p-24 rounded-[3.5rem] flex flex-col items-center text-center overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full" />
                        <Badge className="mb-8 border border-orange-500/20 bg-orange-500/5 text-orange-500 font-black uppercase text-[10px] tracking-widest px-4 py-2">Corporate Readiness</Badge>
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
                            Transform Your <br /> <span className="text-[#ADFF44]">Business Ops</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="h-16 px-12 bg-[#ADFF44] text-black hover:bg-white font-black uppercase text-sm tracking-widest rounded-2xl transition-all shadow-[0_0_40px_rgba(173,255,68,0.2)]">
                                Enroll Business
                            </Button>
                            <Button variant="outline" className="h-16 px-12 border-white/10 bg-white/5 text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                                Request Info
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BusinessProgram;
