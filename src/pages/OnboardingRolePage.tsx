import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Briefcase, Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OnboardingRolePage() {
    const { assignRole, user, profile } = useAuth();
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
            await assignRole(selectedRole as any);
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
            id: "student",
            title: "Student / Learner",
            description: "I am preparing for jobs and learning skills.",
            icon: GraduationCap,
        },
        {
            id: "mentor",
            title: "Mentor / Expert",
            description: "I want to guide students and review resumes.",
            icon: User,
        },
        {
            id: "organization",
            title: "Recruiter / Company",
            description: "I am looking to hire talent.",
            icon: Building2,
        },
        {
            id: "college",
            title: "College / TPO",
            description: "I manage placement drives and students.",
            icon: Briefcase,
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome, {profile?.full_name?.split(' ')[0] || "there"}</h1>
                    <p className="text-zinc-400 text-lg">Tell us who you are to get started.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-all border-zinc-800 hover:bg-zinc-900 ${selectedRole === role.id ? "bg-[#ADFF44] ring-2 ring-[#ADFF44] border-[#ADFF44] shadow-[0_0_20px_rgba(173,255,68,0.3)]" : "bg-zinc-900/50"
                                }`}
                            onClick={() => handleRoleSelect(role.id)}
                        >
                            <CardHeader>
                                <role.icon className={`w-10 h-10 mb-2 transition-colors ${selectedRole === role.id ? "text-black" : "text-[#ADFF44]"}`} />
                                <CardTitle className={`transition-colors ${selectedRole === role.id ? "text-black" : "text-white"}`}>{role.title}</CardTitle>
                                <CardDescription className={`${selectedRole === role.id ? "text-black/70" : ""}`}>{role.description}</CardDescription>
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
