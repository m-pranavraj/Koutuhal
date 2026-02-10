import { useResume } from '@/context/ResumeContext';
import { cn } from '@/lib/utils';
import { Layout, AlignCenter, AlignLeft, Type, PenTool, Briefcase, Terminal, Feather } from 'lucide-react';

const templates = [
    { id: 'modern', name: 'The Modern', icon: Layout, color: 'bg-[#ADFF44]' },
    { id: 'harvard', name: 'The Harvard', icon: AlignLeft, color: 'bg-red-700' },
    { id: 'creative', name: 'Creative', icon: PenTool, color: 'bg-[#ADFF44]' },
    { id: 'executive', name: 'Executive', icon: Briefcase, color: 'bg-black' },
    { id: 'tech', name: 'Tech / Dev', icon: Terminal, color: 'bg-[#ADFF44]' },
    { id: 'elegant', name: 'Elegant', icon: Feather, color: 'bg-rose-400' },
] as const;

export const TemplateSelector = () => {
    const { resumeData, setTemplateId } = useResume();

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Select Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {templates.map((t) => {
                    const isActive = resumeData.templateId === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTemplateId(t.id)}
                            className={cn(
                                "relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                                isActive
                                    ? "border-[#ADFF44] bg-[#ADFF44]/5/50 dark:bg-[#ADFF44]/10/20"
                                    : "border-gray-100 dark:border-neutral-800 bg-neutral-900 dark:bg-black hover:border-[#ADFF44]/30"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white shadow-sm", t.color)}>
                                <t.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-semibold",
                                isActive ? "text-[#ADFF44]" : "text-gray-600"
                            )}>
                                {t.name}
                            </span>

                            {isActive && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ADFF44]"></div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
