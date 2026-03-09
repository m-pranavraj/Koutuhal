import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, GraduationCap, Building2, Star } from "lucide-react";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const signupRoles: { value: AppRole; label: string; icon: React.ReactNode }[] = [
  { value: "student", label: "Student", icon: <GraduationCap className="h-5 w-5" /> },
  { value: "mentor", label: "Mentor", icon: <Star className="h-5 w-5" /> },
  { value: "college", label: "College / Placement Cell", icon: <Building2 className="h-5 w-5" /> },
  { value: "organization", label: "Organization / Employer", icon: <Briefcase className="h-5 w-5" /> },
];

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("student");
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const { user, roles, signIn, signUp, assignRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is authenticated and has roles, redirect to dashboard
  if (!loading && user && roles.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated but has no roles, show role selection
  const needsRoleSelection = !loading && user && roles.length === 0;

  const handleRoleAssignment = async () => {
    setSubmitting(true);
    try {
      const displayName = user?.user_metadata?.full_name || fullName || "User";
      await assignRole(role, role === "organization" || role === "college" ? displayName : undefined);
      toast({ title: "Welcome!", description: "Your account is ready." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName, role);
        toast({ title: "Account created!", description: "Check your email to verify, then sign in." });
        setIsSignUp(false);
        setSubmitting(false);
      } else {
        await signIn(email, password);
        // Auth state change will trigger redirect via the Navigate above
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth",
      },
    });
    if (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  // Role selection screen for OAuth users without roles
  if (needsRoleSelection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-2xl font-extrabold">Talent<span className="text-primary">Bridge</span></span>
          </div>
          <Card className="border shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
              <CardDescription>Welcome {user?.user_metadata?.full_name || ""}! Select how you'll use TalentBridge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                {signupRoles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${role === r.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="text-primary">{r.icon}</div>
                    <span className="font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full h-12 text-base font-bold" onClick={handleRoleAssignment} disabled={submitting}>
                {submitting ? "Setting up..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-foreground p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="max-w-md text-background">
          <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
            Campus hiring,<br />
            <span className="text-primary">simplified.</span>
          </h1>
          <p className="text-lg opacity-70 leading-relaxed">The platform where students find opportunities, colleges track placements, and organizations discover talent.</p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {signupRoles.map((item) => (
              <div key={item.value} className="flex flex-col items-center gap-2 rounded-xl border border-border/20 bg-background/5 p-4">
                <div className="text-primary">{item.icon}</div>
                <span className="text-sm font-medium text-center">{item.label.split("/")[0].trim()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-2xl font-extrabold">Talent<span className="text-primary">Bridge</span></span>
          </div>
          <Card className="border shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
              <CardDescription>{isSignUp ? "Join the platform and start your journey" : "Sign in to your account"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full h-12 text-base font-medium" onClick={handleGoogleSignIn}>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </Button>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground">or</span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
                        </div>
                        <div>
                          <Label htmlFor="role">I am a...</Label>
                          <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {signupRoles.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  <div className="flex items-center gap-2">{r.icon}<span>{r.label}</span></div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-bold" disabled={submitting}>
                    {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                  {!isSignUp && (
                    <p className="text-center">
                      <button type="button" onClick={() => setForgotOpen(true)} className="text-sm text-primary hover:underline">
                        Forgot your password?
                      </button>
                    </p>
                  )}
                  <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline">
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </form>
              </div>
            </CardContent>
          </Card>
          <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
