import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Mentor } from '@/types';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Calendar, Linkedin, MoreHorizontal } from 'lucide-react';

// Extend or map the interface if needed, but here we just use the data shape
// The existing 'Mentor' interface in data/mentors.ts:
// id, name, title, company, experience, rating, image, linkedin, availability, skills, isAlumni

export const MentorCard = ({ mentor, index }: { mentor: Mentor, index: number }) => {
  const isAvailable = mentor.availability === 'available';
  const role = mentor.title;
  const tags = mentor.skills;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Border Gradient for "Top Rated" or just aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ADFF44] via-[#8BCC36] to-[#ADFF44] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Header */}
      <div className="flex gap-4 mb-4 pt-2">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-[#ADFF44] to-[#8BCC36]">
            <img
              src={mentor.image}
              alt={mentor.name}
              className="w-full h-full rounded-full object-cover border-2 border-white"
            />
          </div>
          {isAvailable && (
            <div className="absolute -bottom-1 -right-1 bg-neutral-900 p-0.5 rounded-full">
              <span className="flex h-3.5 w-3.5 bg-[#ADFF44] rounded-full border-2 border-white" title="Available"></span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white truncate pr-2 group-hover:text-[#ADFF44] transition-colors">
              {mentor.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-xs text-amber-700 font-bold border border-amber-100">
              <Star className="w-3 h-3 fill-amber-500 text-[#ADFF44]" /> {mentor.rating}
            </div>
          </div>

          <div className="flex flex-col mt-0.5">
            <span className="font-medium text-sm text-white truncate" title={role}>{role}</span>
            <span className="text-xs text-neutral-500 truncate">@{mentor.company}</span>
          </div>
        </div>
      </div>

      {/* Experience & Tags */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3 text-sm text-neutral-500">
          <span className="bg-neutral-900 px-2 py-0.5 rounded text-xs font-medium border border-neutral-800">{mentor.experience} Exp</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="truncate max-w-[150px]">Mentored 50+ students</span>
        </div>

        <div className="flex flex-wrap gap-1.5 h-14 overflow-hidden content-start relative">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-neutral-900 text-neutral-400 text-[10px] rounded-md border border-neutral-800 font-medium">
              {tag}
            </span>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </div>

      {/* Call to Actions - Pill shaped buttons */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <Button variant="outline" className="h-9 rounded-xl text-xs font-semibold border-neutral-800 hover:bg-neutral-900 hover:text-[#ADFF44] hover:border-[#ADFF44]/30 transition-colors">
          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
          Send DM
        </Button>
        <Button className="h-9 rounded-xl text-xs font-semibold bg-black text-white hover:bg-[#9BE63D] hover:shadow-lg hover:shadow-[#ADFF44]/10 transition-all border-0">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          Book Call
        </Button>
      </div>

    </motion.div>
  );
};
