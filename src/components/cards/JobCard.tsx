import { MapPin, Banknote, Briefcase, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@/data/jobs';
import { motion } from 'framer-motion';

export const JobCard = ({ job }: { job: Job }) => {
  const tags = job.skills || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#ADFF44]/5 transition-colors">
            <Briefcase className="w-6 h-6 text-gray-400 group-hover:text-[#ADFF44] transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#ADFF44] transition-colors line-clamp-1">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-gray-500">{job.company}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-[#ADFF44] transition-colors p-1 rounded-full hover:bg-[#ADFF44]/5">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Type Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="rounded-full px-3 py-0.5 font-normal border-gray-200 text-gray-600 bg-neutral-900 hover:bg-gray-50">
          {job.type}
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-0.5 font-normal border-gray-200 text-gray-600 bg-neutral-900 hover:bg-gray-50">
          WFO
        </Badge>
      </div>

      {/* Info Row (Location | Exp | Salary) */}
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-5 bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/50">
        <div className="flex items-center gap-1.5 shrink-0">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px]">{job.location}</span>
        </div>
        <div className="h-3 w-[1px] bg-gray-300"></div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Briefcase className="w-3.5 h-3.5" />
          <span>2-5 Yrs</span>
        </div>
        <div className="h-3 w-[1px] bg-gray-300"></div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Banknote className="w-3.5 h-3.5" />
          <span>{job.salary}</span>
        </div>
      </div>

      {/* Description Preview */}
      <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
        {job.description || "We are looking for a qualified professional to join our team. If you are passionate about AI and technology, this is the perfect role for you."}
      </p>

      {/* Skills/Tags (Purple background) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-[#ADFF44]/5 text-[#ADFF44] text-xs rounded font-medium">
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded font-medium">
            +{tags.length - 3}
          </span>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="flex items-center justify-end border-t border-gray-50 pt-4 mt-auto">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 font-medium shadow-lg shadow-primary/20">
          View Details
        </Button>
      </div>
    </motion.div>
  );
};
