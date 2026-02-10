import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Play, Pause, Maximize2, ChevronLeft, ChevronRight, MoreVertical, FileText, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AiTutor = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', text: 'Hello! I am your AI Tutor. I can explain concepts from the video, summarize slides, or answer any questions. What shall we learn today?' },
    ]);
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<'video' | 'slides'>('video');

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: "That's a great question! Based on the slide deck, this concept relates to the neural network architecture shown in Slide 4. The video also touches on this at 02:30."
            }]);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black dark:bg-black flex flex-col pt-24">
            {/* Sub Header */}
            <header className="bg-neutral-900 dark:bg-black border-b border-gray-100 dark:border-neutral-800 py-3 px-6 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ADFF44] to-[#8BCC36] flex items-center justify-center text-white font-bold shadow-lg shadow-[#ADFF44]/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 dark:text-slate-100 text-lg leading-tight">AI Masterclass: GenAI Foundations</h1>
                            <p className="text-xs text-gray-500 dark:text-neutral-500 flex items-center gap-1"><span className="w-2 h-2 bg-[#ADFF44] rounded-full animate-pulse"></span> Live Tutor Active</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full h-9 text-xs border-gray-200 dark:border-slate-700 dark:text-neutral-400 dark:hover:bg-slate-800">
                            <FileText className="w-3.5 h-3.5 mr-2" /> View Syllabus
                        </Button>
                        <Button className="rounded-full h-9 text-xs bg-black dark:bg-slate-100 dark:text-white text-white hover:bg-[#9BE63D]">
                            Next Lesson <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">

                {/* Left Panel: Content (Video/Slides) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* Player Container */}
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-[#ADFF44]/10 relative aspect-video group">
                        {activeTab === 'video' ? (
                            <>
                                {/* Mock Video Content */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
                                        className="w-full h-full opacity-30 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop')] bg-cover bg-center"
                                    ></motion.div>
                                    <Button className="w-16 h-16 rounded-full bg-neutral-900/20 backdrop-blur-md hover:bg-neutral-900/30 border border-white/40 flex items-center justify-center z-10 transition-all hover:scale-110">
                                        <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                    </Button>
                                </div>
                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-1 bg-neutral-900/30 rounded-full mb-4 cursor-pointer overflow-hidden">
                                        <div className="h-full w-1/3 bg-[#ADFF44] rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-4">
                                            <Play className="w-5 h-5 cursor-pointer hover:text-[#ADFF44]" />
                                            <span className="text-xs font-medium">04:20 / 12:45</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs bg-neutral-900/10 px-2 py-0.5 rounded font-medium cursor-pointer">1x</span>
                                            <Maximize2 className="w-5 h-5 cursor-pointer hover:text-[#ADFF44]" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-neutral-900 flex flex-col">
                                <div className="flex-1 p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold text-white mb-4">Introduction to LLMs</h2>
                                        <ul className="text-left list-disc text-neutral-400 space-y-2 max-w-md mx-auto text-lg">
                                            <li>History of Language Models</li>
                                            <li>Transformer Architecture</li>
                                            <li>Attention Mechanisms</li>
                                            <li>Fine-tuning vs. RAG</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="h-14 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between px-6 bg-gray-50 dark:bg-black/50">
                                    <span className="text-xs text-gray-500 dark:text-neutral-500 font-medium">Slide 4 of 28</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-neutral-500"><ChevronLeft className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-neutral-500"><ChevronRight className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-neutral-900 dark:bg-black p-1 rounded-xl inline-flex shadow-sm border border-gray-100 dark:border-neutral-800 w-fit">
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'video' ? 'bg-black dark:bg-slate-100 text-white dark:text-white shadow-md' : 'text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-slate-100'}`}
                        >
                            <Play className="w-4 h-4" /> Video Lesson
                        </button>
                        <button
                            onClick={() => setActiveTab('slides')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'slides' ? 'bg-[#ADFF44] text-black shadow-md' : 'text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-slate-100'}`}
                        >
                            <FileText className="w-4 h-4" /> Smart Slides
                        </button>
                    </div>
                </div>

                {/* Right Panel: Chatbot */}
                <div className="lg:col-span-4 h-full flex flex-col bg-neutral-900 dark:bg-black rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl shadow-black/50 dark:shadow-black/50 overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between bg-neutral-900 dark:bg-black">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[#ADFF44]/5 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-[#ADFF44]" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">Ai Teaching Assistant</h3>
                                <p className="text-[10px] text-[#ADFF44] dark:text-[#ADFF44] font-medium bg-[#ADFF44]/5 dark:bg-[#ADFF44]/10/30 px-1.5 rounded w-fit">Powered by Gemini 1.5</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full dark:text-neutral-500"><MoreVertical className="w-4 h-4 text-gray-400" /></Button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/50">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[#ADFF44] to-[#8BCC36] text-white rounded-tr-sm'
                                        : 'bg-neutral-900 dark:bg-slate-800 text-neutral-300 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm'
                                        }`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-[#ADFF44]/20' : 'text-gray-400 dark:text-neutral-500'}`}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-neutral-900 dark:bg-black border-t border-gray-50 dark:border-neutral-800">
                        <form onSubmit={sendMessage} className="relative">
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask anything about the video..."
                                className="pr-24 pl-4 py-6 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 focus:bg-neutral-900 dark:focus:bg-black transition-all shadow-inner focus:shadow-[#ADFF44]/10 dark:focus:shadow-[#ADFF44]/10 focus:border-[#ADFF44]/30 dark:focus:border-[#ADFF44]/30 text-white dark:text-slate-100"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#ADFF44]"><Paperclip className="w-4 h-4" /></Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#ADFF44]"><Mic className="w-4 h-4" /></Button>
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-9 w-9 bg-[#ADFF44] hover:bg-[#9BE63D] text-black rounded-lg shadow-md shadow-[#ADFF44]/20 transition-all hover:scale-105"
                                    disabled={!inputText.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiTutor;
