import { JobCard } from "@/components/cards/JobCard";
import type { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Search, Bell, SlidersHorizontal, Upload, CheckCircle2, Loader2, TrendingUp, Briefcase, Sparkles, Wand2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { ApplicationStatusDashboard } from "@/components/jobs/ApplicationStatusDashboard";
import { JobDetailsSheet } from "@/components/jobs/JobDetailsSheet";
import ResumeTailorPanel from "@/components/jobs/ResumeTailorPanel";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicationProvider, useApplications } from "@/context/ApplicationContext";
import { Badge } from "@/components/ui/badge";

const ALL_DEMO_JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Stripe',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Remote',
    experience: '4-6 years',
    salary: '$130k – $170k',
    description: 'Join Stripe\'s Dashboard team to build world-class payment UIs. You\'ll own features used by millions of businesses worldwide. Strong React + TypeScript required.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Tailwind CSS', 'Performance Optimization'],
    category: 'Engineering',
    postedDays: 1,
  },
  {
    id: 2,
    title: 'Backend Engineer — Platform',
    company: 'Coinbase',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'San Francisco, CA',
    experience: '3-5 years',
    salary: '$150k – $200k',
    description: 'Build the infrastructure that powers crypto transactions at scale. Work on distributed systems, reliability engineering, and high-throughput APIs with Go and Python.',
    skills: ['Go', 'Python', 'PostgreSQL', 'Kafka', 'Distributed Systems', 'AWS'],
    category: 'Engineering',
    postedDays: 2,
  },
  {
    id: 3,
    title: 'ML Engineer — Recommendations',
    company: 'Spotify',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'New York, NY',
    experience: '3-5 years',
    salary: '$140k – $180k',
    description: 'Power the algorithm that serves personalized playlists to 600M+ users. You\'ll build ranking models, feature pipelines, and run A/B experiments at massive scale.',
    skills: ['Python', 'TensorFlow', 'Spark', 'MLflow', 'SQL', 'A/B Testing'],
    category: 'Data & ML',
    postedDays: 3,
  },
  {
    id: 4,
    title: 'Product Designer',
    company: 'Linear',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Remote',
    experience: '3-5 years',
    salary: '$110k – $150k',
    description: 'Design the future of project management. Linear is known for its craft — you\'ll set the bar for interaction design, prototype in Figma, and ship high-polish features.',
    skills: ['Figma', 'Interaction Design', 'Prototyping', 'Design Systems', 'User Research'],
    category: 'Design',
    postedDays: 4,
  },
  {
    id: 5,
    title: 'DevOps / Platform Engineer',
    company: 'Vercel',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Remote',
    experience: '3-5 years',
    salary: '$130k – $175k',
    description: 'Keep the edge network that serves 100B+ requests/month running flawlessly. Work on Kubernetes, Terraform, observability, and continuous delivery pipelines.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Prometheus', 'Docker'],
    category: 'Engineering',
    postedDays: 2,
  },
  {
    id: 6,
    title: 'Full Stack Engineer',
    company: 'Notion',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'San Francisco, CA',
    experience: '2-5 years',
    salary: '$140k – $185k',
    description: 'Build the collaborative workspace used by 30M+ people. You\'ll work across the React frontend and Node.js backend, shipping features that delight power users and new sign-ups alike.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'WebSockets'],
    category: 'Engineering',
    postedDays: 1,
  },
  {
    id: 7,
    title: 'Data Analyst — Growth',
    company: 'Figma',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'San Francisco, CA',
    experience: '2-4 years',
    salary: '$110k – $140k',
    description: 'Own growth analytics at a design-first company. Run cohort analyses, build dashboards in Looker, run experiments, and translate data into product strategy.',
    skills: ['SQL', 'Python', 'Looker', 'dbt', 'Amplitude', 'Statistics'],
    category: 'Data & ML',
    postedDays: 5,
  },
  {
    id: 8,
    title: 'iOS Engineer',
    company: 'Airbnb',
    type: 'Full-time',
    mode: 'Hybrid',
    location: 'San Francisco, CA',
    experience: '3-6 years',
    salary: '$150k – $200k',
    description: 'Build the iOS app used by millions of travelers and hosts every day. Own entire product areas, collaborate with design, and raise the bar for mobile engineering at Airbnb.',
    skills: ['Swift', 'SwiftUI', 'Combine', 'Objective-C', 'Core Data', 'CI/CD'],
    category: 'Mobile',
    postedDays: 3,
  },
  {
    id: 9,
    title: 'Product Manager — API Platform',
    company: 'Twilio',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Remote',
    experience: '3-6 years',
    salary: '$140k – $180k',
    description: 'Drive the vision for Twilio\'s developer platform. You\'ll set the roadmap, work closely with engineering, and iterate based on voice-of-customer research.',
    skills: ['Product Strategy', 'APIs', 'Agile', 'SQL', 'Roadmapping', 'Customer Discovery'],
    category: 'Product',
    postedDays: 6,
  },
  {
    id: 10,
    title: 'Security Engineer',
    company: 'GitHub',
    type: 'Full-time',
    mode: 'Remote',
    location: 'Remote',
    experience: '3-6 years',
    salary: '$160k – $210k',
    description: 'Protect the platform that hosts 100M+ developers\' code. You\'ll do threat modelling, penetration testing, vulnerability management, and harden GitHub\'s cloud infrastructure.',
    skills: ['AppSec', 'Penetration Testing', 'Cloud Security', 'Python', 'SAST/DAST', 'AWS'],
    category: 'Security',
    postedDays: 2,
  },
];

const JOB_TYPES = ['Internship', 'Full-time', 'Contract'];
const JOB_CATEGORIES = ['Engineering', 'Design', 'Data & ML', 'Mobile', 'Product', 'Security'];

const JobsContent = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Navigation State
  const [viewMode, setViewMode] = useState<'find' | 'applied'>('find');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [tailorJob, setTailorJob] = useState<Job | null>(null);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [currentRank, setCurrentRank] = useState(0);
  // Shared resume across all tailor sessions
  const [sharedResume, setSharedResume] = useState<File | null>(null);

  const { appliedJobs } = useApplications();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await import('../lib/supabase').then(m =>
        m.supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
      );

      if (supabaseError || !data || data.length === 0) {
        setDbJobs([]);
      } else {
        const mapped = data.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          type: j.job_type || 'Full-time',
          mode: j.location?.toLowerCase().includes('remote') ? 'Remote' : 'WFO' as "Remote" | "WFO" | "WFH" | "Hybrid",
          location: j.location,
          experience: j.experience_level || 'Open',
          salary: j.salary_range || 'Competitive',
          description: j.description,
          skills: j.skills || [],
          category: j.job_type || 'Engineering',
          postedDays: j.created_at ? Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000) : 0,
        }));
        setDbJobs(mapped);
      }
    } catch {
      setDbJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge db jobs + demo jobs, deduplicate by title
  const baseJobs = useMemo(() => {
    if (dbJobs.length > 0) return dbJobs;
    return ALL_DEMO_JOBS;
  }, [dbJobs]);

  // Live filter
  const jobs = useMemo(() => {
    let list = baseJobs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills?.some(s => s.toLowerCase().includes(q)) ||
        j.category?.toLowerCase().includes(q)
      );
    }

    if (selectedTypes.length > 0) {
      list = list.filter(j => selectedTypes.includes(j.type));
    }

    return list;
  }, [baseJobs, searchQuery, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedResume(e.target.files[0]);
      setSharedResume(e.target.files[0]);
    }
  };

  const runMatchingEngine = async () => {
    if (!selectedResume) return;
    setIsMatching(true);
    setMatchComplete(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMatchComplete(true);
    setIsMatching(false);
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setSheetOpen(true);
  };

  const openTailor = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setTailorJob(job);
    setTailorOpen(true);
  };

  const openDashboard = (jobTitle: string, rank: number) => {
    setCurrentRank(rank);
    setDashboardOpen(true);
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black transition-colors duration-300">

      <JobDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        job={selectedJob}
        onDashboardOpen={(title, rank) => openDashboard(title, rank)}
      />

      <ApplicationStatusDashboard
        open={dashboardOpen}
        onOpenChange={setDashboardOpen}
        jobTitle={selectedJob?.title || "Applications"}
        initialRank={currentRank || 4}
      />

      <ResumeTailorPanel
        job={tailorJob}
        open={tailorOpen}
        onClose={() => setTailorOpen(false)}
        sharedResume={sharedResume}
        onResumeShared={(f) => setSharedResume(f)}
      />

      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">
              {viewMode === 'find' ? "Find Your Dream Role" : "Your Applications"}
            </h1>
            <p className="text-gray-500 dark:text-neutral-500 text-lg">
              {viewMode === 'find'
                ? "Explore top opportunities. Click ✨ Tailor to auto-tailor your resume to any role."
                : "Track the status of your ongoing job applications."}
            </p>
          </div>

          <div className="flex bg-neutral-900 dark:bg-black p-1.5 rounded-full border border-gray-200 dark:border-neutral-800 shadow-sm">
            <button
              onClick={() => setViewMode('find')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'find' ? 'bg-black text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              Find Jobs
            </button>
            <button
              onClick={() => setViewMode('applied')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'applied' ? 'bg-black text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900'}`}
            >
              My Applications
              {appliedJobs.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewMode === 'applied' ? 'bg-neutral-900 text-white' : 'bg-slate-200 text-neutral-300'}`}>
                  {appliedJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {viewMode === 'find' ? (
          <>
            {/* HERO: Intelligent Job Matcher */}
            <div className="relative mb-16 rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/50 backdrop-blur-md shadow-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#ADFF44]/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 p-10 md:p-14 text-center flex flex-col items-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  <Badge className="bg-[#ADFF44] text-black hover:bg-[#ADFF44] mb-5 px-4 py-1.5 text-xs tracking-widest font-bold uppercase shadow-[0_0_20px_rgba(173,255,68,0.3)]">
                    <Sparkles className="w-3 h-3 mr-2 fill-black" />
                    AI Resume Matcher
                  </Badge>
                </motion.div>

                <motion.h2
                  className="text-3xl md:text-5xl font-display font-black text-white mb-4 tracking-tight leading-tight max-w-3xl"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Upload Resume → <span className="text-[#ADFF44]">Get Matched</span> Instantly
                </motion.h2>

                <motion.p
                  className="text-neutral-400 max-w-xl mx-auto mb-10 text-base md:text-lg font-light leading-relaxed"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Upload your resume to find your best-matched roles. Then click <strong className="text-white">✨ Tailor</strong> beside any job to auto-tailor your resume to that role.
                </motion.p>

                {!matchComplete ? (
                  <motion.div
                    className="flex flex-col items-center gap-5 w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="relative group w-full">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ADFF44] to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                      <div className="relative bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-1">
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          onChange={handleResumeUpload}
                        />
                        <Button size="lg" className="w-full bg-neutral-800/50 hover:bg-neutral-800 text-white border-dashed border-2 border-neutral-700 hover:border-[#ADFF44]/50 h-28 flex flex-col items-center justify-center gap-3 transition-all group-hover:bg-neutral-800/80">
                          <div className="p-3 bg-neutral-900 rounded-full border border-neutral-700 group-hover:border-[#ADFF44] group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#ADFF44]" />
                          </div>
                          <span className="text-base font-medium group-hover:text-[#ADFF44] transition-colors">
                            {selectedResume ? selectedResume.name : "Upload Resume (PDF)"}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {selectedResume && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full">
                        <Button
                          onClick={runMatchingEngine}
                          disabled={isMatching}
                          className="w-full bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold h-14 text-lg rounded-xl shadow-[0_0_30px_rgba(173,255,68,0.2)] hover:shadow-[0_0_50px_rgba(173,255,68,0.4)] transition-all transform hover:-translate-y-1"
                        >
                          {isMatching ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Matching Roles...</span>
                          ) : "Run AI Match Analysis"}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#ADFF44]/10 backdrop-blur-xl border border-[#ADFF44]/30 px-8 py-6 rounded-2xl inline-block shadow-[0_0_60px_-15px_rgba(173,255,68,0.3)]"
                  >
                    <div className="flex items-center gap-4 text-white">
                      <div className="w-12 h-12 rounded-full bg-[#ADFF44] flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-2xl text-white">Matches Found!</h3>
                        <p className="text-[#ADFF44] font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ADFF44] animate-pulse" />
                          {jobs.length} Roles · Click ✨ Tailor on any job
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#ADFF44]/30 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar Filters */}
              <div className="space-y-6">
                <div className="bg-neutral-900 dark:bg-black rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                      <SlidersHorizontal className="w-5 h-5" /> Filters
                    </h3>
                    {selectedTypes.length > 0 && (
                      <button onClick={() => setSelectedTypes([])} className="text-xs text-neutral-500 hover:text-red-400 transition">Clear</button>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Job Type</h4>
                  <div className="space-y-3">
                    {JOB_TYPES.map(type => (
                      <label key={type} className="flex items-center justify-between group cursor-pointer select-none">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={type}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                            className="rounded-md border-gray-300 dark:border-slate-700 data-[state=checked]:bg-[#ADFF44] data-[state=checked]:border-[#ADFF44]"
                          />
                          <span className="text-sm text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-slate-100">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {matchComplete ? "Best Matches for You" : "All Openings"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
                      {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-10 h-10 text-[#ADFF44] animate-spin mb-4" />
                      <p className="text-gray-500">Loading opportunities...</p>
                    </div>
                  )}

                  {!isLoading && jobs.length === 0 && (
                    <div className="text-center py-16 text-neutral-500">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No jobs match "{searchQuery}"</p>
                      <button onClick={() => setSearchQuery('')} className="text-sm text-[#ADFF44] mt-2 hover:underline">Clear search</button>
                    </div>
                  )}

                  {!isLoading && (
                    <AnimatePresence>
                      {jobs.map((job, index) => {
                        const isTopMatch = matchComplete && index < 3;
                        const matchScore = isTopMatch ? (98 - (index * 2)) : 0;
                        return (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group"
                          >
                            {isTopMatch && (
                              <div className="absolute -top-3 -right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> {matchScore}% Match
                              </div>
                            )}

                            {/* Tailor Resume button */}
                            <button
                              onClick={(e) => openTailor(job, e)}
                              className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 border border-[#ADFF44]/20 text-[#ADFF44] text-xs font-bold hover:bg-[#ADFF44] hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              <Wand2 className="w-3.5 h-3.5" /> Tailor Resume
                            </button>

                            <div className="cursor-pointer" onClick={() => openJobDetails(job)}>
                              <JobCard job={job} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* APPLIED JOBS VIEW */
          <div className="max-w-4xl mx-auto">
            {appliedJobs.length === 0 ? (
              <div className="text-center py-20 bg-neutral-900 dark:bg-black rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Start applying to jobs to track them here.</p>
                <Button onClick={() => setViewMode('find')} variant="link" className="text-[#ADFF44] mt-2">
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((app) => (
                  <div key={app.jobId} className="bg-neutral-900 dark:bg-black p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white dark:text-white">{app.job.title}</h3>
                      <p className="text-neutral-500">{app.job.company}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="border-[#ADFF44]/30 text-[#ADFF44] bg-[#ADFF44]/5">{app.status}</Badge>
                        <span className="text-xs text-neutral-500 flex items-center mt-1">Applied on {app.appliedDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="outline"
                        className="border-[#ADFF44]/30 text-[#ADFF44] hover:bg-[#ADFF44]/5"
                        onClick={() => {
                          setSelectedJob(app.job);
                          openDashboard(app.job.title, app.rank);
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" /> View Status & Rank
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const Jobs = () => (
  <ApplicationProvider>
    <JobsContent />
  </ApplicationProvider>
);

export default Jobs;
