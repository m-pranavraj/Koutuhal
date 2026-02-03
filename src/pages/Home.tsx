import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Target,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CourseCard } from '@/components/cards/CourseCard';
import { MentorCard } from '@/components/cards/MentorCard';
import { courses } from '@/data/courses';
import { mentors } from '@/data/mentors';
import { instructors, pricingPlans, faqs } from '@/data/instructors';

const stats = [
  { label: 'Students Empowered', value: '1500+' },
  { label: 'AI Tools Access', value: 'Free' },
  { label: 'Learning Support', value: '24/7' },
  { label: 'School Friendly', value: 'Gov' },
];

const features = [
  {
    icon: Sparkles,
    title: 'Cutting-Edge Curriculum',
    description: 'Learn the latest AI technologies including GPT, Computer Vision, and ML algorithms',
  },
  {
    icon: Lightbulb,
    title: 'Hands-On Projects',
    description: 'Build real AI applications that you can showcase in your portfolio and interviews',
  },
  {
    icon: Users,
    title: 'Personal Mentorship',
    description: '1-on-1 guidance from industry experts to accelerate your learning journey',
  },
  {
    icon: Zap,
    title: 'AI Tools Access',
    description: 'Easy-to-use AI tools available on any device with no special hardware required',
  },
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Earn certificates and credentials recognized by top tech companies in India',
  },
  {
    icon: Target,
    title: 'Career Support',
    description: 'Job placement assistance, interview prep, and direct industry connections',
  },
];

const callFeatures = [
  { icon: Users, title: 'Mock Interview' },
  { icon: BookOpen, title: 'Resume Review' },
  { icon: Target, title: 'Role Fit Assessment' },
  { icon: Lightbulb, title: 'Industry Understanding' },
  { icon: Users, title: 'Networking Guidance' },
  { icon: GraduationCap, title: 'Career Clarity' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 gradient-primary text-white">
              AI Education for Everyone
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Ready to Start Your{' '}
              <span className="text-gradient">AI Journey?</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join thousands of students who have transformed their careers with Koutuhal.
              Explore tailored programs for schools, colleges, and businesses.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/courses">
                <Button size="lg" className="gradient-primary text-white hover:opacity-90">
                  Explore Our Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link to="/courses/schools">
                  <Button variant="outline" size="lg">AI for Schools</Button>
                </Link>
                <Link to="/courses/bootcamp">
                  <Button variant="outline" size="lg">AI for Colleges</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1:1 Calls Section */}
      <section className="py-16 gradient-gold text-white">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            1:1 Calls for 100% Prep
          </h2>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {callFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-lg bg-white/10 p-4 backdrop-blur"
              >
                <feature.icon className="mb-2 h-8 w-8" />
                <span className="text-center text-sm font-medium">{feature.title}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="rounded-lg bg-gold-light px-6 py-3 text-amber-900 font-semibold">
              750+ Workplaces
            </div>
            <div className="rounded-lg bg-gold-light px-6 py-3 text-amber-900 font-semibold">
              200+ Colleges
            </div>
            <div className="rounded-lg bg-gold-light px-6 py-3 text-amber-900 font-semibold">
              1,000+ Experts
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Preview */}
      <section id="mentors" className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Learn from Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground">
              Get personalized guidance from top AI professionals working at leading tech companies
            </p>
          </div>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">Our Mentors</Badge>
              <Badge variant="outline">Mentorship Programs</Badge>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mentors.slice(0, 8).map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/mentors">
              <Button variant="outline" size="lg">
                View All Mentors
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-slate-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <h3 className="mb-8 text-center text-xl font-semibold text-foreground">
            Mentorship Impact
          </h3>
          <p className="mb-8 text-center text-muted-foreground">
            Real results from our mentorship programs
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Comprehensive AI Education Program
            </h2>
            <p className="text-lg text-muted-foreground">
              From fundamentals to advanced applications, our curriculum is designed to make you job-ready in AI
            </p>
          </div>

          {/* Benefits Row */}
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Flexible Learning</h4>
                <p className="text-sm text-muted-foreground">Learn at your own pace with 24/7 access</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Expert Mentorship</h4>
                <p className="text-sm text-muted-foreground">Get guidance from AI researchers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Industry Recognition</h4>
                <p className="text-sm text-muted-foreground">Earn valued certificates</p>
              </div>
            </div>
          </div>

          {/* Learnings */}
          <div className="rounded-xl border bg-card p-8">
            <h3 className="mb-6 text-xl font-semibold">What You'll Learn</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Understand basic AI tools and their uses',
                'Use AI apps to solve everyday problems',
                'Create simple AI projects with guidance',
                'Explore AI in daily life (voice assistants, image recognition)',
                'Enhance creativity & problem-solving through AI',
                'Learn to use AI responsibly and safely',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Timeline */}
          <div className="mt-12 rounded-xl border bg-card p-8">
            <h3 className="mb-6 text-xl font-semibold">Curriculum Overview</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-sm font-medium text-primary">Weeks 1-4</span>
                <h4 className="mb-2 mt-1 font-semibold">AI Basics</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>ChatGPT & AI Tools</li>
                  <li>Simple Coding</li>
                  <li>AI for Students</li>
                  <li>Smart Study Methods</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-sm font-medium text-primary">Weeks 5-8</span>
                <h4 className="mb-2 mt-1 font-semibold">AI Learning Tools</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>AI Quiz Makers</li>
                  <li>Study Assistants</li>
                  <li>Smart Presentations</li>
                  <li>Learning Apps</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-sm font-medium text-primary">Weeks 9-16</span>
                <h4 className="mb-2 mt-1 font-semibold">AI Projects</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Build AI Games</li>
                  <li>Create AI Helpers</li>
                  <li>Make Smart Apps</li>
                  <li>AI Art & Videos</li>
                </ul>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <span className="text-sm font-medium text-primary">Weeks 17-24</span>
                <h4 className="mb-2 mt-1 font-semibold">Real AI Projects</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Career AI Guide</li>
                  <li>AI Business Ideas</li>
                  <li>Share Your Projects</li>
                  <li>Future Skills</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Why Choose Koutuhal?
            </h2>
            <p className="text-lg text-muted-foreground">
              We provide everything you need to become an AI professional
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Built for Indian Students */}
          <div className="mt-16 rounded-xl gradient-primary p-8 text-white">
            <h3 className="mb-6 text-center text-2xl font-bold">
              Built for Indian Students
            </h3>
            <p className="mb-8 text-center text-white/90">
              We understand the unique challenges and opportunities in the Indian tech ecosystem
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
                <h4 className="mb-2 font-semibold">Indian Context</h4>
                <p className="text-sm text-white/80">
                  Curriculum designed specifically for Indian students and job market needs
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
                <h4 className="mb-2 font-semibold">Latest Technology</h4>
                <p className="text-sm text-white/80">
                  Stay ahead with the most current AI tools and frameworks
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
                <h4 className="mb-2 font-semibold">Community Driven</h4>
                <p className="text-sm text-white/80">
                  Join a thriving community of AI enthusiasts and professionals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section id="instructors" className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Meet Our AI Coaches
            </h2>
            <p className="text-lg text-muted-foreground">
              Our AI coaches are experienced educators dedicated to making AI accessible
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-semibold">{instructor.name}</h3>
                  <p className="mb-3 text-sm font-medium text-primary">
                    {instructor.title}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {instructor.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {instructor.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Faculty Stats */}
          <div className="mt-16 rounded-xl border bg-card p-8">
            <h3 className="mb-6 text-center text-xl font-semibold">World-Class Faculty</h3>
            <p className="mb-8 text-center text-muted-foreground">
              Our instructors combine deep academic knowledge with practical industry experience
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">18+</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">20+</p>
                <p className="text-sm text-muted-foreground">Research Papers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">15,000+</p>
                <p className="text-sm text-muted-foreground">Students Guided</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">Young</p>
                <p className="text-sm text-muted-foreground">Learner Focus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Popular Courses
            </h2>
            <p className="text-lg text-muted-foreground">
              Start learning with our most loved programs
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/courses">
              <Button size="lg" className="gradient-primary text-white hover:opacity-90">
                Browse All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from our students who have transformed their careers
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Koutuhal transformed my understanding of AI. The practical approach and expert guidance helped me land an internship at a top tech company.",
                name: "Arjun Patel",
                role: "Computer Science Student, IIT Bombay",
              },
              {
                quote: "The course content is incredibly well-structured. I went from AI novice to building my own machine learning models in just 12 weeks.",
                name: "Sneha Reddy",
                role: "Engineering Graduate, BITS Pilani",
              },
              {
                quote: "Perfect blend of technical depth and business applications. Now I can speak confidently about AI strategy in my consulting interviews.",
                name: "Vikram Singh",
                role: "MBA Student, ISB Hyderabad",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-xl border bg-card p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Choose Your Learning Path
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible learning packages designed for young learners
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg ${
                  plan.isPopular ? 'border-primary ring-2 ring-primary' : ''
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -right-8 top-4 rotate-45 bg-primary px-8 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> total</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">{plan.duration}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.isPopular
                      ? 'gradient-primary text-white hover:opacity-90'
                      : ''
                  }`}
                  variant={plan.isPopular ? 'default' : 'outline'}
                >
                  Start Learning
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We have answers.
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="overflow-hidden rounded-lg border bg-card px-4"
              >
                <AccordionTrigger className="py-4 text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">Still Have Questions?</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">Book a Call</Button>
              <Button className="gradient-primary text-white hover:opacity-90">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-20 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Transform Your Future?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join the program and start your AI journey today
          </p>
          <Link to="/courses">
            <Button size="lg" variant="secondary" className="text-primary">
              Join the Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
