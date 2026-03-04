import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience?: Array<{
    role: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education?: Array<{
    degree: string;
    school: string;
    gpa?: string;
    startDate: string;
    endDate: string;
  }>;
  skills?: {
    [category: string]: string[];
  };
  projects?: Array<{
    name: string;
    technologies: string[];
    date: string;
    bullets: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface ATSResumeProps {
  data: ResumeData;
  onDownload?: () => void;
  isLoading?: boolean;
}

export const ATSResume = ({ data, onDownload, isLoading = false }: ATSResumeProps) => {
  const resumeRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current || !data.name) return;

    // Using window.print() for PDF download
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(resumeRef.current.outerHTML);
      printWindow.document.close();
      printWindow.print();
    }
    onDownload?.();
  };

  const handleDownloadText = () => {
    if (!data.name) return;
    
    let content = `${data.name}\n`;
    if (data.location) content += `${data.location} | `;
    if (data.phone) content += `${data.phone} | `;
    if (data.email) content += `${data.email}`;
    content += '\n\n';

    if (data.summary) {
      content += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;
    }

    if (data.skills) {
      content += `TECHNICAL SKILLS\n`;
      Object.entries(data.skills).forEach(([category, items]) => {
        content += `${category}: ${items.join(', ')}\n`;
      });
      content += '\n';
    }

    if (data.experience) {
      content += `EXPERIENCE\n`;
      data.experience.forEach((exp) => {
        content += `${exp.role} | ${exp.company} | ${exp.startDate} – ${exp.endDate}\n`;
        exp.bullets.forEach((bullet) => {
          content += `- ${bullet}\n`;
        });
        content += '\n';
      });
    }

    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${data.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownload?.();
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      {/* Download Buttons */}
      <div className="flex justify-end gap-3 mb-6 no-print">
        <Button
          onClick={handleDownloadText}
          disabled={isLoading}
          className="bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold"
        >
          Download TXT
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={isLoading}
          className="bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-bold flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* ATS-Optimized Resume */}
      <div
        ref={resumeRef}
        className="max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl"
        style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: '11pt', lineHeight: '1.4' }}
      >
        {/* HEADER - Name & Contact */}
        <div className="mb-4 border-b-2 border-black pb-3">
          <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 2pt 0' }}>
            {data.name}
          </h1>
          <div style={{ fontSize: '9pt', margin: '2pt 0' }}>
            {[
              data.location,
              data.phone,
              data.email && `Mail: ${data.email}`,
              data.website && `Website: ${data.website}`,
              data.linkedin && `LinkedIn: ${data.linkedin}`,
              data.github && `GitHub: ${data.github}`,
            ]
              .filter(Boolean)
              .join(' | ')}
          </div>
        </div>

        {/* PROFESSIONAL SUMMARY */}
        {data.summary && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              PROFESSIONAL SUMMARY
            </h2>
            <p style={{ margin: '4pt 0', fontSize: '10pt' }}>{data.summary}</p>
          </>
        )}

        {/* TECHNICAL SKILLS */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              TECHNICAL SKILLS
            </h2>
            <div style={{ margin: '4pt 0', fontSize: '10pt' }}>
              {Object.entries(data.skills).map(([category, items]) => (
                <div key={category} style={{ marginBottom: '2pt' }}>
                  <strong>{category}:</strong> {items.join(', ')}
                </div>
              ))}
            </div>
          </>
        )}

        {/* EXPERIENCE */}
        {data.experience && data.experience.length > 0 && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              EXPERIENCE
            </h2>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '8pt', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <strong style={{ fontSize: '11pt' }}>{exp.role}</strong>
                    {exp.company && <span> | {exp.company}</span>}
                  </div>
                  <span style={{ fontSize: '10pt' }}>
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                {exp.location && <div style={{ fontSize: '9pt', color: '#555', marginBottom: '2pt' }}>{exp.location}</div>}
                <ul style={{ margin: '2pt 0 0 20pt', paddingLeft: 0, fontSize: '10pt' }}>
                  {exp.bullets.map((bullet, bidx) => (
                    <li key={bidx} style={{ marginBottom: '1pt' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* EDUCATION */}
        {data.education && data.education.length > 0 && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              EDUCATION
            </h2>
            {data.education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '4pt', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt' }}>{edu.degree}</strong>
                  <span style={{ fontSize: '9pt' }}>
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '10pt' }}>{edu.school}</div>
                {edu.gpa && <div style={{ fontSize: '9pt', color: '#555' }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </>
        )}

        {/* PROJECTS */}
        {data.projects && data.projects.length > 0 && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              PROJECTS
            </h2>
            {data.projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10pt' }}>{proj.name}</strong>
                  <span style={{ fontSize: '9pt' }}>{proj.date}</span>
                </div>
                <div style={{ fontSize: '9pt', color: '#555', marginBottom: '2pt', fontStyle: 'italic' }}>
                  {proj.technologies.join(', ')}
                </div>
                <ul style={{ margin: '2pt 0 0 20pt', paddingLeft: 0, fontSize: '10pt' }}>
                  {proj.bullets.map((bullet, bidx) => (
                    <li key={bidx} style={{ marginBottom: '1pt' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications && data.certifications.length > 0 && (
          <>
            <h2
              style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                marginTop: '8pt',
                marginBottom: '4pt',
                borderBottom: '1px solid black',
              }}
            >
              CERTIFICATIONS
            </h2>
            <ul style={{ margin: '0', paddingLeft: '20pt', fontSize: '10pt' }}>
              {data.certifications.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '2pt' }}>
                  <strong>{cert.name}</strong> – {cert.issuer} ({cert.date})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none; }
          body { padding: 0; margin: 0; }
        }
      `}</style>
    </div>
  );
};
