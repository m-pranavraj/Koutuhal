import { FileText, Upload, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const resumeTools = [
  {
    title: 'CREATE Resume',
    subtitle: 'Build a recruiter-ready resume instantly',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    features: [
      'One-click import from LinkedIn',
      'Real-time preview as you build',
      'Auto-save + instant PDF export',
      'Unlimited editing + lifetime access',
    ],
    cta: 'Get Started',
  },
  {
    title: 'IMPROVE Resume',
    subtitle: 'Turn your resume into a recruiter magnet',
    icon: Upload,
    color: 'from-emerald-500 to-teal-600',
    features: [
      'A-TEAM framework–based insights',
      'Ready to use bullets',
      '10-pager detailed feedback report',
      'Industry-fit optimization guidance',
    ],
    cta: 'Get Started',
  },
  {
    title: 'CUSTOMIZE Resume',
    subtitle: 'Tailor resume based on the job description',
    icon: Target,
    color: 'from-purple-500 to-violet-600',
    features: [
      'Five-point job fit analysis',
      'Ready-to-use JD-optimized bullets',
      'Actionable suggestions with examples',
      'Predicted interview questions & tips',
    ],
    cta: 'Get Started',
  },
];

const evaluationMetrics = [
  'ATS Friendly',
  'Formatting',
  'Career Trajectory',
  'Structural Strength',
  'Measurable Achievements',
  'Execution Depth',
];

const trustedCompanies = [
  'McKinsey',
  'BCG',
  'PayPal',
  'Accenture',
  'Zomato',
  'Netflix',
  'Google',
  'Amazon',
];

const Resume = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Perfect Your Resume
          </h1>
          <p className="mb-12 text-lg text-muted-foreground">
            Build from Scratch • Improve Your Resume • Customize for Jobs
          </p>

          {/* Resume Tools */}
          <div className="grid gap-6 md:grid-cols-3">
            {resumeTools.map((tool) => (
              <div
                key={tool.title}
                className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${tool.color} p-6 text-white`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">{tool.title}</h3>
                      <p className="text-sm text-white/90">{tool.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    WHAT YOU GET:
                  </p>
                  <ul className="mb-6 space-y-3">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full gap-2 gradient-primary text-white hover:opacity-90">
                    {tool.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y bg-slate-50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <h3 className="mb-8 text-center text-xl font-semibold">
            Trusted By The Best
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {trustedCompanies.map((company) => (
              <span
                key={company}
                className="text-lg font-semibold text-muted-foreground"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Metrics */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Evaluate Every Dimension
          </h2>
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {evaluationMetrics.map((metric) => (
              <Badge
                key={metric}
                variant="outline"
                className="px-4 py-2 text-sm"
              >
                {metric}
              </Badge>
            ))}
          </div>

          {/* A-TEAM Framework */}
          <div className="rounded-xl border bg-card p-8">
            <h3 className="mb-6 text-center text-xl font-bold">
              Proprietary Evaluation
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-gradient">A-TEAM</div>
                <p className="text-sm text-muted-foreground">Framework</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-gradient">10+</div>
                <p className="text-sm text-muted-foreground">
                  Pages of Detailed Analysis
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-gradient">Ivy League</div>
                <p className="text-sm text-muted-foreground">
                  Trusted by MBAs
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-gradient">MAANG</div>
                <p className="text-sm text-muted-foreground">
                  Employees Trust Us
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold">
            How it Works (Like Magic)
          </h2>
          <div className="grid gap-8 md:grid-cols-5">
            {[
              { step: 1, title: 'Upload Your Resume' },
              { step: 2, title: 'Get Comprehensive Scorecard' },
              { step: 3, title: 'Review Suggested Enhancements' },
              { step: 4, title: 'Discuss Changes with AI Coach' },
              { step: 5, title: 'Get Feedback from Experts' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold">
                  {item.step}
                </div>
                <p className="text-sm font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Ready to Land Your Dream Job?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {resumeTools.map((tool) => (
              <div
                key={tool.title}
                className="rounded-xl border bg-card p-6 text-center"
              >
                <h3 className="mb-2 font-bold">{tool.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {tool.subtitle}
                </p>
                <Button className="w-full gradient-primary text-white hover:opacity-90">
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resume;
