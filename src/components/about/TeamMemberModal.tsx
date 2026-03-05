import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
    expertise: string[];
    quote?: string;
    isFounded?: boolean;
}

interface TeamMemberModalProps {
    member: TeamMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TeamMemberModal = ({ member, isOpen, onClose }: TeamMemberModalProps) => {
    if (!member) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            {/* Close Button */}
                            <div className="sticky top-0 flex justify-end p-4 bg-neutral-950 border-b border-neutral-800">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                {/* Image */}
                                <div className="flex justify-center">
                                    <div className="relative w-48 h-64 rounded-2xl overflow-hidden border border-neutral-800">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {member.isFounded && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-[#ADFF44] text-black px-3 py-1 rounded-full text-xs font-bold">
                                                    FOUNDER
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Name & Role */}
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white mb-2">{member.name}</h2>
                                    <p className="text-[#ADFF44] font-semibold text-lg">{member.role}</p>
                                </div>

                                {/* Bio */}
                                <div className="space-y-4">
                                    <p className="text-neutral-300 leading-relaxed text-justify">
                                        {member.bio}
                                    </p>

                                    {member.quote && (
                                        <blockquote className="border-l-4 border-[#ADFF44] pl-6 italic text-neutral-400 my-6">
                                            "{member.quote}"
                                        </blockquote>
                                    )}

                                    {/* Expertise */}
                                    <div>
                                        <h3 className="text-white font-bold mb-3">Expertise</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {member.expertise.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-lg text-sm text-neutral-300 hover:border-[#ADFF44] transition-colors"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
