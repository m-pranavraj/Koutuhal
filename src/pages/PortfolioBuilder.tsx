import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChevronRight, Code, Globe, Laptop, Layout, Loader2, Moon, Palette, Share2, Sparkles, Sun, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";


const PortfolioBuilder = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTheme, setActiveTheme] = useState<'minimal' | 'dev' | 'creative'>('dev');

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 3000);
    };

    return (
        <div className="min-h-screen bg-neutral-900 dark:bg-black text-white dark:text-slate-100 font-sans">
            {/* Navbar */}
            <nav className="border-b border-neutral-800 dark:border-neutral-800 bg-neutral-900 dark:bg-black fixed top-16 w-full z-40 transition-all">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/resume-active" className="flex items-center text-neutral-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Resume
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#ADFF44] rounded-lg flex items-center justify-center text-white font-bold">P</div>
                        <span className="font-bold text-lg">Portfolio<span className="text-[#ADFF44]">Builder</span></span>
                    </div>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        View Live Site
                    </Button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-28 md:pt-36 pb-20 container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row gap-8 h-[calc(100vh-20px)]">

                {/* Left Panel: Controls */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-8 flex flex-col h-full overflow-y-auto pb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ADFF44] to-[#8BCC36] mb-2">
                            Your Career, <br />Now a Website.
                        </h1>
                        <p className="text-neutral-500">
                            We've extracted your data. Just choose a vibe and hit publish.
                        </p>
                    </div>

                    {/* Theme Selector */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Choose Vibe</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setActiveTheme('dev')}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${activeTheme === 'dev' ? 'border-[#ADFF44] bg-[#ADFF44]/5 dark:bg-[#ADFF44]/10/20' : 'border-neutral-800 bg-neutral-900 hover:border-[#ADFF44]/30'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold flex items-center gap-2"><Code className="w-4 h-4 text-[#ADFF44]" /> Dev / Minimal</span>
                                        <p className="text-xs text-neutral-500 mt-1">Monospace fonts, dark mode focus, syntax highlighting.</p>
                                    </div>
                                    {activeTheme === 'dev' && <div className="w-5 h-5 bg-[#ADFF44] rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTheme('creative')}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${activeTheme === 'creative' ? 'border-[#ADFF44] bg-[#ADFF44]/5 dark:bg-[#ADFF44]/10/20' : 'border-neutral-800 bg-neutral-900 hover:border-[#ADFF44]/30'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold flex items-center gap-2"><Palette className="w-4 h-4 text-pink-500" /> Creative / Bold</span>
                                        <p className="text-xs text-neutral-500 mt-1">Large typography, vibrant gradients, grid layout.</p>
                                    </div>
                                    {activeTheme === 'creative' && <div className="w-5 h-5 bg-[#ADFF44] rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTheme('minimal')}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${activeTheme === 'minimal' ? 'border-[#ADFF44] bg-[#ADFF44]/5 dark:bg-[#ADFF44]/10/20' : 'border-neutral-800 bg-neutral-900 hover:border-[#ADFF44]/30'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-bold flex items-center gap-2"><Layout className="w-4 h-4 text-neutral-500" /> Professional</span>
                                        <p className="text-xs text-neutral-500 mt-1">Clean, serif fonts, lots of white space, executive feel.</p>
                                    </div>
                                    {activeTheme === 'minimal' && <div className="w-5 h-5 bg-[#ADFF44] rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Color / Font Toggles (Mock) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Customization</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full gap-2"><Sun className="w-4 h-4" /> Mode</Button>
                            <Button variant="outline" size="sm" className="rounded-full gap-2">Primary Color</Button>
                            <Button variant="outline" size="sm" className="rounded-full gap-2">Font</Button>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="mt-auto">
                        <Button onClick={handleGenerate} className="w-full h-12 text-lg bg-gradient-to-r from-[#ADFF44] to-[#8BCC36] hover:opacity-90 transition-opacity shadow-lg shadow-[#ADFF44]/20 text-white font-bold rounded-xl" disabled={isGenerating}>
                            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building Site...</> : <><Sparkles className="w-5 h-5 mr-2" /> Publish Portfolio</>}
                        </Button>
                        <p className="text-center text-xs text-neutral-500 mt-3">Free domain included: <span className="font-mono text-[#ADFF44]">pranav.koutuhal.bio</span></p>
                    </div>
                </div>

                {/* Right Panel: Preview Window */}
                <div className="flex-1 bg-slate-200 dark:bg-black p-8 rounded-3xl border-4 border-neutral-700 dark:border-neutral-800 relative overflow-hidden shadow-inner flex items-center justify-center">
                    {/* Browser Frame */}
                    <div className="w-full h-full bg-neutral-900 dark:bg-black rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
                        {/* Browser Bar */}
                        <div className="bg-slate-100 dark:bg-slate-800 h-8 flex items-center px-4 gap-2 border-b border-neutral-800 dark:border-slate-700">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ADFF44]"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="bg-neutral-900 dark:bg-black flex-1 mx-4 h-5 rounded text-[10px] flex items-center px-2 text-neutral-500">
                                koutuhal.bio/pranav-resume
                            </div>
                        </div>

                        {/* Content - Mocking the selected theme */}
                        <div className="flex-1 overflow-y-auto relative">
                            {isGenerating && (
                                <div className="absolute inset-0 z-50 bg-neutral-900/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col">
                                    <Loader2 className="w-10 h-10 text-[#ADFF44] animate-spin mb-4" />
                                    <h3 className="font-bold text-xl animate-pulse">Generating your site...</h3>
                                    <p className="text-neutral-500">Optimizing SEO • Compressing Images • Writing Copy</p>
                                </div>
                            )}

                            {/* Theme Visuals */}
                            {activeTheme === 'dev' && (
                                <div className="p-12 font-mono bg-[#0d1117] text-neutral-400 min-h-full">
                                    <nav className="flex justify-between mb-20 text-green-400">
                                        <span>~/portfolio</span>
                                        <div className="space-x-4"><span className="hover:underline cursor-pointer">_projects</span> <span className="hover:underline cursor-pointer">_stack</span></div>
                                    </nav>
                                    <div className="max-w-2xl">
                                        <p className="text-green-500 mb-4 animate-pulse">Hello world,</p>
                                        <h1 className="text-5xl font-bold text-white mb-6">I'm Pranav. <br /> <span className="text-neutral-500">Full Stack Engineer.</span></h1>
                                        <p className="text-lg leading-relaxed mb-8">
                                            I build accessible, pixel-perfect, performant, and delightful digital experiences.
                                            Currently modifying <span className="bg-slate-800 px-1 text-yellow-300">ResumeBuilder.tsx</span>
                                        </p>
                                        <div className="flex gap-4">
                                            <button className="border border-green-500 text-green-500 px-6 py-3 hover:bg-green-500/10 transition-colors">View Projects</button>
                                            <button className="text-neutral-500 px-6 py-3 hover:text-white transition-colors">Contact Me</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTheme === 'creative' && (
                                <div className="min-h-full bg-neutral-900 text-white">
                                    <div className="grid grid-cols-2 h-full min-h-[500px]">
                                        <div className="bg-[#ADFF44] p-12 flex flex-col justify-center text-white relative overflow-hidden">
                                            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#ADFF44] rounded-full blur-3xl opacity-50"></div>
                                            <h1 className="text-6xl font-black mb-4 relative z-10 leading-tight">PRANAV<br />KUMAR</h1>
                                            <p className="text-violet-200 text-xl font-light tracking-wide">CREATIVE TECHNOLOGIST</p>
                                        </div>
                                        <div className="p-12 flex flex-col justify-center">
                                            <h2 className="text-2xl font-bold mb-6">Selected Works</h2>
                                            <div className="space-y-4">
                                                <div className="group cursor-pointer">
                                                    <h3 className="text-xl font-bold group-hover:text-[#ADFF44] transition-colors">Koutuhal Platform</h3>
                                                    <p className="text-neutral-500">React • Tailwind • Node</p>
                                                </div>
                                                <div className="border-t border-neutral-800 my-2"></div>
                                                <div className="group cursor-pointer">
                                                    <h3 className="text-xl font-bold group-hover:text-[#ADFF44] transition-colors">AI Resume Builder</h3>
                                                    <p className="text-neutral-500">Next.js • PDF-Lib • OpenAI</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTheme === 'minimal' && (
                                <div className="p-12 bg-stone-50 text-stone-800 min-h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-stone-200 rounded-full mb-8 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav" alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <h1 className="text-4xl font-serif mb-4">Pranav Kumar</h1>
                                    <p className="text-stone-500 max-w-md mx-auto mb-8 font-light italic">
                                        "Obsessed with creating intuitive user interfaces and scalable backend systems."
                                    </p>
                                    <div className="flex gap-6 text-sm font-bold tracking-widest uppercase">
                                        <a href="#" className="border-b border-stone-800 pb-1">Work</a>
                                        <a href="#" className="text-stone-400 hover:text-stone-800 transition-colors">About</a>
                                        <a href="#" className="text-stone-400 hover:text-stone-800 transition-colors">Contact</a>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Device Toggles (Decorative) */}
                    <div className="absolute bottom-6 right-8 flex gap-2 bg-neutral-900/90 dark:bg-slate-800/90 p-1.5 rounded-full shadow-lg backdrop-blur-md">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-white dark:text-white"><Laptop className="w-4 h-4" /></div>
                        <div className="p-2 text-neutral-500 hover:text-white cursor-pointer"><Smartphone className="w-4 h-4" /></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PortfolioBuilder;
