import { Badge } from "@/components/ui/badge";
import { Brain, Users, Rocket, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { TeamMemberModal } from "@/components/about/TeamMemberModal";
import founderImage from "@/assets/milind_kamble.jpg";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
    expertise: string[];
    quote?: string;
    isFounded?: boolean;
    linkedin?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        id: "milind",
        name: "Milind Kamble",
        role: "Founder & CEO",
        image: founderImage,
        isFounded: true,
        bio: "A seasoned B2B SaaS leader with over 10 years of transformative experience in the US market. Milind brings exceptional expertise in enterprise software, AI-driven solutions, and commercial growth strategies. His journey combines world-class academic credentials from IIM Shillong and NIT Nagpur with proven leadership across innovative technology organizations like Simplilearn, Hivel.ai, and Skit.ai. At Koutuhal, he's driving the vision to democratize career acceleration through AI-powered learning and job matching.",
        expertise: ["Enterprise SaaS", "AI Strategy", "Commercial Growth", "Team Leadership", "B2B Sales"],
        quote: "We are leveraging a decade of enterprise software experience to create AI-powered solutions that transform how individuals accelerate their careers.",
        linkedin: "https://in.linkedin.com/in/milind-kamble-96a16946",
    },
    {
        id: "founding-engineer",
        name: "M Pranav Raj",
        role: "Founding Engineer (Tech)",
        image: "/team/profile pic.jpeg",
        bio: "Our exceptional founding engineer bringing world-class technical expertise to build Koutuhal's AI-powered platform. Driving innovation in web development, machine learning, automations, product development, agentic AI, and multi-agent systems.",
        expertise: ["Web Development", "AI/ML", "Automations", "Product Development", "Agentic AI", "Multi-Agent Systems"],
    },
    {
        id: "founders-office",
        name: "Aldrich Christie",
        role: "Founders Office",
        image: "/team/ALDIRCH.png",
        bio: "Driving operational excellence and strategic initiatives from the founder's office. Managing key partnerships, go-to-market strategy, and organizational scaling at Koutuhal.",
        expertise: ["Operations", "Strategy", "Partnerships", "Growth", "Analytics"],
    },
    {
        id: "designer",
        name: "Advitya Sirohi",
        role: "Designer",
        image: "/team/image.png",
        bio: "Creating beautiful, intuitive user experiences that make career acceleration delightful. Focused on design systems, user research, and product aesthetics at Koutuhal.",
        expertise: ["UI/UX Design", "Design Systems", "User Research", "Figma", "Design Thinking"],
    },
];

const AboutPage = () => {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (member: TeamMember) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-20">

            {/* ━━━ TEAM SECTION ━━━━━━━━━━━━━━━━━━━ */}
            <section className="py-24 px-4 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">OUR TEAM</Badge>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            Meet the Visionaries <br />
                            <span className="text-neutral-500">Building the Future of Career Growth</span>
                        </h1>
                        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                            Backed by decades of enterprise experience and a passion for transforming careers through AI.
                        </p>
                    </div>

                    {/* Team Grid - Founder Featured */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Founder - Large Featured Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => openModal(TEAM_MEMBERS[0])}
                            className="md:col-span-2 relative group cursor-pointer"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#ADFF44] to-[#ADFF44]/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

                            <div className="relative bg-neutral-950 border-2 border-[#ADFF44] rounded-3xl overflow-hidden p-8">
                                {/* Founder Badge */}
                                <div className="absolute top-6 right-6 z-10">
                                    <span className="bg-[#ADFF44] text-black px-4 py-2 rounded-full text-sm font-bold">
                                        ⭐ FOUNDER & CEO
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    {/* Image */}
                                    <div className="relative group/image">
                                        <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
                                            <img
                                                src={TEAM_MEMBERS[0].image}
                                                alt={TEAM_MEMBERS[0].name}
                                                className="w-full h-full object-cover filter grayscale group-hover/image:grayscale-0 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                                {TEAM_MEMBERS[0].name}
                                            </h2>
                                            <p className="text-[#ADFF44] text-lg font-semibold mb-4">
                                                {TEAM_MEMBERS[0].role}
                                            </p>
                                            <p className="text-neutral-300 leading-relaxed text-sm md:text-base line-clamp-4">
                                                {TEAM_MEMBERS[0].bio}
                                            </p>
                                        </div>

                                        {TEAM_MEMBERS[0].quote && (
                                            <blockquote className="border-l-4 border-[#ADFF44] pl-4 italic text-neutral-400 text-sm">
                                                "{TEAM_MEMBERS[0].quote}"
                                            </blockquote>
                                        )}

                                        {/* Expertise */}
                                        <div className="flex flex-wrap gap-2">
                                            {TEAM_MEMBERS[0].expertise.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg text-xs text-neutral-300 hover:border-[#ADFF44] transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <button className="group/btn flex items-center gap-2 text-[#ADFF44] font-semibold hover:text-white transition-colors">
                                            View Full Profile
                                            <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats/About  */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 space-y-8"
                        >
                            <div>
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 text-[#ADFF44]">
                                    Leadership Credentials
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-neutral-400 text-sm">Current</p>
                                        <p className="text-white font-bold">Founder & CEO, Koutuhal.ai</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 text-sm">Past Ventures</p>
                                        <p className="text-white font-bold text-sm">Hivel.ai, Skit.ai, Simplilearn</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-400 text-sm">Education</p>
                                        <p className="text-white font-bold text-sm">IIM Shillong, NIT Nagpur</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-neutral-800 pt-8">
                                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 text-[#ADFF44]">
                                    Experience
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#ADFF44] font-bold text-lg">10+</span>
                                        <p className="text-neutral-400 text-sm">Years in B2B SaaS</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#ADFF44] font-bold text-lg">5+</span>
                                        <p className="text-neutral-400 text-sm">Companies Built/Grown</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#ADFF44] font-bold text-lg">$12M</span>
                                        <p className="text-neutral-400 text-sm">In Revenue Generated</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Other Team Members */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-8">Our Growing Leadership Team</h3>
                        <div className="flex flex-col md:flex-row gap-8 justify-center overflow-x-auto pb-4">
                            {TEAM_MEMBERS.slice(1).map((member, idx) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    onClick={() => openModal(member)}
                                    className="group cursor-pointer flex-shrink-0 w-full md:w-64"
                                >
                                    <div className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden hover:border-[#ADFF44]/50 transition-all duration-500 h-full flex flex-col">
                                        {/* Image - Vertical Rectangle */}
                                        <div className="relative h-72 overflow-hidden bg-neutral-900">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className={cn(
                                                    "w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700",
                                                    member.id === "founding-engineer" && "object-top scale-[1.3]"
                                                )}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                                            <p className="text-[#ADFF44] font-semibold mb-3 text-sm">{member.role}</p>
                                            <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">
                                                {member.bio}
                                            </p>

                                            {/* Expertise */}
                                            <div className="flex flex-wrap gap-1">
                                                {member.expertise.slice(0, 2).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs text-neutral-400"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* CTA */}
                                            <button className="group/btn mt-4 flex items-center gap-1 text-[#ADFF44] text-xs font-semibold hover:text-white transition-colors">
                                                Learn More
                                                <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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

            {/* Team Member Modal */}
            <TeamMemberModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default AboutPage;