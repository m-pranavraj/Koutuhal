import { Badge } from "@/components/ui/badge";
import { Brain, Users, Rocket, Target, Quote, TrendingUp } from "lucide-react";
import founderImage from "@/assets/milind_kamble.jpg";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-20">

            {/* ━━━ FOUNDER STORY ━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 px-4 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">

                        {/* Image / Visual (Left on Desktop) */}
                        <div className="order-1 lg:order-1 lg:col-span-3 flex justify-center lg:justify-start">
                            <div className="relative z-10 w-full max-w-[220px]">
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 relative group transform hover:scale-[1.02] transition-transform duration-500">
                                    <img
                                        src={founderImage}
                                        alt="Milind Kamble - Founder & CEO"
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6">
                                        <p className="text-white font-bold text-xl">Milind Kamble</p>
                                        <p className="text-[#ADFF44] text-sm font-medium">Founder & CEO, Koutuhal.ai</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content (Right on Desktop) */}
                        <div className="order-2 lg:order-2 lg:col-span-9">
                            <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">EXECUTIVE PROFILE</Badge>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                                Milind Kamble <br />
                                <span className="text-neutral-500 text-3xl">Founder & CEO</span>
                            </h1>

                            <div className="space-y-6 text-neutral-400 text-lg leading-relaxed mb-8">
                                <p>
                                    A seasoned B2B SaaS leader with over <span className="text-white font-bold">10 years of transformative experience</span> in the US market. Milind brings exceptional expertise in enterprise software, AI-driven solutions, and commercial growth strategies.
                                </p>
                                <p>
                                    His journey combines world-class academic credentials from <span className="text-white">IIM Shillong</span> and <span className="text-white">NIT Nagpur</span> with proven leadership across innovative technology organizations like <span className="text-white">Simplilearn, Hivel.ai, and Skit.ai</span>.
                                </p>
                                <blockquote className="border-l-4 border-[#ADFF44] pl-6 italic text-neutral-300 my-8">
                                    "We are leveraging a decade of enterprise software experience to create AI-powered solutions that transform how businesses operate in the digital age."
                                </blockquote>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mt-10">
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Strategic Leadership</h4>
                                    <p className="text-sm text-neutral-500">Ex-Director at Hivel.ai & Associate Director at Skit.ai (US).</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-1">Commercial Growth</h4>
                                    <p className="text-sm text-neutral-500">Led global commercial business at Simplilearn.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ PLATFORM FEATURES ━━━━━━━━━━━━━━━ */}
            <section className="py-24 px-4 bg-neutral-900/30 border-t border-neutral-800">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-white/10 text-white border-0 px-3 py-1 text-xs font-display">WHY KOUTUHAL?</Badge>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                            Engineered for <span className="text-[#ADFF44]">Success</span>.
                        </h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                            We don't just teach. We provide the enterprise-grade tools you need to crack top roles.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl hover:border-[#ADFF44]/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 group-hover:bg-[#ADFF44] transition-colors">
                                <Rocket className="w-7 h-7 text-[#ADFF44] group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">AI Resume ATS</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Beat the bots with our proprietary ATS scanner. Get a similarity score against your target JD and AI-generated suggestions to boost your ranking.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl hover:border-[#ADFF44]/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 group-hover:bg-[#ADFF44] transition-colors">
                                <Target className="w-7 h-7 text-[#ADFF44] group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Private Job Portal</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Exclusive access to hidden job listings from our partner network. Direct referrals to hiring managers, bypassing the standard queue.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl hover:border-[#ADFF44]/50 transition-colors group">
                            <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-6 group-hover:bg-[#ADFF44] transition-colors">
                                <TrendingUp className="w-7 h-7 text-[#ADFF44] group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Gamified Ranking</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                Compete on the global leaderboard. Top-ranked candidates get highlighted directly to recruiters as "Elite Talent".
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};
export default AboutPage;
