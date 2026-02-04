import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
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

const RotatingText = () => {
  const words = ["Schools", "Colleges", "Professionals"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="block h-[1.8em] overflow-visible mt-4 mb-20">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-extrabold text-5xl md:text-7xl leading-tight py-2"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{
            y: { type: "spring", stiffness: 100, damping: 20 },
            opacity: { duration: 0.2 }
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
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
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    icon: Lightbulb,
    title: 'Hands-On Projects',
    description: 'Build real AI applications that you can showcase in your portfolio and interviews',
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    icon: Users,
    title: 'Personal Mentorship',
    description: '1-on-1 guidance from industry experts to accelerate your learning journey',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'AI Tools Access',
    description: 'Easy-to-use AI tools available on any device with no special hardware required',
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Earn certificates and credentials recognized by top tech companies in India',
    gradient: 'from-rose-400 to-pink-500'
  },
  {
    icon: Target,
    title: 'Career Support',
    description: 'Job placement assistance, interview prep, and direct industry connections',
    gradient: 'from-violet-500 to-fuchsia-500'
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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Hero Section - Thematic Premium Design */}
      <section className="relative overflow-hidden bg-slate-900 pb-20 pt-28 lg:pb-32 lg:pt-40">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-purple-600/20 blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl"
          ></motion.div>
        </div>

        <div className="container relative mx-auto max-w-7xl px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-8 bg-white/10 text-white border-white/20 px-6 py-2 text-sm font-medium backdrop-blur-md shadow-xl">
              <Sparkles className="w-4 h-4 mr-2 text-amber-400 inline" />
              AI Education for Everyone
            </Badge>
          </motion.div>

          <motion.h1
            className="mb-8 text-5xl font-bold tracking-tight text-white md:text-7xl leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Start Your{' '}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 animate-gradient-x">
                AI Journey?
              </span>
              <span className="absolute bottom-1 left-0 w-full h-4 bg-purple-500/20 -z-0 rounded-full blur-sm"></span>
            </span>
          </motion.h1>

          <motion.p
            className="mb-10 text-xl text-slate-300 md:text-2xl leading-relaxed max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join thousands of students transforming their careers.
            Explore tailored programs for
            <RotatingText />
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/courses">
              <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition-all shadow-xl shadow-purple-500/25 rounded-xl border-0">
                Enroll Now
              </Button>
            </Link>
            <Link to="/courses/clarity">
              <Button size="lg" className="h-14 px-10 text-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 backdrop-blur-sm rounded-xl transition-all hover:scale-105">
                <Play className="w-5 h-5 mr-2 fill-current" /> Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Floating UI Elements Mockup */}
          <motion.div
            style={{ y }}
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm shadow-2xl hidden md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative aspect-video flex items-center justify-center group cursor-pointer shadow-inner">
              <img
                src="/dashboard-mockup.png"
                alt="Koutuhal AI Learning Dashboard"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1:1 Calls Section (Gold/Dark Contrast) */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 -skew-y-3 origin-top-left scale-110 z-0 border-t border-white/5"></div>
        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1">Premium Support</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              1:1 Calls for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">100% Prep</span>
            </h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-6 gap-4"
          >
            {callFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer text-center"
              >
                <div className="mb-4 mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                  <feature.icon className="h-5 w-5 text-amber-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors leading-tight block">{feature.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Floating Cards */}
      <section className="py-12 -mt-10 z-20 relative px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Partner Workplaces", value: "750+", color: "bg-blue-500" },
              { label: "Partner Colleges", value: "200+", color: "bg-purple-500" },
              { label: "Expert Mentors", value: "1,000+", color: "bg-emerald-500" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 flex items-center justify-between border border-slate-100"
              >
                <div>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-slate-500 font-medium">{stat.label}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.color} opacity-20`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Grid with Hover Effects */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="mb-6 text-4xl font-bold text-slate-900">
              Why Choose Koutuhal?
            </h2>
            <p className="text-xl text-slate-500">
              We provide everything you need to become an AI professional, packaged in a world-class learning experience.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:bg-white hover:-translate-y-1"
              >
                <div className={`mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Preview */}
      <section id="mentors" className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-700 px-3 py-1 border-0">World-Class Faculty</Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Learn from Industry Leaders
              </h2>
              <p className="text-lg text-slate-500 max-w-xl">
                Get personalized guidance from top AI professionals working at companies like Google, Microsoft, and Amazon.
              </p>
            </div>
            <Link to="/mentors">
              <Button size="lg" variant="outline" className="rounded-full px-6 border-slate-300 hover:border-purple-500 hover:text-purple-600">
                View All Mentors <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mentors.slice(0, 4).map((mentor, i) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <MentorCard mentor={mentor} index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses - Dark Mode Contrast */}
      <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Popular Programs
            </h2>
            <p className="text-xl text-slate-400">
              Start your journey with our most loved courses
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to="/courses">
              <Button size="lg" className="h-14 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold">
                Browse All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing - Cards */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Invest in Your Future
            </h2>
            <p className="text-xl text-slate-500">
              Flexible learning packages designed for every stage of your journey.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden rounded-2xl border p-8 transition-all ${plan.isPopular
                  ? 'border-purple-200 bg-purple-50/50 shadow-2xl shadow-purple-200/50'
                  : 'border-slate-100 bg-white shadow-lg shadow-slate-200/50'
                  }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500"> / total</span>
                </div>
                <p className="mb-8 text-sm text-slate-500 font-medium bg-slate-100 inline-block px-3 py-1 rounded-full">{plan.duration}</p>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-12 text-base font-bold rounded-xl ${plan.isPopular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 text-white border-0'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  Start Learning
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Gradient Banner */}
      <section className="py-24 px-4 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-[3rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 lg:p-24 text-center text-white shadow-2xl shadow-purple-900/30 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <h2 className="mb-6 text-4xl md:text-6xl font-bold tracking-tight">
                Ready to Transform Your Future?
              </h2>
              <p className="mb-10 text-xl text-purple-100 max-w-2xl mx-auto">
                Join the program and start your AI journey today. Limited seats available for the upcoming cohort.
              </p>
              <Link to="/courses">
                <Button size="lg" className="h-16 px-12 text-lg bg-white text-purple-700 hover:bg-purple-50 hover:scale-105 transition-all shadow-xl rounded-full font-bold">
                  Join the Program <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
