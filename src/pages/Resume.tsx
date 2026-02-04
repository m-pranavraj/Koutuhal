import { ResumeCard } from "@/components/cards/ResumeCard";
import { FileText, Target, Crosshair } from 'lucide-react';
import EvaluationSection from "@/components/resume/EvaluationSection";
import HowItWorks from "@/components/resume/HowItWorks";

const Resume = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 pb-20 pt-32 text-center px-4 border-b border-gray-100 dark:border-slate-800">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
          Perfect Your <span className="text-purple-600">Resume</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Build from Scratch • Improve Your Resume • Customize for Jobs
        </p>
      </div>

      {/* Cards Section - Intersecting the Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1: Create Resume */}
          <ResumeCard
            icon={FileText}
            title="CREATE RESUME"
            subtitle="Build a recruiter-ready resume instantly"
            variant="blue"
            to="/resume-builder"
            features={[
              "One-click import from LinkedIn",
              "Real-time preview as you build",
              "Auto-save + instant PDF export",
              "Unlimited editing + lifetime access"
            ]}
          />

          {/* Card 2: Improve Resume (Scanner) */}
          <ResumeCard
            icon={Target}
            title="IMPROVE RESUME"
            subtitle="Turn your resume into a recruiter magnet"
            variant="green"
            to="/resume-scanner"
            features={[
              "A-TEAM framework-based insights",
              "Ready to use bullets",
              "10-pager detailed feedback report",
              "Industry-fit optimization guidance"
            ]}
          />

          {/* Card 3: Customize (Placeholders for now) */}
          <ResumeCard
            icon={Crosshair}
            title="CUSTOMIZE RESUME"
            subtitle="Tailor resume based on the job description"
            variant="teal"
            to="/resume-scanner"
            features={[
              "Five-point job fit analysis",
              "Ready-to-use JD-optimized bullets",
              "Actionable suggestions with examples",
              "Predicted interview questions & tips"
            ]}
          />
        </div>
      </div>

      {/* Evaluation Section */}
      <EvaluationSection />

      {/* How it Works Section */}
      <HowItWorks />

      {/* Trusted By Section */}
      <div className="bg-white dark:bg-slate-900 py-16 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-10">Trusted By The Best</h3>

          {/* Logo Marquee (Using text for now as placeholders, icons would be better relative paths if available) */}
          <div className="flex flex-wrap justify-center items-center gap-12 text-slate-400 font-bold text-xl grayscale opacity-70">
            <span className="flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-8" alt="Amazon" /></span>
            <span className="flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" className="h-8" alt="Spotify" /></span>
            <span className="flex items-center gap-2 text-2xl font-serif text-slate-600">McKinsey & Company</span>
            <span className="flex items-center gap-2 text-2xl font-serif text-slate-600">BCG</span>
            <span className="flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-8" alt="PayPal" /></span>
            <span className="flex items-center gap-2"><img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-8" alt="Netflix" /></span>
            {/* Fallback for others */}
            <span>Google</span>
            <span>Microsoft</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Resume;
