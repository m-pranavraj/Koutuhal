import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/data/courses';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact';
}

export const CourseCard = ({ course, variant = 'default' }: CourseCardProps) => {
  const isCompact = variant === 'compact';

  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              course.level === 'Beginner' && 'bg-emerald-100 text-emerald-700',
              course.level === 'Intermediate' && 'bg-blue-100 text-blue-700',
              course.level === 'Advanced' && 'bg-purple-100 text-purple-700'
            )}
          >
            {course.level}
          </Badge>
          {course.isPopular && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">Popular</Badge>
          )}
          {course.isFree && (
            <Badge className="bg-green-100 text-green-700 text-xs">Free</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {course.category}
          </Badge>
        </div>
        
        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
          {course.title}
        </h3>
        
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>

        <p className="mb-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{course.instructor}</span>
        </p>

        {/* Rating & Price */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.floor(course.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                )}
              />
            ))}
            <span className="ml-1 text-sm font-medium">{course.rating}</span>
          </div>
          <span className={cn(
            'font-bold',
            course.isFree ? 'text-green-600' : 'text-foreground'
          )}>
            {course.price}
          </span>
        </div>

        {/* Perfect For */}
        {course.perfectFor && !isCompact && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Perfect for:</p>
            <div className="flex flex-wrap gap-1">
              {course.perfectFor.slice(0, 2).map((item) => (
                <Badge key={item} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
              {course.perfectFor.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{course.perfectFor.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/courses/${course.id}`} className="flex-1">
            <Button
              className={cn(
                'w-full',
                course.isFree
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'gradient-primary text-white hover:opacity-90'
              )}
            >
              {course.isFree ? 'Start Free' : 'Enroll Now'}
            </Button>
          </Link>
          <Link to={`/courses/${course.id}`}>
            <Button variant="outline">Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
