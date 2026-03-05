import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Layers,
    Rocket,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Cpu,
    Code2,
    Database,
    Search,
    BrainCircuit,
    Settings,
    ShieldCheck,
    BarChart3,
    Network,
    GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const CollegesProgram = () => {
    const navigate = useNavigate();
    const curriculum = [
        { week: "Week 1", title: "Foundation - Introduction to AI and ML", topics: ["What is AI, ML, and Deep Learning", "History and evolution of AI", "Real-world applications and use cases", "Setting up development environment"], icon: Cpu },
        { week: "Week 2", title: "Text AI and Language Models", topics: ["Understanding Large Language Models (LLMs)", "GPT, Claude, and other text models", "Prompt engineering fundamentals", "Building text applications"], icon: Code2 },
        { week: "Week 3", title: "Image Generation and Vision", topics: ["Diffusion models and GANs", "DALL-E, Midjourney, Stable Diffusion", "Image editing and manipulation", "Visual AI applications"], icon: Sparkles },
        { week: "Week 4", title: "Audio and Video AI", topics: ["Speech recognition and synthesis", "Music generation with AI", "Video creation and editing tools", "Multimedia AI applications"], icon: Rocket },
        { week: "Week 5", title: "Advanced Prompt Engineering", topics: ["Prompt design patterns", "Chain-of-thought prompting", "Few-shot and zero-shot learning", "Optimizing AI outputs"], icon: BrainCircuit },
        { week: "Week 6", title: "AI APIs and Integration", topics: ["OpenAI, Anthropic, and other APIs", "Building AI-powered applications", "API authentication and best practices", "Rate limiting and optimization"], icon: Network },
        { week: "Week 7", title: "Vector Databases & Embeddings", topics: ["Understanding embeddings", "Vector databases (Pinecone, Weaviate)", "Semantic search implementation", "Building knowledge bases"], icon: Database },
        { week: "Week 8", title: "RAG Systems", topics: ["RAG architecture and concepts", "Building RAG systems", "Document processing and chunking", "Context-aware AI applications"], icon: Search },
        { week: "Week 9", title: "LangChain & AI Frameworks", topics: ["Introduction to LangChain", "Building chains and agents", "Memory and state management", "Production patterns"], icon: Layers },
        { week: "Week 10", title: "AI Agents & Autonomous Systems", topics: ["Building AI agents", "Tool use and function calling", "Multi-agent systems", "Agent orchestration"], icon: Settings },
        { week: "Week 11", title: "Fine-tuning & Model Training", topics: ["Transfer learning basics", "Fine-tuning LLMs", "Dataset preparation", "Training optimization"], icon: BrainCircuit },
        { week: "Week 12", title: "AI Ethics and Safety", topics: ["Bias and fairness in AI", "Privacy and security considerations", "Responsible AI development", "Regulatory compliance"], icon: ShieldCheck },
        { week: "Week 13", title: "Production Deployment", topics: ["Deploying AI applications", "Scalability and performance", "Monitoring and logging", "Cost optimization"], icon: Rocket },
        { week: "Week 14", title: "Building AI Products", topics: ["Product ideation and validation", "User experience with AI", "Business models", "Go-to-market strategies"], icon: BarChart3 },
        { week: "Week 15", title: "Capstone Development", topics: ["Project planning and architecture", "Implementation and testing", "Team collaboration", "Documentation best practices"], icon: Sparkles },
        { week: "Week 16", title: "Final Presentations", topics: ["Project presentations", "Portfolio development", "Interview preparation", "Industry networking"], icon: GraduationCap },
    ];

    const projects = [
        { title: "AI Content Generator", desc: "Build a multi-format content generation platform" },
        { title: "Semantic Search Engine", desc: "Create a vector-based search system" },
        { title: "RAG-powered Chatbot", desc: "Build a context-aware conversational AI" },
        { title: "AI Image Editor", desc: "Develop an intelligent image manipulation tool" },
        { title: "Voice-powered Assistant", desc: "Create a speech-enabled AI assistant" },
        { title: "Document Intelligence", desc: "Build an AI document analysis tool" },
        { title: "AI Code Assistant", desc: "Develop a programming helper tool" },
        { title: "Multi-modal AI App", desc: "Create an app combining text, image, and audio" },
        { title: "AI Agent Workflow", desc: "Build an autonomous task completion system" },
        { title: "Fine-tuned Custom Model", desc: "Train and deploy a specialized AI model" },
        { title: "Production AI SaaS", desc: "Build a scalable AI-powered service" },
        { title: "Capstone Innovation", desc: "Your comprehensive AI solution" },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#ADFF44] selection:text-black">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[#ADFF44]/10 blur-[120px] rounded-full opacity-40" />
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border border-[#ADFF44]/20 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                            Master Generative AI Bootcamp
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
                            Architecting <br /> <span className="text-[#ADFF44]">The Future</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                            Comprehensive program covering generative AI fundamentals, tools, and production-ready applications. From basics to advanced implementation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" onClick={() => navigate('/contact')} className="h-14 px-10 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-black rounded-2xl text-base tracking-widest uppercase transition-all">
                                Join Bootcamp Now
                            </Button>
                            <Button size="lg" onClick={() => navigate('/contact')} variant="outline" className="h-14 px-10 border-neutral-800 bg-white/5 hover:bg-white/10 font-bold rounded-2xl text-base text-white">
                                Request Info
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20">
                        {[
                            { label: "Duration", value: "16 Weeks", icon: Clock },
                            { label: "AI Tools", value: "40+", icon: Layers },
                            { label: "Projects", value: "12", icon: Rocket },
                            { label: "Level", value: "Adv. GenAI", icon: BrainCircuit },
                        ].map((stat, i) => (
                            <div key={i} className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[2.5rem] backdrop-blur-xl">
                                <stat.icon className="h-6 w-6 text-[#ADFF44] mb-3 mx-auto md:mx-0" />
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div className="order-2 md:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden relative group">
                                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-x-4 bottom-4 text-xs font-bold text-white bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">Neural Networks</div>
                            </div>
                            <div className="aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden relative group translate-y-8">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-x-4 bottom-4 text-xs font-bold text-white bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">System Architect</div>
                            </div>
                            <div className="aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden relative group -translate-y-4">
                                <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-x-4 bottom-4 text-xs font-bold text-white bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">App Integration</div>
                            </div>
                            <div className="aspect-square bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden relative group translate-y-4">
                                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-x-4 bottom-4 text-xs font-bold text-white bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">Agent Automation</div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-8">
                            Engineering <br /> <span className="text-[#ADFF44]">Super-Intelligence</span>
                        </h2>
                        <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
                            Designed for college students and early professionals, this intensive bootcamp covers everything from AI fundamentals to production-ready applications, with a focus on generative AI technologies.
                        </p>
                        <div className="grid gap-6">
                            {[
                                { title: "RAG Architectures", desc: "Build systems that talk to your data." },
                                { title: "Autonomous Agents", desc: "Orchestrate multi-step task completion." },
                                { title: "Production Deployment", desc: "Ship scalable AI SaaS applications." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{feature.title}</h4>
                                        <p className="text-neutral-500 text-sm">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Section - THE IMAGE */}
            <section className="py-24 px-4 relative overflow-hidden bg-black">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-black tracking-tight mb-4">
                            The <span className="text-[#ADFF44]">Ultimate</span> AI Toolkit
                        </h2>
                        <p className="text-neutral-500 max-w-2xl mx-auto">
                            Master over 40 industry-leading tools. From LLMs to Vector Databases and Agent Orchestration frameworks.
                        </p>
                    </div>
                    <div className="relative p-12 bg-white rounded-[3rem] shadow-[0_0_80px_rgba(173,255,68,0.1)] border border-white/5 overflow-hidden group">
                        <img
                            src="/mentors/image.png"
                            alt="AI Master Toolkit"
                            className="w-full h-auto rounded-xl group-hover:scale-[1.02] transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[3rem]" />
                    </div>
                </div>
            </section>

            {/* Curriculum Accordion */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6 leading-none">
                            The 16-Week <br /> <span className="text-[#ADFF44]">Pathway</span>
                        </h2>
                        <p className="text-neutral-500 text-lg uppercase tracking-widest font-bold">Deep learning. Detailed execution.</p>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {curriculum.map((week, i) => (
                            <AccordionItem key={i} value={`week-${i}`} className="border-white/5 bg-black/30 px-6 py-2 rounded-2xl">
                                <AccordionTrigger className="hover:no-underline group">
                                    <div className="flex items-center gap-6 text-left">
                                        <span className="text-[#ADFF44] font-black text-xl w-10 shrink-0 opacity-40 group-data-[state=open]:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</span>
                                        <div>
                                            <h4 className="text-white font-bold group-data-[state=open]:text-[#ADFF44] transition-colors">{week.title}</h4>
                                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">{week.week}</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-8 text-neutral-400 pl-16">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {week.topics.map((topic, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-1 h-1 rounded-full bg-[#ADFF44]" />
                                                <span className="text-sm">{topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-24 px-4 bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">
                            Build <span className="text-[#ADFF44]">Real IP</span>
                        </h2>
                        <span className="hidden md:block py-2 px-6 rounded-full border border-white/10 text-[#ADFF44] font-black text-sm uppercase tracking-widest">12 Production Grade Projects</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, i) => (
                            <div key={i} className="flex flex-col bg-neutral-900/30 border border-neutral-800 p-8 rounded-[2rem] hover:border-[#ADFF44]/30 hover:bg-neutral-900 transition-all relative group h-full">
                                <div className="absolute top-8 right-8 text-4xl font-black text-white/5 group-hover:text-[#ADFF44]/10 transition-colors">{i + 1}</div>
                                <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-[#ADFF44] transition-colors">{project.title}</h4>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-8">{project.desc}</p>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-[#ADFF44] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Demo <ChevronRight className="h-3 w-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-display font-black tracking-tight mb-12 text-center underline decoration-[#ADFF44] decoration-4 underline-offset-8">Common Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "What prerequisites are needed?", a: "Basic programming knowledge (Python preferred) and familiarity with web technologies. We cover AI concepts from scratch." },
                            { q: "Is this program suitable for beginners?", a: "Yes, we start with fundamentals. However, programming experience will help you progress faster." },
                            { q: "What certificate will I receive?", a: "Upon completion, you receive a Generative AI Professional Certificate recognized by industry." },
                            { q: "Will I get job placement support?", a: "Yes, we provide career guidance, portfolio reviews, and interview preparation." }
                        ].map((faq, i) => (
                            <div key={i} className="p-8 bg-black/50 border border-neutral-900 rounded-[2rem]">
                                <h4 className="text-white font-bold mb-4 flex gap-4">
                                    <span className="text-[#ADFF44]">Q.</span> {faq.q}
                                </h4>
                                <p className="text-neutral-500 text-sm pl-8 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 bg-black">
                <div className="max-w-7xl mx-auto bg-[#ADFF44] p-12 md:p-24 rounded-[3.5rem] relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_100px_rgba(173,255,68,0.15)]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <Rocket className="h-16 w-16 text-black mb-10" />
                    <h2 className="text-5xl md:text-8xl font-black text-black tracking-tighter mb-10 leading-[0.85]">
                        Launch Your <br /> AI Career
                    </h2>
                    <Button className="h-20 px-16 bg-black text-[#ADFF44] hover:bg-neutral-900 font-black uppercase text-lg tracking-widest rounded-3xl shadow-3xl transition-all scale-100 hover:scale-105 active:scale-95">
                        Secure Your Spot
                    </Button>
                    <p className="mt-8 text-black/60 font-black text-xs uppercase tracking-[0.3em]">Limited Seats Available for Next Cohort</p>
                </div>
            </section>
        </div>
    );
};

export default CollegesProgram;
