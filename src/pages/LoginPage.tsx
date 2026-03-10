import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Sparkles, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { signIn, signInWithGoogle, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const from = (location.state as any)?.from?.pathname || "/dashboard";

    const handleLogin = async (method: 'google' | 'email') => {
        setError('');
        try {
            if (method === 'google') {
                await signInWithGoogle();
                // OAuth redirects — no navigate needed
            } else {
                await signIn(email, password);
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
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
                        <img src="/logo.png" alt="Koutuhal Logo" className="h-14 w-auto object-contain" />
                        <span className="text-xl font-display font-bold text-white tracking-tight">Koutuhal.ai</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-5xl font-display font-bold text-white mb-6">Unlock your potential.</h1>
                    <p className="text-xl text-neutral-400 mb-8">Join the community of 10,000+ professionals mastering AI and accelerating their careers.</p>

                    <div className="flex gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800" />
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-white font-bold text-sm">10k+ Learners</span>
                            <span className="text-neutral-500 text-xs">Joined last month</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-end text-neutral-500 text-sm">
                    <p>© 2024 Koutuhal Pathways</p>
                    <p>Privacy Policy</p>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center p-6 bg-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
                        <p className="mt-2 text-sm text-neutral-400">Enter your credentials to access your account</p>
                    </div>

                    <div className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}


                        <div className="space-y-2">
                            <Label className="text-white font-medium">Email</Label>
                            <Input
                                placeholder="name@example.com"
                                className="bg-neutral-900 border-neutral-800 text-white h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-white font-medium">Password</Label>
                                <a href="#" className="text-xs text-[#ADFF44] hover:underline">Forgot password?</a>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-neutral-900 border-neutral-800 text-white h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full h-12 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold"
                            onClick={() => handleLogin('email')}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-neutral-500">Don't have an account? </span>
                        <Link to="/register" className="text-[#ADFF44] font-bold hover:underline">
                            Sign Up
                        </Link>
                    </div>

                    <p className="px-8 text-center text-sm text-neutral-500">
                        By clicking continue, you agree to our{" "}
                        <a href="#" className="underline hover:text-white">Terms of Service</a> and{" "}
                        <a href="#" className="underline hover:text-white">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
