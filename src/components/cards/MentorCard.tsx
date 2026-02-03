import { Star, Linkedin, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Mentor } from '@/data/mentors';
import { cn } from '@/lib/utils';

interface MentorCardProps {
  mentor: Mentor;
}

export const MentorCard = ({ mentor }: MentorCardProps) => {
  return (
    <div className="group overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-lg">
      {/* Availability Badge */}
      <div className="mb-4 flex items-start justify-between">
        <Badge
          className={cn(
            'text-xs',
            mentor.availability === 'available' && 'badge-available',
            mentor.availability === 'limited' && 'badge-limited',
            mentor.availability === 'waitlist' && 'badge-waitlist'
          )}
        >
          {mentor.availability === 'available' && 'Available'}
          {mentor.availability === 'limited' && 'Limited'}
          {mentor.availability === 'waitlist' && 'Waitlist'}
        </Badge>
        {mentor.linkedin && (
          <a
            href={mentor.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        )}
      </div>

      {/* Profile */}
      <div className="mb-4 flex items-center gap-4">
        <img
          src={mentor.image}
          alt={mentor.name}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
        />
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-semibold text-foreground">{mentor.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{mentor.title}</p>
          <p className="text-sm font-medium text-primary">{mentor.company}</p>
        </div>
      </div>

      {/* Experience & Rating */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{mentor.experience} experience</span>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{mentor.rating}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4 flex flex-wrap gap-1">
        {mentor.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1">
          <MessageSquare className="h-4 w-4" />
          Send DM
        </Button>
        <Button size="sm" className="flex-1 gap-1 gradient-primary text-white hover:opacity-90">
          <Calendar className="h-4 w-4" />
          Schedule Call
        </Button>
      </div>
    </div>
  );
};
