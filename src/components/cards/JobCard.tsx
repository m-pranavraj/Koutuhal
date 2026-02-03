import { MapPin, Briefcase, DollarSign, Building2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@/data/jobs';

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  return (
    <div className="group overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="line-clamp-1">{job.company}</span>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          {job.type}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {job.mode}
        </Badge>
      </div>

      {/* Details */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          {job.experience}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          {job.salary}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {job.description}
      </p>

      {/* Skills */}
      <div className="mb-4 flex flex-wrap gap-1">
        {job.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
            {skill}
          </Badge>
        ))}
        {job.skills.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{job.skills.length - 3}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <Button className="w-full gradient-primary text-white hover:opacity-90">
        View Details
      </Button>
    </div>
  );
};
