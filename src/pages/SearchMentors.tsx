import { MentorCard } from "@/components/cards/MentorCard";
import { mentors } from "@/data/mentors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Sparkles, MapPin, Briefcase, GraduationCap, ChevronDown, Users } from "lucide-react";
import { motion } from "framer-motion";

const SearchMentors = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12">

        {/* Header Section */}
        <div className="text-center mb-10 space-y-4">
          {/* New Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm mb-2">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-sm uppercase tracking-wider">NEW</span>
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Search className="w-3 h-3" /> Search
            </span>
            <div className="flex gap-2 text-slate-400">
              <div className="bg-emerald-100 text-emerald-700 p-1 rounded-full"><Briefcase className="w-3 h-3" /></div>
              <div className="bg-slate-100 p-1 rounded-full"><Briefcase className="w-3 h-3" /></div>
              <div className="bg-slate-100 p-1 rounded-full"><Briefcase className="w-3 h-3" /></div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-800">
            Let's Find You The Perfect Near Peer
          </h1>
        </div>

        {/* Main Search Bar Area */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white p-2 rounded-full shadow-lg border border-slate-200 flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100 w-full md:w-auto">
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Search By</p>
                <p className="text-sm font-bold text-purple-700 flex items-center gap-1 cursor-pointer">
                  Industry <ChevronDown className="w-3 h-3" />
                </p>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <Input
                className="border-none shadow-none focus-visible:ring-0 text-base font-medium placeholder:text-slate-300 h-10"
                placeholder="IT Services / DevOps"
              />
            </div>

            <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 h-10 w-full md:w-auto text-base font-medium transition-all shadow-md hover:shadow-lg shadow-purple-200">
              Find Near Peers
            </Button>
          </div>
        </div>

        {/* Pill Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { label: 'Workplace', icon: Briefcase },
            { label: 'College', icon: GraduationCap },
            { label: 'Name', icon: Users },
            { label: 'Industry', icon: Briefcase, active: true },
            { label: 'Function', icon: Sparkles }, // Using Sparkles as generic for Function
            { label: 'Journey', icon: MapPin }
          ].map((filter) => (
            <button
              key={filter.label}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${filter.active
                  ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm ring-2 ring-purple-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200 hover:text-purple-600 hover:bg-slate-50'
                }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters Row */}
        <div className="max-w-5xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wide">Role</label>
            <Input className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Search roles..." />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wide">Location</label>
            <Input className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Search locations..." />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wide">Work Experience</label>
            <div className="flex gap-2">
              <Input className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Min" />
              <Input className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Max" />
            </div>
            <p className="text-[10px] text-slate-400 text-right pr-1">Years of experience</p>
          </div>
          <div className="md:col-span-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium h-10 shadow-lg shadow-purple-200">
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Infinite Marquee - "Trusted By" Style Animation */}
        <div className="mb-16 overflow-hidden relative group py-8 bg-white border-y border-slate-100">
          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Mentors from top companies</h3>

          <div className="flex animate-scroll hover:pause-animation">
            {[...Array(4)].map((_, widthIndex) => (
              <div key={widthIndex} className="flex gap-16 items-center mx-8 shrink-0">
                <span className="text-2xl font-bold text-slate-300 hover:text-slate-800 transition-colors cursor-default">GOOGLE</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-red-600 transition-colors cursor-default">NETFLIX</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-amber-500 transition-colors cursor-default">AMAZON</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-blue-600 transition-colors cursor-default">META</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-slate-800 transition-colors cursor-default italic">MICROSOFT</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-green-600 transition-colors cursor-default">UBER</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-rose-500 transition-colors cursor-default">AIRBNB</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-indigo-600 transition-colors cursor-default">STRIPE</span>
                <span className="text-2xl font-bold text-slate-300 hover:text-green-500 transition-colors cursor-default">SPOTIFY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xl font-bold text-slate-700">Experts in Industry: <span className="text-purple-700">IT Services / DevOps</span></h2>
          <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-purple-200">{mentors.length} experts</span>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mentors.map((mentor, index) => (
            <MentorCard key={mentor.id} mentor={mentor} index={index} />
          ))}
        </div>

      </div>

      {/* Scroll Animation Styles */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SearchMentors;
