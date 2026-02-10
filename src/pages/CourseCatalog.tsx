import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CourseCard } from '@/components/cards/CourseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courses, courseCategories, courseLevels } from '@/data/courses';
import { cn } from '@/lib/utils';

const CourseCatalog = () => {
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const filteredCourses = courses.filter((course) => {
    const levelMatch = selectedLevel === 'All Levels' || course.level === selectedLevel;
    const categoryMatch = selectedCategory === 'All Categories' || course.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const clearFilters = () => {
    setSelectedLevel('All Levels');
    setSelectedCategory('All Categories');
  };

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
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
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
