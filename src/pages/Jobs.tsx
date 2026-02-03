import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JobCard } from '@/components/cards/JobCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { jobs, jobTypes, experienceLevels, jobLocations } from '@/data/jobs';
import { cn } from '@/lib/utils';

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const typeMatch = selectedType === 'All Types' || job.type === selectedType;
    const locationMatch =
      selectedLocation === 'All Locations' ||
      job.location.includes(selectedLocation.replace(' ', ''));
    // Simplified level matching
    const levelMatch = selectedLevel === 'All Levels';
    return searchMatch && typeMatch && levelMatch && locationMatch;
  });

  const clearFilters = () => {
    setSelectedType('All Types');
    setSelectedLevel('All Levels');
    setSelectedLocation('All Locations');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Find Your Dream Role
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Explore exciting opportunities from our trusted partner companies.
          </p>

          {/* Search */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job title, company or skills"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-12 text-lg"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 gradient-primary text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Alerts Banner */}
      <section className="bg-gradient-to-r from-purple-100 to-blue-100 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="hidden h-24 w-24 overflow-hidden rounded-lg md:block">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop"
                  alt="Professional"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Want us to keep you posted on relevant roles?
                </h3>
                <p className="text-muted-foreground">
                  Upload your profile and we'll inform you about best-suited opportunities.
                </p>
              </div>
            </div>
            <Button className="gap-2 gradient-primary text-white hover:opacity-90">
              <Bell className="h-4 w-4" />
              Set Job Alerts
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full shrink-0 lg:w-64">
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <div className="mb-6 flex items-center gap-2">
                  <span className="text-lg">☰</span>
                  <h3 className="font-semibold">Filters</h3>
                </div>

                {/* Job Type */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium">Job Type</h4>
                  <div className="space-y-2">
                    {jobTypes.slice(1).map((type) => (
                      <div key={type} className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setSelectedType(selectedType === type ? 'All Types' : type)
                          }
                          className={cn(
                            'rounded-full border px-3 py-1 text-sm transition-colors',
                            selectedType === type
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {type}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          ({jobs.filter((j) => j.type === type).length})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium">Experience Level</h4>
                  <div className="space-y-2">
                    {experienceLevels.slice(1).map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setSelectedLevel(selectedLevel === level ? 'All Levels' : level)
                        }
                        className={cn(
                          'block w-full rounded-full border px-3 py-1 text-left text-sm transition-colors',
                          selectedLevel === level
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium">Location</h4>
                  <div className="space-y-2">
                    {jobLocations.slice(1).map((location) => (
                      <div key={location} className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setSelectedLocation(
                              selectedLocation === location ? 'All Locations' : location
                            )
                          }
                          className={cn(
                            'rounded-full border px-3 py-1 text-sm transition-colors',
                            selectedLocation === location
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {location}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          ({jobs.filter((j) => j.location.includes(location)).length})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </aside>

            {/* Job Listings */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gradient">Job Openings</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredJobs.length}</span>{' '}
                  Jobs Found
                </p>
              </div>

              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="rounded-xl border bg-card p-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    No jobs match your filters
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

      <Footer />
    </div>
  );
};

export default Jobs;
