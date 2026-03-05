import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OnboardingRolePage() {
    const { completeProfile, user } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (!selectedRole) return;
        setIsSubmitting(true);
        try {
            await completeProfile({ role: selectedRole });
            toast.success("Role assigned successfully!");
            navigate("/dashboard");
        } catch (error) {
            toast.error("Failed to assign role.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const roles = [
        {
            id: "STUDENT",
            title: "Student / Learner",
            description: "I am preparing for jobs and learning skills.",
            icon: GraduationCap,
        },
        {
            id: "MENTOR",
            title: "Mentor / Expert",
            description: "I want to guide students and review resumes.",
            icon: User,
        },
        {
            id: "ORGANISATION",
            title: "Recruiter / Company",
            description: "I am looking to hire talent.",
            icon: Building2,
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome, {user?.name}</h1>
                    <p className="text-zinc-400 text-lg">Tell us who you are to get started.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-all border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 ${selectedRole === role.id ? "ring-2 ring-[#ADFF44] border-[#ADFF44]" : ""
                                }`}
                            onClick={() => handleRoleSelect(role.id)}
                        >
                            <CardHeader>
                                <role.icon className="w-10 h-10 text-[#ADFF44] mb-2" />
                                <CardTitle className="text-white">{role.title}</CardTitle>
                                <CardDescription>{role.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="bg-[#ADFF44] text-black hover:bg-[#baff66] min-w-[200px]"
                        disabled={!selectedRole || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? "Setting Up..." : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
