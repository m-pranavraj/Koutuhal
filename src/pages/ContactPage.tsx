import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const ContactPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isSuccess = queryParams.get('success') === 'true';

    return (
        <div className="min-h-screen bg-black text-white pt-20">
            <section className="py-24 px-4 bg-black relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ADFF44]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left: Content */}
                        <div>
                            <Badge className="mb-6 bg-white/10 text-white border-0 px-3 py-1 text-xs font-display">GET IN TOUCH</Badge>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                                Have questions? <br />
                                <span className="text-[#ADFF44]">Let's chat.</span>
                            </h2>
                            <p className="text-neutral-400 text-lg mb-8 max-w-md">
                                Whether you're a student, a university, or a hiring partner, we're here to help you get started.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium">Email us at</p>
                                        <a href="mailto:info@koutuhal.in" className="text-lg font-bold text-white hover:text-[#ADFF44] transition-colors">info@koutuhal.in</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-5 h-5 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium">Hiring / Partnerships</p>
                                        <span className="text-lg font-bold text-white">Open for Collaboration</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 backdrop-blur-sm relative z-10">
                            {isSuccess ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-[#ADFF44]/20 flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-8 h-8 text-[#ADFF44]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                    <p className="text-neutral-400 mb-8">
                                        Thank you for reaching out. We've received your message and will get back to you shortly.
                                    </p>
                                    <Button
                                        onClick={() => window.location.href = '/contact'}
                                        variant="outline"
                                        className="border-neutral-800 hover:bg-neutral-800"
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <form
                                    action="https://formsubmit.co/milind@koutuhal.in"
                                    method="POST"
                                    className="space-y-4"
                                >
                                    {/* FormSubmit Configuration */}
                                    <input type="hidden" name="_subject" value="New Contact Form Submission - Koutuhal.ai" />
                                    <input type="hidden" name="_template" value="table" />
                                    <input type="hidden" name="_captcha" value="false" />
                                    <input type="hidden" name="_next" value="https://koutuhal.in/contact?success=true" />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">First Name</label>
                                            <input
                                                name="first_name"
                                                type="text"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                                placeholder="Jane"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Last Name</label>
                                            <input
                                                name="last_name"
                                                type="text"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            className="w-full h-32 rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-xl mt-2">
                                        Send Message <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
