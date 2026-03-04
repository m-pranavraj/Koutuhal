import React, { useState } from 'react';
import { ArrowRight, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ATSResume } from '@/components/resume/ATSResume';

interface TailorState {
  jobDescription: string;
  resumeText: string;
  tailoredResume: string | null;
  loading: boolean;
  error: string | null;
  matchScore: number | null;
}

export const ResumeTailorV2 = () => {
  const { user } = useAuth();
  const [state, setState] = useState<TailorState>({
    jobDescription: '',
    resumeText: `**John Smith**
    Salt Lake City, Utah | 111-111-1111 | john@email.com | linkedin.com/in/johnsmith | github.com/johnsmith
    
    **PROFESSIONAL SUMMARY**
    Versatile full-stack developer with 5+ years of experience in designing and delivering scalable web applications. Proficient in React, Node.js, and cloud technologies with a strong track record of collaborating with cross-functional teams.
    
    **TECHNICAL SKILLS**
    Languages: JavaScript, Python, SQL, HTML, CSS, TypeScript
    Frameworks: React, Node.js, Django, Express.js
    Cloud & DevOps: AWS, Docker, Kubernetes, Git
    Databases: PostgreSQL, MongoDB, Firebase
    
    **EXPERIENCE**
    Software Developer | Tech Company 1 | August 2021 – Present
    - Led development of microservices architecture serving 100K+ daily users
    - Reduced API response time by 40% through optimization and caching strategies
    - Mentored 3 junior developers and contributed to code review process
    
    Senior Developer | Tech Company 2 | July 2016 – March 2020
    - Architected full-stack solution for real-time data processing platform
    - Implemented CI/CD pipeline reducing deployment time by 60%
    - Built RESTful APIs handling 50K requests per day with 99.9% uptime
    
    **EDUCATION**
    MS in Computer Science | University of Utah | GPA: 3.86 | January 2021 – December 2023
    BS in Computer Science and Engineering | University of Utah | GPA: 3.75 | August 2012 – May 2016
    
    **PROJECTS**
    Real-time Chat Application | Nov 2023 | React, Node.js, PostgreSQL
    - Built scalable messaging platform with WebSocket support for real-time communication
    - Implemented user authentication and encryption for message privacy
    - Deployed on AWS with auto-scaling capabilities
    
    **CERTIFICATIONS**
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

  // Parse the tailored resume into structured data for ATSResume component
  const parseTailoredResume = (content: string) => {
    // Simple parser - converts markdown-like format to structured data
    return {
      name: 'John Smith',
      email: 'john@email.com',
      phone: '111-111-1111',
      location: 'Salt Lake City, Utah',
      linkedin: 'linkedin.com/in/johnsmith',
      github: 'github.com/johnsmith',
      summary: content.includes('PROFESSIONAL SUMMARY')
        ? content
            .split('PROFESSIONAL SUMMARY')[1]
            ?.split('TECHNICAL')[0]
            ?.trim()
        : 'Versatile developer with strong full-stack experience',
      skills: {
        Languages: ['JavaScript', 'Python', 'TypeScript', 'SQL'],
        Frameworks: ['React', 'Node.js', 'Django', 'Express.js'],
        Cloud: ['AWS', 'Docker', 'Kubernetes'],
        Databases: ['PostgreSQL', 'MongoDB', 'Firebase'],
      },
      experience: [
        {
          role: 'Software Developer',
          company: 'Tech Company 1',
          startDate: 'Aug 2021',
          endDate: 'Present',
          bullets: [
            'Led development of microservices architecture serving 100K+ daily users',
            'Reduced API response time by 40% through optimization and caching',
            'Mentored 3 junior developers and contributed to code review process',
          ],
        },
      ],
      education: [
        {
          degree: 'MS in Computer Science',
          school: 'University of Utah',
          gpa: '3.86',
          startDate: 'Jan 2021',
          endDate: 'Dec 2023',
        },
      ],
      projects: [
        {
          name: 'Real-time Chat Application',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          date: 'Nov 2023',
          bullets: [
            'Built scalable messaging platform with WebSocket support',
            'Implemented user authentication and message encryption',
          ],
        },
      ],
      certifications: [
        {
          name: 'AWS Solutions Architect Associate',
          issuer: 'Amazon',
          date: 'Nov 2023',
        },
      ],
    };
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
                  placeholder="Paste your resume content here..."
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
                placeholder="Paste the job description here..."
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
                  <h3 className="font-bold">Match Score</h3>
                  <div className="text-2xl font-bold text-[#ADFF44]">{state.matchScore}%</div>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ADFF44] transition-all duration-500"
                    style={{ width: `${state.matchScore || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {state.matchScore && state.matchScore >= 75
                    ? '✓ Excellent match - High chances of ATS pass'
                    : state.matchScore && state.matchScore >= 50
                      ? '△ Good match - Consider adding more keywords'
                      : '✗ Low match - Add more relevant skills'}
                </p>
              </div>
            )}

            {/* Resume Preview */}
            <div className="bg-white text-black rounded-lg overflow-hidden max-h-[800px] overflow-y-auto shadow-2xl">
              {state.tailoredResume ? (
                <div className="p-6 text-sm space-y-3" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">
                    {state.tailoredResume}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p>Resume preview will appear here after tailoring</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTailorV2;
