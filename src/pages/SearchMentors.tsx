import { MentorCard } from "@/components/cards/MentorCard";
import { mentors } from "@/data/mentors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Sparkles, MapPin, Briefcase, GraduationCap, ChevronDown, Users } from "lucide-react";


const SearchMentors = () => {
  return (
    <div className="min-h-screen bg-neutral-900 dark:bg-black text-white dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12 text-center">

        {/* Header Section */}


        <h1 className="text-4xl font-bold text-white mx-auto">
          Let's Find You The Perfect Near Peer
        </h1>
      </div>

      {/* Main Search Bar Area */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-neutral-900 p-2 rounded-full shadow-lg border border-neutral-800 flex flex-col md:flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-neutral-800 w-full md:w-auto">
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Search By</p>
              <p className="text-sm font-bold text-[#ADFF44] flex items-center gap-1 cursor-pointer">
                Industry <ChevronDown className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <Input
              className="border-none shadow-none focus-visible:ring-0 text-base font-medium placeholder:text-neutral-400 h-10"
              placeholder="IT Services / DevOps"
            />
          </div>

          <Button className="rounded-full bg-[#ADFF44] hover:bg-[#9BE63D] text-black px-8 h-10 w-full md:w-auto text-base font-medium transition-all shadow-md hover:shadow-lg shadow-[#ADFF44]/20">
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
              ? 'bg-[#ADFF44]/5 border-[#ADFF44]/30 text-[#ADFF44] shadow-sm ring-2 ring-[#ADFF44]/20'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-[#ADFF44]/30 hover:text-[#ADFF44] hover:bg-neutral-900'
              }`}
          >
            {filter.icon && <filter.icon className="w-4 h-4" />}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Secondary Filters Row */}
      <div className="max-w-5xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm">
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wide">Role</label>
          <Input className="bg-neutral-900 border-neutral-800 focus:bg-neutral-900 transition-colors" placeholder="Search roles..." />
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wide">Location</label>
          <Input className="bg-neutral-900 border-neutral-800 focus:bg-neutral-900 transition-colors" placeholder="Search locations..." />
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 ml-1 uppercase tracking-wide">Work Experience</label>
          <div className="flex gap-2">
            <Input className="bg-neutral-900 border-neutral-800 focus:bg-neutral-900 transition-colors" placeholder="Min" />
            <Input className="bg-neutral-900 border-neutral-800 focus:bg-neutral-900 transition-colors" placeholder="Max" />
          </div>
          <p className="text-[10px] text-neutral-500 text-right pr-1">Years of experience</p>
        </div>
        <div className="md:col-span-3">
          <Button className="w-full bg-[#ADFF44] hover:bg-[#9BE63D] text-black font-medium h-10 shadow-lg shadow-[#ADFF44]/20">
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Infinite Marquee - "Trusted By" Style Animation */}
      <div className="mb-16 overflow-hidden relative group py-8 bg-neutral-900 border-y border-neutral-800">
        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <h3 className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-8">Mentors from top companies</h3>

        <div className="flex animate-scroll hover:pause-animation">
          {[...Array(4)].map((_, widthIndex) => (
            <div key={widthIndex} className="flex gap-16 items-center mx-8 shrink-0">
              <span className="text-2xl font-bold text-neutral-400 hover:text-white transition-colors cursor-default">GOOGLE</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-red-600 transition-colors cursor-default">NETFLIX</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-[#ADFF44] transition-colors cursor-default">AMAZON</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-[#ADFF44] transition-colors cursor-default">META</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-white transition-colors cursor-default italic">MICROSOFT</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-green-600 transition-colors cursor-default">UBER</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-rose-500 transition-colors cursor-default">AIRBNB</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-[#ADFF44] transition-colors cursor-default">STRIPE</span>
              <span className="text-2xl font-bold text-neutral-400 hover:text-green-500 transition-colors cursor-default">SPOTIFY</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-xl font-bold text-neutral-300">Experts in Industry: <span className="text-[#ADFF44]">IT Services / DevOps</span></h2>
        <span className="bg-[#ADFF44] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-[#ADFF44]/20">{mentors.length} experts</span>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mentors.map((mentor, index) => (
          <MentorCard key={mentor.id} mentor={mentor} index={index} />
        ))}
      </div>


      {/* Scroll Animation Styles - Fixed */}

    </div>
  );
};

export default SearchMentors;
