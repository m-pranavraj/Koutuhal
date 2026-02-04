import { User, Target, Search, Briefcase, Gift, MessageSquare, TrendingUp, BookOpen, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [isMentorMode, setIsMentorMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-slate-950 transition-colors duration-300">
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-500/20 blur-3xl opacity-50 rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-500/20 blur-3xl opacity-50 rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-28 pb-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className={`border-purple-200 ${isMentorMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700'}`}>
                {isMentorMode ? 'Mentor Dashboard' : 'Student Dashboard'}
              </Badge>
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-full p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setIsMentorMode(false)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!isMentorMode ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Student
                </button>
                <button
                  onClick={() => setIsMentorMode(true)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${isMentorMode ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Mentor
                </button>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Pranav</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              {isMentorMode
                ? <span>You have <span className="font-bold text-amber-600">3 upcoming sessions</span> today.</span>
                : <span>You are in the top <span className="font-bold text-slate-700 dark:text-slate-300">5%</span> of active learners this week.</span>
              }
            </p>
          </div>
          <div className="flex gap-3">
            {isMentorMode ? (
              <Button className="h-12 bg-amber-500 hover:bg-amber-600 text-white shadow-xl">Set Availability</Button>
            ) : (
              <>
                <Button variant="outline" className="h-12 border-slate-200">View Profile</Button>
                <Button className="h-12 bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all">Resume Builder</Button>
              </>
            )}
          </div>
        </div>

        {isMentorMode ? (
          /* ================= MENTOR VIEW ================= */
          <div className="space-y-8 fade-in">
            {/* Mentor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Earnings</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$1,250.00</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Mentees</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">12</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Rating</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 text-amber-500 flex items-center gap-1">4.9 <Star className="w-5 h-5 fill-current" /></h3>
                </div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 shadow-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" /> Upcoming Sessions
                </h2>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Jenkins", time: "2:00 PM Today", topic: "Mock Interview: Frontend", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
                    { name: "Mike Ross", time: "4:30 PM Today", topic: "Resume Review", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
                    { name: "Jessica Lee", time: "10:00 AM Tomorrow", topic: "Career Guidance", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={session.img} alt={session.name} className="w-12 h-12 rounded-full bg-slate-200" />
                        <div>
                          <h4 className="font-bold text-slate-900">{session.name}</h4>
                          <p className="text-sm text-slate-500">{session.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full inline-block mb-1">{session.time}</p>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="h-8">Reschedule</Button>
                          <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white">Join Call</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requests */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" /> New Requests
                </h2>
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">DK</div>
                          <span className="font-bold text-sm">David Kim</span>
                        </div>
                        <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded">Resume Review</span>
                      </div>
                      <p className="text-slate-300 text-xs mb-3">"Hi, I need help with my resume for Google application..."</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="w-full h-8 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold">Accept</Button>
                        <Button size="sm" variant="outline" className="w-full h-8 border-white/20 text-white hover:bg-white/10 text-xs">Decline</Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-4">
                    <button className="text-xs text-slate-400 hover:text-white transition-colors">View All Requests</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= STUDENT VIEW (Original) ================= */
          <>
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 fade-in">
              {/* Stats Card - Learning */}
              <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-purple-100/50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" /> Daily Goals
                    </h3>
                    <span className="text-sm font-medium text-slate-500">2/3 Completed</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white">12</span>
                      <span className="text-xs text-slate-500 uppercase font-bold mt-1">Jobs Applied</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white">4</span>
                      <span className="text-xs text-slate-500 uppercase font-bold mt-1">Courses</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3">
                        <Star className="w-5 h-5" />
                      </div>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white">850</span>
                      <span className="text-xs text-slate-500 uppercase font-bold mt-1">XP Points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Resume Scan</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                    Your resume score is 72/100. Fix 3 critical errors to boost your chances.
                  </p>
                </div>
                <Button variant="secondary" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold border-none">
                  Fix Resume Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Sub-Section */}
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
              {[
                { icon: Search, label: "Find Jobs", color: "text-blue-500", bg: "bg-blue-50", link: "/jobs" },
                { icon: Briefcase, label: "Mentorship", color: "text-purple-500", bg: "bg-purple-50", link: "/search-experts" },
                { icon: MessageSquare, label: "Interviews", color: "text-pink-500", bg: "bg-pink-50", link: "/ai-tutor" },
                { icon: Gift, label: "Rewards", color: "text-orange-500", bg: "bg-orange-50", link: "/" },
              ].map((item, i) => (
                <Link to={item.link} key={i}>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 transition-all hover:shadow-lg group cursor-pointer h-full flex flex-col justify-between">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;


