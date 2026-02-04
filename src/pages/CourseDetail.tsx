import { useParams, Link } from 'react-router-dom';
import { Clock, Users, Award, CheckCircle, ArrowLeft, Play, Download, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurriculumAccordion } from '@/components/features/CurriculumAccordion';
import { curriculum } from '@/data/instructors';
import { courses } from '@/data/courses';
import { motion } from 'framer-motion';

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">

      {/* Hero Section - Thematic Dark Gradient */}
      <section className="relative overflow-hidden bg-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-28 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/courses" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 border-0 px-3 py-1 text-sm font-bold shadow-lg shadow-amber-500/20">
                Premium Certification
              </Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {program.title}
              </h1>
              <p className="mb-8 text-lg text-slate-300 leading-relaxed max-w-xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-sm">{program.duration}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-sm">{program.tools}+ AI Tools</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="font-medium text-sm">{program.projects} Projects</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0 shadow-xl shadow-purple-500/25 rounded-xl transition-all hover:scale-105">
                  Enroll Now <Sparkles className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 bg-transparent text-white hover:bg-white/10 rounded-xl backdrop-blur-sm">
                  <Play className="mr-2 h-4 w-4" /> Watch Preview
                </Button>
              </div>
            </motion.div>

            {/* Hero Image / Abstract Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:h-[500px] w-full hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[2rem] transform rotate-3"></div>
              <div className="absolute inset-0 bg-slate-800 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transform -rotate-2 flex items-center justify-center">
                {/* Placeholder for Program Image */}
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Master AI Today</h3>
                  <p className="text-slate-400">Join the top 1% of AI professionals</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards - Floating */}
      <section className="relative -mt-16 z-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { title: "Flexible Learning", desc: "Learn at your own pace with 24/7 access", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
              { title: "Expert Mentorship", desc: "Get guidance from AI researchers", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Industry Recognition", desc: "Earn valued certificates", icon: Award, color: "text-amber-600", bg: "bg-amber-50" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4 hover:translate-y-[-5px] transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 lg:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="max-w-3xl mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">What You'll Learn</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                This comprehensive curriculum is designed to take you from basics to advanced applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {program.learnings.map((learning, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  key={learning}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-lg leading-relaxed">{learning}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="bg-slate-50 dark:bg-slate-950 py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-0 px-4 py-1.5">Weekly Breakdown</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">Curriculum Overview</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              A structured journey to mastery, designed by industry experts.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <CurriculumAccordion weeks={program.weeks} />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 lg:p-16 text-center text-white relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Master the Tools of the Future</h2>
              <p className="text-slate-300 text-lg mb-10">
                Get hands-on experience with the industry's most powerful AI platforms and libraries.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {program.toolsList.map((tool, i) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Badge variant="secondary" className="px-4 py-2 text-sm bg-white/10 text-white backdrop-blur border border-white/20 hover:bg-white/20">
                      {tool}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">Projects You'll Build</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {program.projectsList.map((project, index) => (
              <motion.div
                whileHover={{ y: -8 }}
                key={project}
                className="group rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-200 border-b-2 border-transparent group-hover:border-purple-500 inline-block transition-all pb-1">{project}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="rounded-[2.5rem] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 p-12 lg:p-20 text-center text-white shadow-2xl shadow-purple-900/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <h2 className="relative text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="relative text-purple-100 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of students who are leading the AI revolution.
            </p>
            <div className="relative flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-10 text-base bg-white text-purple-700 hover:bg-purple-50 hover:scale-105 transition-all shadow-lg rounded-xl font-bold">
                Enroll Now
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base border-white/30 text-white hover:bg-white/10 rounded-xl">
                Download Syllabus <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CourseDetail;
