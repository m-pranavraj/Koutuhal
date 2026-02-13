import { User, Target, Search, Briefcase, Gift, MessageSquare, TrendingUp, BookOpen, Star, ArrowRight, Zap, Trophy, Loader2, UserX, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { MentorStats } from "@/components/mentor/MentorStats";
import { AvailabilitySheet } from "@/components/mentor/AvailabilitySheet";

interface DashboardStats {
  total_resumes: number;
  total_applications: number;
  applications_this_week: number;
  avg_match_score: number | null;
  latest_application_date: string | null;
  total_jobs: number;
}

interface SessionData {
  id: string;
  student_id: string;
  mentor_id: string;
  status: string;
  session_type: string;
  message: string | null;
  mentor_reply: string | null;
  created_at: string;
  student_name: string | null;
  mentor_name: string | null;
}

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [requests, setRequests] = useState<SessionData[]>([]);

  useEffect(() => {
    if (user?.role === 'MENTOR') {
      setIsMentorMode(true);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchSessions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isMentorMode) {
      fetchMentorRequests();
    }
  }, [isAuthenticated, isMentorMode]);

  const token = localStorage.getItem('koutuhal_token');

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/v1/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/v1/mentors/sessions/my', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setSessions(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const fetchMentorRequests = async () => {
    try {
      const res = await fetch('/api/v1/mentors/sessions/requests', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch mentor requests:', err);
    }
  };

  const respondToRequest = async (sessionId: string, action: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch(`/api/v1/mentors/sessions/${sessionId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: action === 'ACCEPTED' ? 'Looking forward to it!' : 'Sorry, not available right now.', action }),
      });
      if (res.ok) {
        toast.success(action === 'ACCEPTED' ? 'Session accepted!' : 'Session declined.');
        fetchMentorRequests();
        fetchSessions();
      }
    } catch (err) {
      toast.error('Failed to respond');
    }
  };

  const userName = user?.name || "there";
  const totalApps = stats?.total_applications ?? 0;
  const totalResumes = stats?.total_resumes ?? 0;
  const totalJobs = stats?.total_jobs ?? 0;
  const appsThisWeek = stats?.applications_this_week ?? 0;
  const matchScore = stats?.avg_match_score ? Math.round(stats.avg_match_score) : 0;

  const dailyGoalTarget = 3;
  const dailyGoalDone = Math.min(appsThisWeek, dailyGoalTarget);
  const goalPercent = dailyGoalTarget > 0 ? Math.round((dailyGoalDone / dailyGoalTarget) * 100) : 0;
  const strokeDashoffset = 283 - (283 * goalPercent / 100);

  const upcomingSessions = sessions.filter(s => s.status === 'ACCEPTED');
  const pendingSessions = sessions.filter(s => s.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-black transition-colors duration-300 font-sans selection:bg-[#ADFF44] selection:text-black">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#ADFF44]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#ADFF44]/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-20 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="relative">
            <div className="absolute -left-6 top-1 w-1 h-12 bg-[#ADFF44] rounded-full blur-[2px]"></div>
            <div className="flex items-center gap-4 mb-4">
              {user?.role === 'MENTOR' && (
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
              )}
              <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-400 backdrop-blur-md">
                {isMentorMode ? 'Teacher Mode' : 'Learner Mode'}
              </Badge>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight leading-[1.1]">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">{userName}</span>
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
                <Button variant="outline" className="h-14 px-6 rounded-full border-white/10 hover:bg-white/5 text-white bg-transparent backdrop-blur-sm">View Profile</Button>
                <Link to="/resume-builder">
                  <Button className="h-14 px-8 bg-white text-black font-bold rounded-full shadow-lg hover:bg-neutral-200 transition-all hover:scale-105">
                    <Trophy className="w-4 h-4 mr-2 text-amber-500 fill-current" /> Resume Builder
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="grid grid-cols-12 gap-6 min-h-[500px]">

          {isMentorMode ? (
            <>
              <div className="col-span-12">
                <MentorStats />
              </div>

              {/* Upcoming Sessions */}
              <div className="col-span-12 lg:col-span-8 bg-neutral-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-[#ADFF44]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    Upcoming Sessions
                  </h2>
                  <Badge className="bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20">{upcomingSessions.length} active</Badge>
                </div>

                <div className="relative z-10 space-y-4">
                  {upcomingSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                        <UserX className="w-8 h-8 text-neutral-600" />
                      </div>
                      <p className="text-neutral-400 text-lg font-medium">No sessions scheduled yet</p>
                      <p className="text-neutral-500 text-sm mt-2">Accepted bookings will appear here.</p>
                    </div>
                  ) : (
                    upcomingSessions.map(s => (
                      <div key={s.id} className="bg-neutral-800/50 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44] font-bold text-lg">
                            {(s.student_name || '?')[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold">{s.student_name}</p>
                            <p className="text-neutral-500 text-sm">{s.session_type === 'call' ? '📞 Call' : '💬 DM'} • {new Date(s.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Accepted
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Requests Panel */}
              <div className="col-span-12 lg:col-span-4 bg-black border border-white/10 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#ADFF44]" /> New Requests
                  {requests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{requests.length}</span>
                  )}
                </h2>
                <div className="flex-1 space-y-3 overflow-auto">
                  {requests.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-400 font-medium">No new requests</p>
                        <p className="text-neutral-500 text-sm mt-1">Mentoring requests will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    requests.map(r => (
                      <div key={r.id} className="bg-neutral-900 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            {(r.student_name || '?')[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{r.student_name}</p>
                            <p className="text-neutral-500 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {r.session_type === 'call' ? 'Call Request' : 'Message'}
                            </p>
                          </div>
                        </div>
                        {r.message && <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{r.message}</p>}
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-[#ADFF44] text-black text-xs h-8 font-bold" onClick={() => respondToRequest(r.id, 'ACCEPTED')}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 border-white/10 text-neutral-400 text-xs h-8" onClick={() => respondToRequest(r.id, 'DECLINED')}>
                            <XCircle className="w-3 h-3 mr-1" /> Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            /* STUDENT LAYOUT */
            <>
              {/* 1. Weekly Progress */}
              <div className="col-span-12 lg:col-span-8 bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ADFF44]/5 rounded-full blur-[100px] group-hover:bg-[#ADFF44]/10 transition-colors duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-8">
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#ADFF44] animate-pulse" />
                        <span className="text-[#ADFF44] font-bold text-sm tracking-widest uppercase font-display">Weekly Progress</span>
                      </div>
                      <h2 className="text-4xl font-display font-black text-white mb-4">
                        {totalApps === 0 ? "Time to get started!" : appsThisWeek > 0 ? "Keep the streak alive." : "Apply to jobs this week!"}
                      </h2>
                      <p className="text-neutral-400 text-lg max-w-sm leading-relaxed">
                        {totalApps === 0
                          ? "Start by uploading your resume and applying to your first job."
                          : `You've submitted ${appsThisWeek} application${appsThisWeek !== 1 ? 's' : ''} this week. ${appsThisWeek < dailyGoalTarget ? `Apply to ${dailyGoalTarget - appsThisWeek} more to hit your target.` : 'Great job!'}`
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                      {statsLoading ? (
                        <div className="col-span-3 flex items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 text-[#ADFF44] animate-spin" />
                        </div>
                      ) : (
                        [
                          { val: String(totalApps), label: "Applications", icon: TrendingUp },
                          { val: String(totalResumes), label: "Resumes", icon: BookOpen },
                          { val: String(totalJobs), label: "Jobs Available", icon: Star }
                        ].map((stat, i) => (
                          <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                            <stat.icon className="w-5 h-5 text-neutral-500 mb-2" />
                            <div className="text-2xl font-bold text-white">{stat.val}</div>
                            <div className="text-xs text-neutral-500 font-bold uppercase">{stat.label}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Radial Progress */}
                  <div className="w-full md:w-64 h-64 relative flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                      <circle cx="50%" cy="50%" r="45%" stroke="#ADFF44" strokeWidth="12" fill="transparent" strokeDasharray="283" strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="filter drop-shadow-[0_0_15px_rgba(173,255,68,0.5)] transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-5xl font-black text-white font-display">{goalPercent}%</span>
                      <span className="text-sm text-neutral-500 font-bold uppercase mt-1">Weekly Goal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Resume Score */}
              <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#ADFF44] to-[#8BCC36] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_40px_rgba(173,255,68,0.2)] group transition-transform hover:scale-[1.02]">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-black">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-black leading-none mb-2">
                    {matchScore > 0 ? 'Match Score' : 'Resume Score'}
                  </h3>
                  <div className="text-6xl font-black text-black/90 font-display tracking-tighter">
                    {matchScore > 0 ? matchScore : '—'}<span className="text-2xl opacity-50">/100</span>
                  </div>
                </div>

                <div className="relative z-10 mt-8">
                  <p className="text-black/70 font-bold mb-6 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full" />
                    {matchScore > 0 ? 'Average across your applications' : 'Upload a resume to get scored'}
                  </p>
                  <Link to="/resume-builder">
                    <Button className="w-full h-12 bg-black text-white hover:bg-neutral-800 font-bold rounded-xl border-none shadow-xl">
                      {totalResumes > 0 ? 'View Resumes' : 'Build Resume'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 3. My Mentoring Sessions */}
              {sessions.length > 0 && (
                <div className="col-span-12 bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#ADFF44]" /> My Mentoring Sessions
                    <Badge className="bg-[#ADFF44]/10 text-[#ADFF44] border-[#ADFF44]/20">{sessions.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map(s => (
                      <div key={s.id} className="bg-neutral-800/50 border border-white/5 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#ADFF44]/20 flex items-center justify-center text-[#ADFF44] font-bold">
                            {(s.mentor_name || '?')[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{s.mentor_name}</p>
                            <p className="text-neutral-500 text-xs">{s.session_type === 'call' ? '📞 Call' : '💬 Message'}</p>
                          </div>
                        </div>
                        {s.message && <p className="text-neutral-400 text-sm line-clamp-2 mb-2">{s.message}</p>}
                        {s.mentor_reply && <p className="text-[#ADFF44] text-sm italic">"{s.mentor_reply}"</p>}
                        <Badge className={`mt-2 ${s.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          s.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                          {s.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {s.status === 'DECLINED' && <XCircle className="w-3 h-3 mr-1" />}
                          {s.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Quick Actions */}
              <div className="col-span-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-1 bg-[#ADFF44] rounded-full" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Search, label: "Find Jobs", desc: `${totalJobs} openings`, color: "text-[#ADFF44]", link: "/jobs" },
                    { icon: Briefcase, label: "Mentorship", desc: "Book 1:1 sessions", color: "text-blue-400", link: "/search-experts" },
                    { icon: BookOpen, label: "Courses", desc: "AI Education", color: "text-purple-400", link: "/courses" },
                    { icon: Gift, label: "Resume", desc: "Build & scan", color: "text-orange-400", link: "/resume-builder" },
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
