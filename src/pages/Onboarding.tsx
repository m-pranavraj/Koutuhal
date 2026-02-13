import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Building2, User, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Onboarding = () => {
    const { completeProfile, user, isLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roles = [
        {
            id: 'STUDENT',
            title: 'Student',
            icon: GraduationCap,
            description: 'I want to build my resume, find jobs, and learn new skills.',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            id: 'MENTOR',
            title: 'Mentor',
            icon: BookOpen,
            description: 'I want to help students, review portfolios, and earn.',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            id: 'ORGANISATION',
            title: 'Organisation',
            icon: Building2,
            description: 'I am hiring talent and looking for the best candidates.',
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        }
    ];

    const handleSubmit = async () => {
        if (!selectedRole) return;

        setIsSubmitting(true);
        try {
            await completeProfile({ role: selectedRole });

            toast({
                title: "Welcome aboard! 🚀",
                description: `You are now joined as a ${selectedRole.toLowerCase()}.`,
            });

            navigate('/dashboard');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to complete profile.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return null; // Or loader

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center px-4 bg-black/95">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6">
                    Who are you?
                </h1>
                <p className="text-lg text-gray-400">
                    Select your primary role to customize your experience.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
                {roles.map((role) => (
                    <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className={`p-6 h-full cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-sm border-2
                                ${selectedRole === role.id
                                    ? `border-[${role.color.split('-')[1]}] bg-opacity-20 ring-2 ring-offset-2 ring-offset-black ring-${role.color.split('-')[1]}-500`
                                    : 'border-white/10 hover:border-white/20 bg-black/40'
                                }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            {selectedRole === role.id && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircle2 className="w-6 h-6 text-[#ADFF44]" />
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl ${role.bg} flex items-center justify-center mb-6`}>
                                <role.icon className={`w-7 h-7 ${role.color}`} />
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
                            <p className="text-gray-400">{role.description}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Button
                size="lg"
                className={`text-lg px-12 py-6 rounded-full font-semibold transition-all duration-300
                    ${selectedRole
                        ? 'bg-[#ADFF44] text-black hover:bg-[#8eff00] shadow-[0_0_20px_rgba(173,255,68,0.3)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                disabled={!selectedRole || isSubmitting}
                onClick={handleSubmit}
            >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Setting up...
                    </div>
                ) : (
                    "Continue"
                )}
            </Button>
        </div>
    );
};

export default Onboarding;
