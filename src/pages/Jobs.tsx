import { JobCard } from "@/components/cards/JobCard";
import { jobs as initialJobs, Job } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { Search, Bell, SlidersHorizontal, Upload, CheckCircle2, Loader2, TrendingUp, Briefcase, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ApplicationStatusDashboard } from "@/components/jobs/ApplicationStatusDashboard";
import { JobDetailsSheet } from "@/components/jobs/JobDetailsSheet";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicationProvider, useApplications } from "@/context/ApplicationContext";
import { Badge } from "@/components/ui/badge";

const JobsContent = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);

  // Navigation State
  const [viewMode, setViewMode] = useState<'find' | 'applied'>('find');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentRank, setCurrentRank] = useState(0);

  const { appliedJobs } = useApplications();

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedResume(e.target.files[0]);
    }
  };

  const runMatchingEngine = () => {
    if (!selectedResume) return;
    setIsMatching(true);

    // Simulate AI Analysis of the Resume File
    const filename = selectedResume.name.toLowerCase();
    const keywords = ['engineer', 'developer', 'designer', 'manager', 'marketing', 'sales', 'product', 'data'];
    let foundKeywords = keywords.filter(k => filename.includes(k));

    // Fallback for demo: if no keywords found, assume "Engineer" to show *some* matching behavior
    if (foundKeywords.length === 0) foundKeywords = ['engineer', 'developer'];

    setTimeout(() => {
      setIsMatching(false);
      setMatchComplete(true);

      const sorted = [...initialJobs].sort((a, b) => {
        // Calculate artificial match score
        let scoreA = 0;
        let scoreB = 0;

        foundKeywords.forEach(k => {
          const term = k.toLowerCase();
          if (a.title.toLowerCase().includes(term) || a.category?.toLowerCase().includes(term)) scoreA += 50;
          if (b.title.toLowerCase().includes(term) || b.category?.toLowerCase().includes(term)) scoreB += 50;
        });

        // Add some noise/randomness for realism if tie
        if (scoreA === scoreB) return b.id - a.id;
        return scoreB - scoreA;
      });

      setJobs(sorted);
    }, 2000); // 2 second "Scanning" delay
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setSheetOpen(true);
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

      {/* Container */}
      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12">

        {/* Header / Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">
              {viewMode === 'find' ? "Find Your Dream Role" : "Your Applications"}
            </h1>
            <p className="text-gray-500 dark:text-neutral-500 text-lg">
              {viewMode === 'find'
                ? "Explore exciting opportunities from our trusted partner companies."
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
            <div className="relative mb-20 rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/50 backdrop-blur-md shadow-2xl">
              {/* Background Grid & Glow */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#ADFF44]/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 p-12 md:p-16 text-center flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-[#ADFF44] text-black hover:bg-[#ADFF44] mb-6 px-4 py-1.5 text-xs tracking-widest font-bold uppercase shadow-[0_0_20px_rgba(173,255,68,0.3)]">
                    <Sparkles className="w-3 h-3 mr-2 fill-black" />
                    AI Resume Scanner
                  </Badge>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tight leading-tight max-w-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Perfect Role</span> with <span className="text-[#ADFF44] underline decoration-[#ADFF44]/30 underline-offset-8">Intelligent AI</span>
                </motion.h2>

                <motion.p
                  className="text-neutral-400 max-w-2xl mx-auto mb-12 text-lg md:text-xl font-light leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Drag & drop your resume to let our neural engine analyze 100+ active listings and identify the top <span className="text-white font-medium">1% matches</span> tailored to your skills.
                </motion.p>

                {!matchComplete ? (
                  <motion.div
                    className="flex flex-col items-center gap-6 w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
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
                        <Button size="lg" className="w-full bg-neutral-800/50 hover:bg-neutral-800 text-white border-dashed border-2 border-neutral-700 hover:border-[#ADFF44]/50 h-32 flex flex-col items-center justify-center gap-3 transition-all group-hover:bg-neutral-800/80">
                          <div className="p-3 bg-neutral-900 rounded-full border border-neutral-700 group-hover:border-[#ADFF44] group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-[#ADFF44]" />
                          </div>
                          <span className="text-lg font-medium group-hover:text-[#ADFF44] transition-colors">
                            {selectedResume ? selectedResume.name : "Upload Resume (PDF)"}
                          </span>
                          <span className="text-xs text-neutral-500 font-normal">
                            {selectedResume ? "Click to change file" : "Drag & drop or browse"}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {selectedResume && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="w-full"
                      >
                        <Button
                          onClick={runMatchingEngine}
                          disabled={isMatching}
                          className="w-full bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold h-14 text-lg rounded-xl shadow-[0_0_30px_rgba(173,255,68,0.2)] hover:shadow-[0_0_50px_rgba(173,255,68,0.4)] transition-all transform hover:-translate-y-1"
                        >
                          {isMatching ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin w-5 h-5" />
                              Analyzing Skills Matrix...
                            </span>
                          ) : "Run Match Analysis"}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#ADFF44]/10 backdrop-blur-xl border border-[#ADFF44]/30 px-8 py-6 rounded-2xl inline-block shadow-[0_0_60px_-15px_rgba(173,255,68,0.3)]"
                  >
                    <div className="flex items-center gap-4 text-white">
                      <div className="w-12 h-12 rounded-full bg-[#ADFF44] flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-2xl text-white">Analysis Complete</h3>
                        <p className="text-[#ADFF44] font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ADFF44] animate-pulse" />
                          Found 3 High-Match Roles
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar Filters */}
              <div className="space-y-6">
                <div className="bg-neutral-900 dark:bg-black rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                      <SlidersHorizontal className="w-5 h-5" /> Filters
                    </h3>
                  </div>

                  {/* Filter Group: Job Type */}
                  <div className="mb-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Job Type</h4>
                    <div className="space-y-3">
                      {['Internship', 'Full-time', 'Contract'].map(type => (
                        <label key={type} className="flex items-center justify-between group cursor-pointer select-none">
                          <div className="flex items-center gap-3">
                            <Checkbox id={type} className="rounded-md border-gray-300 dark:border-slate-700 data-[state=checked]:bg-[#ADFF44] data-[state=checked]:border-[#ADFF44]" />
                            <span className="text-sm text-gray-600 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-slate-100">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {matchComplete ? "Recommended For You" : "All Job Openings"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">{jobs.length} Jobs Found</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <AnimatePresence>
                    {jobs.map((job, index) => {
                      const isTopMatch = matchComplete && index < 3;
                      const matchScore = isTopMatch ? (98 - (index * 2)) : 0;
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative group block"
                          onClick={() => openJobDetails(job)}
                        >
                          {isTopMatch && (
                            <div className="absolute -top-3 -right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> {matchScore}% Match
                            </div>
                          )}
                          <div className="cursor-pointer">
                            <JobCard job={job} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
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
