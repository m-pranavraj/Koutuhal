import { useState, useEffect } from 'react';
import { CreateCourseDialog } from '@/components/admin/CreateCourseDialog';
import { Header } from '@/components/layout/Header';
import { CourseCard } from '@/components/cards/CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courseCategories, courseLevels } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Define the API response type locally or import if available
interface Course {
  id: string; // UUID from backend
  title: string;
  instructor?: string;
  level?: string;
  duration?: string; // e.g. "16 Weeks"
  price: number; // in paise
  rating?: number;
  category?: string;
  image_url?: string; // backend field
  tags?: string[];
  description: string;
  details?: any;
  is_active: boolean;
}

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, use an env var for base URL. Assuming proxy or relative path for now.
      // If npm run dev proxies to backend at localhost:8000, we can use relative path.
      // If not, we might need full URL. 
      // Based on previous code in AdminDashboard, it uses '/api/v1/...'.
      const res = await fetch('/api/v1/payments/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses. Please try again later.");
      toast.error("Could not fetch course catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const levelMatch = selectedLevel === 'All Levels' || course.level === selectedLevel;
    const categoryMatch = selectedCategory === 'All Categories' || course.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const clearFilters = () => {
    setSelectedLevel('All Levels');
    setSelectedCategory('All Categories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#ADFF44] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Oops! Something went wrong.</h2>
        <p className="text-zinc-400">{error}</p>
        <Button onClick={fetchCourses} className="bg-[#ADFF44] text-black hover:bg-[#baff66]">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-neutral-900 dark:bg-black/50 py-20 pt-32">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Course Catalog</h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive AI education programs
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full shrink-0 lg:w-64">
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <h3 className="mb-4 font-semibold">Level</h3>
                <div className="mb-6 flex flex-wrap gap-2">
                  {courseLevels.map((level) => (
                    <Badge
                      key={level}
                      variant={selectedLevel === level ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedLevel === level && 'gradient-primary text-white'
                      )}
                      onClick={() => setSelectedLevel(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>

                <h3 className="mb-4 font-semibold">Category</h3>
                <div className="mb-6 flex flex-wrap gap-2">
                  {courseCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedCategory === category && 'gradient-primary text-white'
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </aside>

            {/* Course Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> of {courses.length} courses
                </p>
                <div className="flex gap-2">
                  {/* Admin Create Button */}
                  <CreateCourseDialog onCourseCreated={fetchCourses} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  // Map backend fields to CourseCard props
                  // Note: CourseCard expects specific props. We might need to adjust CourseCard or map here.
                  // Assuming CourseCard can take the whole object or we spread it if keys match.
                  // Let's pass the mapped object to be safe.
                  <CourseCard
                    key={course.id}
                    course={{
                      id: course.id,
                      title: course.title,
                      instructor: course.instructor || "Unknown",
                      level: (course.level as any) || "Beginner",
                      duration: course.duration || "Self-Paced",
                      price: (course.price / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('.00', ''), // Convert paise to INR string
                      rating: course.rating || 0,
                      category: course.category || "General",
                      image: course.image_url || "https://images.unsplash.com/photo-1509062522246-3755977927d7",
                      tags: course.tags,
                      description: course.description
                      // Add other fields if CourseCard needs them
                    }}
                  />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="rounded-xl border bg-card p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    No courses match your filters
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseCatalog;
