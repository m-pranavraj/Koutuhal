import { User, Target, Search, Briefcase, Gift, MessageSquare, TrendingUp, BookOpen, Star, ArrowRight, Zap, Trophy, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MentorStats } from "@/components/mentor/MentorStats";
import { AvailabilitySheet } from "@/components/mentor/AvailabilitySheet";

const Dashboard = () => {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-black transition-colors duration-300 font-sans selection:bg-[#ADFF44] selection:text-black">
      {/* Background Decorations (Subtle Noise & Glow) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#ADFF44]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#ADFF44]/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-20 relative z-10">

        {/* Isomorphic Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="relative">
            <div className="absolute -left-6 top-1 w-1 h-12 bg-[#ADFF44] rounded-full blur-[2px]"></div>
            <div className="flex items-center gap-4 mb-4">
              {/* Toggle Switch */}
              <div className="p-1 bg-white/5 border border-white/10 rounded-full flex gap-1 backdrop-blur-md">
                <button
                  onClick={() => setIsMentorMode(false)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${!isMentorMode ? 'bg-[#ADFF44] text-black shadow-[0_0_20px_rgba(173,255,68,0.3)]' : 'text-neutral-500 hover:text-white'}`}
                >
                  Student
                </button>
                <button
                  onClick={() => setIsMentorMode(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${isMentorMode ? 'bg-[#ADFF44] text-black shadow-[0_0_20px_rgba(173,255,68,0.3)]' : 'text-neutral-500 hover:text-white'}`}
                >
                  Mentor
                </button>
              </div>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-400 backdrop-blur-md">
                {isMentorMode ? 'Teacher Mode' : 'Learner Mode'}
              </Badge>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight leading-[1.1]">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">Pranav</span>
            </h1>
            <p className="text-neutral-400 mt-4 text-lg font-light max-w-md leading-relaxed">
              {isMentorMode
                ? "Manage your sessions and track your impact."
                : "Ready to accelerate your career path today?"
              }
            </p>
          </div>

          <div className="flex gap-4">
            {isMentorMode ? (
              <Button
                onClick={() => setIsAvailabilityOpen(true)}
                className="h-14 px-8 bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-bold rounded-full shadow-[0_0_30px_rgba(173,255,68,0.2)] hover:shadow-[0_0_50px_rgba(173,255,68,0.4)] transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4 mr-2 fill-current" /> Set Availability
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" className="h-14 px-6 rounded-full border-white/10 hover:bg-white/5 text-white bg-transparent backdrop-blur-sm">view Profile</Button>
                <Button className="h-14 px-8 bg-white text-black font-bold rounded-full shadow-lg hover:bg-neutral-200 transition-all hover:scale-105">
                  <Trophy className="w-4 h-4 mr-2 text-amber-500 fill-current" /> Resume Builder
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTENT MESH ================= */}
        <div className="grid grid-cols-12 gap-6 min-h-[500px]">

          {isMentorMode ? (
            /* MENTOR LAYOUT */
            <>
              <div className="col-span-12">
                <MentorStats />
              </div>

              {/* Upcoming Sessions Card */}
              <div className="col-span-12 lg:col-span-8 bg-neutral-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-hb from-[#ADFF44]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    Upcoming Sessions
                  </h2>
                  <Button variant="ghost" className="text-neutral-400 hover:text-white">View Calendar</Button>
                </div>

                <div className="space-y-4 relative z-10">
                  {[
                    { name: "Sarah Jenkins", time: "2:00 PM Today", topic: "Mock Interview: Frontend", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "In 10 min" },
                    { name: "Mike Ross", time: "4:30 PM Today", topic: "Resume Review", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", status: "Scheduled" },
                    { name: "Jessica Lee", time: "10:00 AM Tomorrow", topic: "Career Guidance", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica", status: "Tomorrow" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-black/40 border border-white/5 hover:border-[#ADFF44]/30 hover:bg-black/60 transition-all group/item">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <img src={session.img} alt={session.name} className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-black object-cover" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#ADFF44] rounded-full border-4 border-black" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover/item:text-[#ADFF44] transition-colors">{session.name}</h4>
                          <p className="text-neutral-500 font-medium">{session.topic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-white font-bold">{session.time}</p>
                          <Badge variant="secondary" className={`${session.status === 'In 10 min' ? 'bg-[#ADFF44] text-black' : 'bg-neutral-800 text-neutral-400'} border-none`}>
                            {session.status}
                          </Badge>
                        </div>
                        <Button size="icon" className="w-12 h-12 rounded-full bg-white text-black hover:bg-[#ADFF44] transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requests Panel */}
              <div className="col-span-12 lg:col-span-4 bg-black border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#ADFF44]/10 to-transparent pointer-events-none" />
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#ADFF44]" /> New Requests
                </h2>

                <div className="space-y-4 flex-1">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="bg-neutral-900/80 p-5 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center text-xs font-bold text-white">DK</div>
                          <div>
                            <p className="font-bold text-white text-sm">David Kim</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Student</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[#ADFF44]/30 text-[#ADFF44] bg-[#ADFF44]/5 text-[10px]">Review</Badge>
                      </div>
                      <p className="text-neutral-400 text-sm mb-4 leading-relaxed">"Hi, looking for a review of my portfolio..."</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" className="w-full bg-[#ADFF44] text-black hover:bg-white font-bold h-9">Accept</Button>
                        <Button size="sm" variant="outline" className="w-full border-white/10 text-neutral-400 hover:text-white h-9">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-4 text-neutral-500 hover:text-white w-full">View All Requests</Button>
              </div>
            </>
          ) : (
            /* STUDENT LAYOUT */
            <>
              {/* 1. Daily Goals (Large Card) */}
              <div className="col-span-12 lg:col-span-8 bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ADFF44]/5 rounded-full blur-[100px] group-hover:bg-[#ADFF44]/10 transition-colors duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-8">
                  <div className="flex flex-col justify-between flex-1">

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#ADFF44] animate-pulse" />
                        <span className="text-[#ADFF44] font-bold text-sm tracking-widest uppercase font-display">Daily Progress</span>
                      </div>
                      <h2 className="text-4xl font-display font-black text-white mb-4">Keep the streak alive.</h2>
                      <p className="text-neutral-400 text-lg max-w-sm leading-relaxed">
                        You've completed 2 out of 3 daily goals. Apply to one more job to hit your target.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                      {[
                        { val: "12", label: "Applications", icon: TrendingUp },
                        { val: "4", label: "Courses", icon: BookOpen },
                        { val: "850", label: "XP Points", icon: Star }
                      ].map((stat, i) => (
                        <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                          <stat.icon className="w-5 h-5 text-neutral-500 mb-2" />
                          <div className="text-2xl font-bold text-white">{stat.val}</div>
                          <div className="text-xs text-neutral-500 font-bold uppercase">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radial Progress Visualization */}
                  <div className="w-full md:w-64 h-64 relative flex-shrink-0 flex items-center justify-center">
                    {/* Outer Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                      <circle cx="50%" cy="50%" r="45%" stroke="#ADFF44" strokeWidth="12" fill="transparent" strokeDasharray="283" strokeDashoffset="90" strokeLinecap="round" className="filter drop-shadow-[0_0_15px_rgba(173,255,68,0.5)]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-black text-white font-display">66%</span>
                      <span className="text-sm text-neutral-500 font-bold uppercase mt-1">Goal Reached</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Resume Score (Gradient Card) */}
              <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#ADFF44] to-[#8BCC36] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_40px_rgba(173,255,68,0.2)] group transition-transform hover:scale-[1.02]">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-black">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-black leading-none mb-2">Resume Score</h3>
                  <div className="text-6xl font-black text-black/90 font-display tracking-tighter">72<span className="text-2xl opacity-50">/100</span></div>
                </div>

                <div className="relative z-10 mt-8">
                  <p className="text-black/70 font-bold mb-6 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full" /> 3 Critical Errors Found
                  </p>
                  <Button className="w-full h-12 bg-black text-white hover:bg-neutral-800 font-bold rounded-xl border-none shadow-xl">
                    Fix Constraints <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* 3. Quick Access Grid */}
              <div className="col-span-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-1 bg-[#ADFF44] rounded-full" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Search, label: "Find Jobs", desc: "Explore 100+ openings", color: "text-[#ADFF44]", link: "/jobs" },
                    { icon: Briefcase, label: "Mentorship", desc: "Book 1:1 sessions", color: "text-blue-400", link: "/search-experts" },
                    { icon: MessageSquare, label: "Practice", desc: "Mock Interviews", color: "text-purple-400", link: "/courses" },
                    { icon: Gift, label: "Rewards", desc: "Redeem XP points", color: "text-orange-400", link: "/" },
                  ].map((item, i) => (
                    <Link to={item.link} key={i} className="group">
                      <div className="h-full bg-neutral-900/50 backdrop-blur-md border border-white/5 hover:border-[#ADFF44]/50 rounded-[2rem] p-6 transition-all hover:bg-neutral-900 duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <h4 className="text-lg font-bold text-white group-hover:text-[#ADFF44] transition-colors">{item.label}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>

                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <AvailabilitySheet open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen} />
      </div>
    </div>
  );
};

export default Dashboard;


