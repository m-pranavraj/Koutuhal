import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const BookACallPage = () => {
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
                            <Badge className="mb-6 bg-white/10 text-white border-0 px-3 py-1 text-xs font-display">SCHEDULE A CALL</Badge>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                                Let's Talk About Your <br />
                                <span className="text-[#ADFF44]">Career Goals</span>
                            </h2>
                            <p className="text-neutral-400 text-lg mb-8 max-w-md">
                                Share your details and we'll schedule a personalized call to discuss your career readiness journey, upcoming programs, or any questions you have.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium">Quick Scheduling</p>
                                        <span className="text-lg font-bold text-white">We'll follow up within 24 hours</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-[#ADFF44]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium">Flexible Format</p>
                                        <span className="text-lg font-bold text-white">Phone, video, or in-person</span>
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
                                    <h3 className="text-2xl font-bold text-white mb-2">Call Scheduled!</h3>
                                    <p className="text-neutral-400 mb-8">
                                        Thank you for your interest. Our team will contact you shortly to confirm the call details.
                                    </p>
                                    <Button
                                        onClick={() => window.location.href = '/book-a-call'}
                                        variant="outline"
                                        className="border-neutral-800 hover:bg-neutral-800"
                                    >
                                        Schedule another call
                                    </Button>
                                </div>
                            ) : (
                                <form
                                    action="https://formsubmit.co/milind@koutuhal.in"
                                    method="POST"
                                    className="space-y-4"
                                >
                                    {/* FormSubmit Configuration */}
                                    <input type="hidden" name="_subject" value="New Book a Call Request - Koutuhal.ai" />
                                    <input type="hidden" name="_template" value="table" />
                                    <input type="hidden" name="_captcha" value="false" />
                                    <input type="hidden" name="_next" value="https://koutuhal.in/" />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">First Name</label>
                                            <input
                                                name="first_name"
                                                type="text"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Last Name</label>
                                            <input
                                                name="last_name"
                                                type="text"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Email</label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Mobile Number</label>
                                            <input
                                                name="mobile"
                                                type="tel"
                                                required
                                                className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">What's your background?</label>
                                        <select
                                            name="background"
                                            required
                                            className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                        >
                                            <option value="">Select an option</option>
                                            <option value="Student">Student</option>
                                            <option value="Recent Graduate">Recent Graduate</option>
                                            <option value="Career Switcher">Career Switcher</option>
                                            <option value="Instructor/Educator">Instructor/Educator</option>
                                            <option value="University/Institution">University/Institution</option>
                                            <option value="Employer/Hiring Partner">Employer/Hiring Partner</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">What would you like to discuss?</label>
                                        <textarea
                                            name="discussion_topic"
                                            required
                                            className="w-full h-24 rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">Preferred Time Zone</label>
                                        <input
                                            name="timezone"
                                            type="text"
                                            className="w-full h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-4 text-white focus:outline-none focus:border-[#ADFF44] transition-all"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold rounded-xl mt-2">
                                        Schedule My Call <ArrowRight className="ml-2 w-4 h-4 text-black" />
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

export default BookACallPage;
