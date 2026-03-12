import React, { useState } from 'react';
import { ArrowRight, Upload, Loader2, AlertCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface TailorState {
  jobDescription: string;
  resumeText: string;
  tailoredResume: string | null;
  loading: boolean;
  error: string | null;
  matchScore: number | null;
}

export const ResumeForge = () => {
  const { user } = useAuth();
  const [state, setState] = useState<TailorState>({
    jobDescription: '',
    resumeText: `John Smith
Salt Lake City, Utah | 111-111-1111 | john@email.com | linkedin.com/in/johnsmith | github.com/johnsmith

PROFESSIONAL SUMMARY
Versatile full-stack developer with 5+ years of experience in designing and delivering scalable web applications. Proficient in React, Node.js, and cloud technologies with a strong track record of collaborating with cross-functional teams.

TECHNICAL SKILLS
Languages: JavaScript, Python, SQL, HTML, CSS, TypeScript
Frameworks: React, Node.js, Django, Express.js
Cloud & DevOps: AWS, Docker, Kubernetes, Git
Databases: PostgreSQL, MongoDB, Firebase

EXPERIENCE
Software Developer | Tech Company 1 | August 2021 – Present
- Led development of microservices architecture serving 100K+ daily users
- Reduced API response time by 40% through optimization and caching strategies
- Mentored 3 junior developers and contributed to code review process

Senior Developer | Tech Company 2 | July 2016 – March 2020
- Architected full-stack solution for real-time data processing platform
- Implemented CI/CD pipeline reducing deployment time by 60%
- Built RESTful APIs handling 50K requests per day with 99.9% uptime

EDUCATION
MS in Computer Science | University of Utah | GPA: 3.86 | January 2021 – December 2023
BS in Computer Science and Engineering | University of Utah | GPA: 3.75 | August 2012 – May 2016

PROJECTS
Real-time Chat Application | Nov 2023 | React, Node.js, PostgreSQL
- Built scalable messaging platform with WebSocket support for real-time communication
- Implemented user authentication and encryption for message privacy
- Deployed on AWS with auto-scaling capabilities

CERTIFICATIONS
AWS Solutions Architect Associate | Amazon | November 2023
IBM Full Stack Software Developer | IBM | November 2023`,
    tailoredResume: null,
    loading: false,
    error: null,
    matchScore: null,
  });

  const handleTailorResume = async () => {
    if (!state.jobDescription.trim() || !state.resumeText.trim()) {
      setState((prev) => ({
        ...prev,
        error: 'Please provide both job description and resume',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      matchScore: null,
    }));

    try {
      const token = localStorage.getItem('koutuhal_token');

      const response = await fetch('/api/v1/ai/tailor-resume-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          resume_content: state.resumeText,
          job_description: state.jobDescription,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `API error: ${response.status}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        tailoredResume: data.tailored_resume || '',
        matchScore: data.match_score || 75,
        loading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to tailor resume. Please check your inputs and try again.',
      }));
    }
  };

  const handleResumeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setState((prev) => ({
        ...prev,
        resumeText: text,
      }));
    };
    reader.readAsText(file);
  };

  const showResumePreview = state.tailoredResume || !state.jobDescription;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resume Tailor</h1>
          <p className="text-gray-400">
            Optimize your resume for any job in seconds. AI-powered tailoring meets ATS standards.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Resume Input */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">1. Your Resume</h2>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Paste your resume or upload a text file:
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleResumeFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-[#ADFF44] transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Click to upload or paste below
                  </label>
                </div>

                <textarea
                  value={state.resumeText}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      resumeText: e.target.value,
                    }))
                  }
                  className="w-full h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:border-[#ADFF44] focus:outline-none"
                />
              </div>
            </div>

            {/* Job Description Input */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">2. Job Description</h2>

              <textarea
                value={state.jobDescription}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    jobDescription: e.target.value,
                  }))
                }
                className="w-full h-48 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:border-[#ADFF44] focus:outline-none"
              />
            </div>

            {/* Error Message */}
            {state.error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{state.error}</p>
              </div>
            )}

            {/* Tailor Button */}
            <Button
              onClick={handleTailorResume}
              disabled={state.loading || !state.jobDescription || !state.resumeText}
              className="w-full bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {state.loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tailoring Resume...
                </>
              ) : (
                <>
                  <span>Tailor Resume</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Preview Section */}
          <div className="space-y-4">
            {state.tailoredResume && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">ATS Match Score</h3>
                  <div className="text-2xl font-bold text-[#ADFF44]">{state.matchScore}%</div>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ADFF44] transition-all duration-500"
                    style={{ width: `${state.matchScore || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {state.matchScore && state.matchScore >= 80
                    ? '✓ Excellent match - High chances of ATS pass'
                    : state.matchScore && state.matchScore >= 60
                      ? '△ Good match - Consider adding more relevant keywords'
                      : '✗ Low match - Add more relevant skills'}
                </p>
              </div>
            )}

            {/* Resume Preview */}
            <div className="bg-white text-black rounded-lg overflow-hidden max-h-[800px] overflow-y-auto shadow-2xl border border-neutral-700">
              {state.tailoredResume ? (
                <div className="p-6 text-xs space-y-2" style={{ fontFamily: 'Calibri, Arial, sans-serif', lineHeight: '1.4' }}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {state.tailoredResume}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-4">
                  <FileText className="w-12 h-12 opacity-50" />
                  <p className="text-sm">Resume preview will appear here after tailoring</p>
                </div>
              )}
            </div>

            {/* Download Button */}
            {state.tailoredResume && (
              <Button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([state.tailoredResume], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = 'tailored_resume.txt';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Tailored Resume
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeForge;
