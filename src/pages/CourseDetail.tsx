import { useParams, Link } from 'react-router-dom';
import { Clock, Users, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurriculumAccordion } from '@/components/features/CurriculumAccordion';
import { curriculum } from '@/data/instructors';
import { courses } from '@/data/courses';

const programData: Record<string, keyof typeof curriculum> = {
  '1': 'bootcamp',
  '2': 'business',
  '6': 'schools',
  'schools': 'schools',
  'bootcamp': 'bootcamp',
  'business': 'business',
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const programKey = programData[id || ''] || 'schools';
  const program = curriculum[programKey];
  
  // Find matching course for additional info
  const course = courses.find((c) => {
    if (programKey === 'bootcamp') return c.id === 1;
    if (programKey === 'business') return c.id === 2;
    if (programKey === 'schools') return c.id === 6;
    return c.id === parseInt(id || '1');
  }) || courses[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-primary py-16 text-white">
        <div className="container mx-auto max-w-7xl px-4">
          <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">{program.title}</h1>
          <p className="mb-6 max-w-2xl text-lg text-white/90">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Duration: {program.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>AI Tools: {program.tools}+</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>Projects: {program.projects}</span>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <Button size="lg" variant="secondary" className="text-primary">
              Join Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Request Info
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="rounded-xl border bg-card p-8">
            <h2 className="mb-4 text-2xl font-bold">About This Program</h2>
            <p className="text-muted-foreground leading-relaxed">
              {programKey === 'schools' &&
                "Designed for school students (Grades 8-12), this program introduces AI concepts through hands-on projects, making learning engaging and practical."}
              {programKey === 'bootcamp' &&
                "Designed for college students and early professionals, this intensive bootcamp covers everything from AI fundamentals to production-ready applications, with a focus on generative AI technologies."}
              {programKey === 'business' &&
                "Designed for business professionals, entrepreneurs, and decision-makers, this bootcamp provides practical AI strategies to transform your business operations, marketing, and customer engagement."}
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-2xl font-bold">Curriculum</h2>
          <p className="mb-8 text-muted-foreground">
            Comprehensive week-by-week breakdown of what you'll learn
          </p>
          <CurriculumAccordion weeks={program.weeks} />
        </div>
      </section>

      {/* Tools */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="rounded-xl border bg-card p-8">
            <h2 className="mb-2 text-2xl font-bold">AI Tools You'll Master</h2>
            <p className="mb-6 text-muted-foreground">
              Get hands-on experience with industry-leading AI tools
            </p>
            <div className="rounded-lg bg-slate-50 p-6">
              <h3 className="mb-4 font-semibold">AI Tools Covered:</h3>
              <div className="flex flex-wrap gap-2">
                {program.toolsList.map((tool) => (
                  <Badge key={tool} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-2xl font-bold">Projects You'll Build</h2>
          <p className="mb-8 text-muted-foreground">
            Apply your learning through hands-on projects
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {program.projectsList.map((project, index) => (
              <div
                key={project}
                className="rounded-xl border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-white font-bold">
                  {index + 1}
                </div>
                <h3 className="font-medium">{project}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="rounded-xl border bg-card p-8">
            <h2 className="mb-6 text-2xl font-bold">What You'll Learn</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {program.learnings.map((learning) => (
                <div key={learning} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-muted-foreground">{learning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-16 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Future?</h2>
          <p className="mb-8 text-white/90">
            Join the program and start your AI journey today
          </p>
          <Button size="lg" variant="secondary" className="text-primary">
            Join the Program
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: programKey === 'schools' ? 'What grade levels is this for?' : 'What prerequisites are needed?',
                a: programKey === 'schools'
                  ? 'This program is designed for students in grades 8-12, but can be adapted for motivated younger students.'
                  : 'Basic programming knowledge (Python preferred) and familiarity with web technologies. We cover AI concepts from scratch.',
              },
              {
                q: programKey === 'schools' ? 'Do students need coding experience?' : 'Is this program suitable for beginners?',
                a: programKey === 'schools'
                  ? 'No prior coding experience is required. We start with the basics and use user-friendly AI tools.'
                  : 'Yes, we start with fundamentals. However, programming experience will help you progress faster.',
              },
              {
                q: 'What equipment is needed?',
                a: programKey === 'schools'
                  ? 'Students need a computer or tablet with internet access. All tools are web-based.'
                  : 'A computer with good internet connection. All tools are either free or have educational licenses.',
              },
              {
                q: programKey === 'schools' ? 'How are students assessed?' : 'Will I get job placement support?',
                a: programKey === 'schools'
                  ? 'Assessment is project-based, focusing on creativity, understanding, and practical application.'
                  : 'Yes, we provide career guidance, portfolio reviews, and interview preparation.',
              },
              {
                q: programKey === 'schools' ? 'Can schools customize the curriculum?' : 'What certificate will I receive?',
                a: programKey === 'schools'
                  ? "Yes, we can adapt the program to align with your school's needs and schedule."
                  : 'Upon completion, you receive a Generative AI Professional Certificate recognized by industry.',
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
