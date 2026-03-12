import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const FilterSection = ({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-neutral-800 py-4 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full mb-3 text-xs font-bold text-white/50 hover:text-primary transition-all tracking-widest uppercase"
            >
                {title}
                <div className={cn("transition-transform duration-300", !isOpen && "rotate-180")}>
                    <ChevronUp className="w-3 h-3" />
                </div>
            </button>
            {isOpen && (
                <div className="space-y-2 pb-2 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Sidebar = () => {
    return (
        <aside className="w-full lg:w-72 glass-card rounded-2xl p-6 h-fit lg:sticky lg:top-24 shadow-premium">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Filter className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-xl text-white tracking-tight">Filter Talent</h2>
            </div>

            <FilterSection title="AI Stack">
                {['ChatGPT', 'Midjourney', 'Python', 'LangChain', 'Stable Diffusion'].map((stack) => (
                    <label key={stack} className="flex items-center gap-3 cursor-pointer group py-0.5">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-white/20 checked:bg-primary checked:border-primary transition-all cursor-pointer hover:border-primary/50" />
                            <Check className="absolute w-3 h-3 text-black hidden peer-checked:block pointer-events-none left-0.5 stroke-[4]" />
                        </div>
                        <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{stack}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Role">
                {['Prompt Engineer', 'AI Researcher', 'MLOps', 'Data Scientist'].map((role) => (
                    <label key={role} className="flex items-center gap-3 cursor-pointer group py-0.5">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-white/20 checked:bg-primary checked:border-primary transition-all cursor-pointer hover:border-primary/50" />
                            <Check className="absolute w-3 h-3 text-black hidden peer-checked:block pointer-events-none left-0.5 stroke-[4]" />
                        </div>
                        <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{role}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Availability">
                <label className="flex items-center gap-3 cursor-pointer py-1">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-5 bg-neutral-800 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-neutral-500 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-black"></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Available this week</span>
                </label>
            </FilterSection>

            <div className="mt-6 pt-6 border-t border-white/10">
                <label className="text-sm font-bold text-white mb-4 block tracking-wide uppercase text-[10px] opacity-70">Experience (Years)</label>
                <div className="px-1">
                    <input type="range" min="0" max="10" className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary" />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-medium">
                        <span>ENTRY</span>
                        <span>10+ YRS</span>
                    </div>
                </div>
            </div>

            <Button className="w-full mt-8 btn-green shadow-lg" size="sm">
                Apply Filters
            </Button>
        </aside>
    );
};
