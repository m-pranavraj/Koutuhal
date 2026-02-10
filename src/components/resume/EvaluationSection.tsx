import { Zap, TrendingUp, Layout, Award, Search } from 'lucide-react';

const EvaluationSection = () => {
    const dimensions = [
        { icon: Zap, title: "ATS Friendly Formatting" },
        { icon: TrendingUp, title: "Career Trajectory" },
        { icon: Layout, title: "Structural Strength" },
        { icon: Award, title: "Measurable Achievements" },
        { icon: Search, title: "Execution Depth" }
    ];

    const stats = [
        { title: "Proprietary Evaluation", subtitle: "A-TEAM Framework" },
        { title: "10+ Pages of Detailed", subtitle: "Analysis and Suggestions" },
        { title: "Trusted by Ivy League MBAs", subtitle: "and MAANG Employees" }
    ];

    return (
        <section className="bg-gradient-to-r from-black via-neutral-900 to-black py-20 text-white relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-16">Evaluate Every Dimension</h2>

                {/* 5 Icons Row */}
                <div className="flex flex-wrap justify-center gap-6 mb-16">
                    {dimensions.map((d, i) => (
                        <div key={i} className="bg-neutral-900 text-white w-40 h-40 rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl hover:scale-105 transition-transform">
                            <d.icon className="w-10 h-10 text-white mb-4" />
                            <p className="font-semibold text-sm leading-tight">{d.title}</p>
                        </div>
                    ))}
                </div>

                {/* 3 Stats Row */}
                <div className="flex flex-wrap justify-center gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-neutral-900 text-white rounded-2xl py-4 px-8 shadow-xl min-w-[280px] flex flex-col justify-center">
                            <h4 className="font-bold text-lg text-white">{s.title}</h4>
                            <p className="text-neutral-500 text-sm">{s.subtitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EvaluationSection;
