import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MentorCard } from '@/components/cards/MentorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mentors, mentorCompanies } from '@/data/mentors';
import { cn } from '@/lib/utils';

const SearchMentors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [activeTab, setActiveTab] = useState('current');

  const filteredMentors = mentors.filter((mentor) => {
    const searchMatch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch =
      selectedCompany === 'All Companies' || mentor.company === selectedCompany;
    const tabMatch =
      activeTab === 'current' ? !mentor.isAlumni : mentor.isAlumni;
    return searchMatch && companyMatch && tabMatch;
  });

  const currentCount = mentors.filter((m) => !m.isAlumni).length;
  const alumniCount = mentors.filter((m) => m.isAlumni).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gradient">
            Let's Find You The Perfect Near Peer
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Connect with industry experts for personalized career guidance
          </p>

          {/* Search */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="w-full shrink-0 lg:w-64">
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <h3 className="mb-4 font-semibold">Search By</h3>

                {/* Tabs */}
                <div className="mb-6">
                  <Button
                    variant={activeTab === 'current' ? 'default' : 'outline'}
                    size="sm"
                    className={cn('mr-2', activeTab === 'current' && 'gradient-primary text-white')}
                    onClick={() => setActiveTab('current')}
                  >
                    Workplace
                  </Button>
                  <Button
                    variant={activeTab === 'alumni' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(activeTab === 'alumni' && 'gradient-primary text-white')}
                    onClick={() => setActiveTab('alumni')}
                  >
                    Alumni
                  </Button>
                </div>

                <h3 className="mb-4 font-semibold">Company</h3>
                <div className="flex flex-wrap gap-2">
                  {mentorCompanies.map((company) => (
                    <Badge
                      key={company}
                      variant={selectedCompany === company ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedCompany === company && 'gradient-primary text-white'
                      )}
                      onClick={() => setSelectedCompany(company)}
                    >
                      {company}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={() => {
                    setSelectedCompany('All Companies');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </aside>

            {/* Mentor Grid */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="current">
                    Current Employees ({currentCount})
                  </TabsTrigger>
                  <TabsTrigger value="alumni">
                    Alumni ({alumniCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                  </div>

                  {filteredMentors.length === 0 && (
                    <div className="rounded-xl border bg-card p-12 text-center">
                      <p className="text-lg font-medium text-muted-foreground">
                        No mentors match your search
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSelectedCompany('All Companies');
                          setSearchQuery('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Programs */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Mentorship Programs</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6">
              <Badge className="mb-4 badge-available">Free for students</Badge>
              <h3 className="mb-2 text-xl font-bold">1-on-1 Mentorship</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Personal guidance sessions with industry experts
              </p>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li>• 3 months duration</li>
                <li>• 8 sessions</li>
                <li>• Weekly 1-hour video calls</li>
                <li>• Personalized learning plan</li>
                <li>• Career guidance and advice</li>
              </ul>
              <Button className="w-full gradient-primary text-white hover:opacity-90">
                Apply Now
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <Badge className="mb-4 badge-available">Free for students</Badge>
              <h3 className="mb-2 text-xl font-bold">Group Mentorship</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Learn alongside peers with expert guidance
              </p>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li>• 2 months duration</li>
                <li>• 6 group sessions</li>
                <li>• Small groups of 5-8 students</li>
                <li>• Collaborative projects</li>
                <li>• Peer learning opportunities</li>
              </ul>
              <Button className="w-full gradient-primary text-white hover:opacity-90">
                Apply Now
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <Badge className="mb-4 badge-limited">Free for enrolled students</Badge>
              <h3 className="mb-2 text-xl font-bold">Mentor Masterclasses</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Exclusive sessions with top industry leaders
              </p>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                <li>• Monthly live sessions</li>
                <li>• Q&A with industry leaders</li>
                <li>• Latest industry trends</li>
                <li>• Career opportunities</li>
                <li>• Recorded for later viewing</li>
              </ul>
              <Button className="w-full gradient-primary text-white hover:opacity-90">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">How Mentorship Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: 1, title: 'Apply', desc: 'Submit your application with your goals and interests' },
              { step: 2, title: 'Match', desc: 'Get matched with the perfect mentor based on your profile' },
              { step: 3, title: 'Learn', desc: 'Start your mentorship journey with regular sessions' },
              { step: 4, title: 'Succeed', desc: 'Achieve your career goals with expert guidance' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchMentors;
