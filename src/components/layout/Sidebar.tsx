import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

const FilterSection = ({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-neutral-800 py-4 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-white hover:text-[#ADFF44] transition-colors"
            >
                {title}
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
        <aside className="w-full lg:w-72 bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-6 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-900 border-b border-gray-100 pb-4">
                <Filter className="w-5 h-5 text-[#ADFF44]" />
                <h2 className="font-bold text-lg text-white">Filter Talent</h2>
            </div>

            <FilterSection title="AI Stack">
                {['ChatGPT', 'Midjourney', 'Python', 'LangChain', 'Stable Diffusion'].map((stack) => (
                    <label key={stack} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-neutral-600 checked:bg-[#ADFF44] checked:border-[#ADFF44] transition-all cursor-pointer" />
                            <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none left-0.5" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{stack}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Role">
                {['Prompt Engineer', 'AI Researcher', 'MLOps', 'Data Scientist'].map((role) => (
                    <label key={role} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input type="checkbox" className="peer w-4 h-4 appearance-none rounded border border-neutral-600 checked:bg-[#ADFF44] checked:border-[#ADFF44] transition-all cursor-pointer" />
                            <svg className="absolute w-3 h-3 text-white hidden peer-checked:block pointer-events-none left-0.5" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">{role}</span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Availability">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#ADFF44]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ADFF44]"></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-300">Available this week</span>
                </label>
            </FilterSection>

            <div className="mt-4 pt-4 border-t border-neutral-800">
                <label className="text-sm font-semibold text-white mb-2 block">Experience (Years)</label>
                <input type="range" min="0" max="10" className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#ADFF44]" />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>0 Years</span>
                    <span>10+ Years</span>
                </div>
            </div>
        </aside>
    );
};
