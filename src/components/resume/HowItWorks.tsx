import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, MessageSquare, UserCheck } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Upload Your Resume",
        description: "Drag & drop your PDF. Our system parses it instantly using layout-aware AI.",
        icon: Upload
    },
    {
        id: 2,
        title: "Get Comprehensive Scorecard",
        description: "Receive a detailed score on ATS parsability, impact, and structure.",
        icon: FileText
    },
    {
        id: 3,
        title: "Review Suggested Enhancements",
        description: "See exactly what keywords are missing and how to fix your bullets.",
        icon: CheckCircle2
    },
    {
        id: 4,
        title: "Discuss Changes with AI Coach",
        description: "Chat with our specialized AI to rewrite weak sections instantly.",
        icon: MessageSquare
    },
    {
        id: 5,
        title: "Get Feedback from Experts",
        description: "Final verification from human mentors for that extra edge.",
        icon: UserCheck
    }
];

const HowItWorks = () => {
    const [hoveredId, setHoveredId] = useState<number | null>(2); // Default open 2nd

    return (
        <section className="py-24 bg-neutral-900 dark:bg-black">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white">
                        How it Works <span className="text-[#ADFF44]">(Like Magic)</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px]">
                    {steps.map((step) => {
                        const isHovered = hoveredId === step.id;

                        return (
                            <motion.div
                                key={step.id}
                                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out border ${isHovered ? 'border-[#ADFF44]/30 ring-4 ring-[#ADFF44]/20 dark:ring-[#ADFF44]/10' : 'border-gray-200 dark:border-neutral-800'}`}
                                onMouseEnter={() => setHoveredId(step.id)}
                                onClick={() => setHoveredId(step.id)} // For mobile tap
                                layout
                                style={{
                                    flex: isHovered ? 3 : 1,
                                    backgroundColor: isHovered ? '#f3e8ff' : '#ffffff'
                                }}
                            >
                                {/* Active State Background (Purple) */}
                                {isHovered ? (
                                    <div className="absolute inset-0 bg-[#ADFF44]/10 dark:bg-[#ADFF44]/10/20 z-0" />
                                ) : (
                                    <div className="absolute inset-0 bg-neutral-900 dark:bg-black z-0" />
                                )}

                                <div className="relative z-10 p-8 flex flex-col h-full">
                                    {/* Number Badge */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-6 transition-colors ${isHovered
                                            ? 'bg-[#ADFF44] text-black'
                                            : 'bg-slate-100 text-neutral-500 dark:bg-slate-800'
                                        }`}>
                                        {step.id}
                                    </div>

                                    <h3 className={`text-xl font-bold mb-4 transition-colors ${isHovered ? 'text-[#ADFF44] dark:text-[#ADFF44]/20' : 'text-white dark:text-white'}`}>
                                        {step.title}
                                    </h3>

                                    {/* Icon - Always visible, but larger on active */}
                                    <motion.div
                                        className="mt-auto mb-8"
                                        animate={{ scale: isHovered ? 1.2 : 1 }}
                                    >
                                        <step.icon className={`w-12 h-12 ${isHovered ? 'text-[#ADFF44]' : 'text-neutral-400'}`} />
                                    </motion.div>

                                    {/* Description - Only visible when expanded */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isHovered ? 1 : 0 }}
                                        className="absolute bottom-8 left-8 right-8"
                                    >
                                        <p className="text-neutral-300 dark:text-neutral-400 font-medium">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
