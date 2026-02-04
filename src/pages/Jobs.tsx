import { JobCard } from "@/components/cards/JobCard";
import { jobs } from "@/data/jobs";
import { Button } from "@/components/ui/button";
import { Search, Bell, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Jobs = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      {/* Container */}
      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12">

        {/* Header / Search */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-3 tracking-tight">Find Your Dream Role</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-10 text-lg">Explore exciting opportunities from our trusted partner companies.</p>

          <div className="relative max-w-2xl w-full">
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-full shadow-xl shadow-purple-900/5 dark:shadow-black/50 border border-gray-100 dark:border-slate-800 p-2 pl-6 transition-shadow hover:shadow-2xl hover:shadow-purple-900/10 dark:hover:shadow-purple-900/20">
              <Search className="text-gray-400 dark:text-slate-500 w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Search by job title, company or skills"
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600 text-base"
              />
              <Button className="rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] h-12 w-12 p-0 flex items-center justify-center transition-transform active:scale-95">
                <Search className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-3xl p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between border border-purple-100 dark:border-purple-900/30 relative overflow-hidden group">
          <div className="max-w-xl relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-[#4C1D95] dark:text-purple-300 mb-4 leading-tight">Want us to keep you posted on<br />relevant roles?</h2>
            <p className="text-[#6B21A8]/80 dark:text-purple-400 mb-8 text-lg">Upload your profile and we'll inform you about best-suited opportunities.</p>
            <Button className="bg-[#581c87] hover:bg-[#4c1d95] text-white rounded-full px-8 py-6 h-auto text-base font-semibold shadow-xl shadow-purple-900/10 transition-transform hover:-translate-y-1">
              <Bell className="w-5 h-5 mr-2" />
              Set Job Alerts
            </Button>
          </div>

          {/* Decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
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
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium cursor-pointer hover:underline">Reset</span>
              </div>

              {/* Filter Group: Job Type */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Job Type</h4>
                <div className="space-y-3">
                  {['Internship', 'Full-time', 'Contract'].map(type => (
                    <label key={type} className="flex items-center justify-between group cursor-pointer select-none">
                      <div className="flex items-center gap-3">
                        <Checkbox id={type} className="rounded-md border-gray-300 dark:border-slate-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                        <span className="text-sm text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-100">{type}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">12</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 dark:bg-slate-800 my-6"></div>

              {/* Filter Group: Location */}
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Location</h4>
                <div className="space-y-3">
                  {['Bangalore', 'Gurugram', 'Pune', 'Remote'].map(loc => (
                    <label key={loc} className="flex items-center justify-between group cursor-pointer select-none">
                      <div className="flex items-center gap-3">
                        <Checkbox id={loc} className="rounded-md border-gray-300 dark:border-slate-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                        <span className="text-sm text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-100">{loc}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">8</span>
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Job Openings</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{jobs.length} Jobs Found</p>
              </div>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Jobs;
