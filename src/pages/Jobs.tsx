import { JobCard } from "@/components/cards/JobCard";
import { jobs as initialJobs, Job } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { Search, Bell, SlidersHorizontal, Upload, CheckCircle2, Loader2, TrendingUp, Briefcase } from "lucide-react";
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
    setTimeout(() => {
      setIsMatching(false);
      setMatchComplete(true);
      const sorted = [...initialJobs].sort((a, b) => {
        const catA = a.category || '';
        const catB = b.category || '';
        const aScore = catA === 'Engineering' ? 98 : 70;
        const bScore = catB === 'Engineering' ? 98 : 70;
        return bScore - aScore;
      });
      setJobs(sorted);
    }, 2500);
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">

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
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              {viewMode === 'find'
                ? "Explore exciting opportunities from our trusted partner companies."
                : "Track the status of your ongoing job applications."}
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setViewMode('find')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'find' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Find Jobs
            </button>
            <button
              onClick={() => setViewMode('applied')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'applied' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              My Applications
              {appliedJobs.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewMode === 'applied' ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                  {appliedJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {viewMode === 'find' ? (
          <>
            {/* HERO: Intelligent Job Matcher */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 rounded-[20px] text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Match Your Resume to Jobs</h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">Upload your resume and our AI will instantly filter the top 1% roles that match your skills.</p>

                    {!matchComplete ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                          <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={handleResumeUpload}
                          />
                          <Button size="lg" className="bg-white text-indigo-600 hover:bg-blue-50 font-bold px-8 py-6 h-auto text-lg shadow-lg">
                            <Upload className="mr-2 w-5 h-5" />
                            {selectedResume ? selectedResume.name : "Upload Resume"}
                          </Button>
                        </div>
                        {selectedResume && (
                          <Button
                            onClick={runMatchingEngine}
                            disabled={isMatching}
                            className="bg-indigo-800 text-white hover:bg-indigo-900"
                          >
                            {isMatching ? <><Loader2 className="animate-spin mr-2" /> AI Matching...</> : "Find Matches Now"}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl inline-block"
                      >
                        <div className="flex items-center gap-3 text-white">
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                          <div className="text-left">
                            <h3 className="font-bold text-xl">Analysis Complete</h3>
                            <p className="text-blue-100 text-sm">We found 3 High-Match roles for you!</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* Sidebar Filters */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm sticky top-32">
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
                            <Checkbox id={type} className="rounded-md border-gray-300 dark:border-slate-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                            <span className="text-sm text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-100">{type}</span>
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
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{jobs.length} Jobs Found</p>
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
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Start applying to jobs to track them here.</p>
                <Button onClick={() => setViewMode('find')} variant="link" className="text-purple-600 mt-2">
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((app) => (
                  <div key={app.jobId} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{app.job.title}</h3>
                      <p className="text-slate-500">{app.job.company}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">{app.status}</Badge>
                        <span className="text-xs text-slate-400 flex items-center mt-1">Applied on {app.appliedDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
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
