import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight } from 'lucide-react';

const SignUpPage = () => {
    const { register, isLoading, authError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');

    const from = (location.state as any)?.from?.pathname || "/onboarding";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ name, email, password, role });
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Registration component error:", error);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Visuals */}
            <div className="hidden lg:flex flex-col justify-between bg-neutral-900 border-r border-neutral-800 p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/50 to-neutral-900" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 w-fit">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-black bg-[#ADFF44] text-lg">K</div>
                        <span className="text-xl font-display font-bold text-white tracking-tight">Koutuhal.ai</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-5xl font-display font-bold text-white mb-6">Start your AI journey.</h1>
                    <p className="text-xl text-neutral-400 mb-8">Join the community of 10,000+ professionals mastering AI and accelerating their careers.</p>
                </div>

                <div className="relative z-10 flex justify-between items-end text-neutral-500 text-sm">
                    <p>© 2024 Koutuhal Pathways</p>
                    <p>Privacy Policy</p>
                </div>
            </div>

            {/* Right: Register Form */}
            <div className="flex items-center justify-center p-6 bg-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                        <p className="mt-2 text-sm text-neutral-400">Join Koutuhal to unlock premium AI educational content</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {authError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {authError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-white font-medium">Full Name</Label>
                            <Input
                                placeholder="John Doe"
                                className="bg-neutral-900 border-neutral-800 text-white h-11"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white font-medium">Email</Label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                className="bg-neutral-900 border-neutral-800 text-white h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white font-medium">Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-neutral-900 border-neutral-800 text-white h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white font-medium">I am a...</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white h-11">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="MENTOR">Mentor</SelectItem>
                                    <SelectItem value="ORGANISATION">Organisation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-neutral-500">Already have an account? </span>
                        <Link to="/login" className="text-[#ADFF44] font-bold hover:underline">
                            Sign In
                        </Link>
                    </div>

                    <p className="px-8 text-center text-xs text-neutral-500">
                        By signing up, you agree to our{" "}
                        <a href="#" className="underline hover:text-white">Terms of Service</a> and{" "}
                        <a href="#" className="underline hover:text-white">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
