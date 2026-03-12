import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FileText, Upload, Sparkles, Download, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";

// ─── PDF Types & Styles ──────────────────────────────────────────────────

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    location: string;
    bulletPoints: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    location: string;
    cgpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: string[];
  rawText?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 15,
    borderBottom: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000000",
  },
  contact: {
    flexDirection: "row",
    gap: 10,
    fontSize: 9,
    color: "#666666",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 6,
    borderBottom: 0.5,
    borderBottomColor: "#cccccc",
    textTransform: "uppercase",
    color: "#000000",
  },
  summary: {
    lineHeight: 1.4,
    marginBottom: 5,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginBottom: 2,
  },
  jobSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    fontStyle: "italic",
    marginBottom: 4,
    color: "#444444",
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.3,
  },
  skills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skill: {
    backgroundColor: "#f3f4f6",
    padding: "2 5",
    borderRadius: 2,
    fontSize: 8,
  }
});

const ResumePDF = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <View style={styles.contact}>
          <Text>{data.personalInfo.email}</Text>
          <Text>|</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text>|</Text>
          <Text>{data.personalInfo.location}</Text>
        </View>
        {data.personalInfo.links?.length > 0 && (
          <View style={[styles.contact, { marginTop: 2 }]}>
            {data.personalInfo.links.map((link, i) => (
              <Text key={i}>{link}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Summary */}
      <View>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{data.summary}</Text>
      </View>

      {/* Experience */}
      <View>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {data.experience.map((job, i) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={styles.jobHeader}>
              <Text>{job.company}</Text>
              <Text>{job.duration}</Text>
            </View>
            <View style={styles.jobSubHeader}>
              <Text>{job.role}</Text>
              <Text>{job.location}</Text>
            </View>
            {job.bulletPoints.map((bp, j) => (
              <View key={j} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{bp}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Education */}
      <View>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu, i) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <View style={styles.jobHeader}>
              <Text>{edu.institution}</Text>
              <Text>{edu.duration}</Text>
            </View>
            <View style={styles.jobSubHeader}>
              <Text>{edu.degree}</Text>
              <Text>{edu.location}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View>
        <Text style={styles.sectionTitle}>Technical Skills</Text>
        <Text style={{ lineHeight: 1.4 }}>{data.skills.join(", ")}</Text>
      </View>

      {/* Projects */}
      {data.projects?.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>{proj.name}</Text>
              <Text style={styles.summary}>{proj.description}</Text>
              <Text style={{ fontSize: 8, color: "#666666" }}>Tech: {proj.technologies.join(", ")}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <Text style={{ lineHeight: 1.4 }}>{data.certifications.join(", ")}</Text>
        </View>
      )}
    </Page>
  </Document>
);

const ResumeTailor = () => {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [tailoredData, setTailoredData] = useState<ResumeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTailor = async () => {
    if (!jd.trim() || !resumeText.trim()) {
      toast({ title: "Please provide both a job description and your resume", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Use the FastAPI backend endpoint instead of Supabase Edge Function
      const token = localStorage.getItem("koutuhal_token") || "";
      const res = await fetch("/api/v1/ai/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ jobDescription: jd, resumeText }),
      });

      if (!res.ok) {
        throw new Error("Failed to tailor resume. Ensure backend is running.");
      }

      const data = await res.json();
      setTailoredData(data.tailoredResume);
      setIsEditing(false);
      toast({ title: "Resume tailored successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!tailoredData) return;

    try {
      const blob = await pdf(<ResumePDF data={tailoredData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tailored_Resume_${tailoredData.personalInfo.fullName.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">AI Resume Tailor</h1>
        <p className="text-muted-foreground mt-1">
          Paste a job description and your resume — our AI will tailor it for maximum impact.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-primary" /> Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Button onClick={handleTailor} disabled={loading} className="w-full h-12 text-base font-semibold">
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Tailoring...
          </span>
        ) : (
          <span className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Tailor My Resume</span>
        )}
      </Button>

      {tailoredData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-accent" /> Tailored Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-1" /> {isEditing ? "JSON View" : "Structured View"}
                  </Button>
                  <Button size="sm" onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={JSON.stringify(tailoredData, null, 2)}
                  onChange={(e) => {
                    try {
                      setTailoredData(JSON.parse(e.target.value));
                    } catch (err) { }
                  }}
                  rows={20}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="space-y-6 bg-white text-black rounded-lg p-8 shadow-inner border border-gray-200 font-sans">
                  {/* Visual Preview Header */}
                  <div className="border-b-2 border-gray-100 pb-4 text-center">
                    <h2 className="text-2xl font-bold uppercase">{tailoredData.personalInfo.fullName}</h2>
                    <div className="flex justify-center gap-3 text-xs text-gray-500 mt-2">
                      <span>{tailoredData.personalInfo.email}</span>
                      <span>•</span>
                      <span>{tailoredData.personalInfo.phone}</span>
                      <span>•</span>
                      <span>{tailoredData.personalInfo.location}</span>
                    </div>
                  </div>

                  <section>
                    <h3 className="text-sm font-bold uppercase text-blue-800 border-b border-gray-200 mb-2">Summary</h3>
                    <p className="text-sm leading-relaxed">{tailoredData.summary}</p>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase text-blue-800 border-b border-gray-200 mb-2">Experience</h3>
                    {tailoredData.experience.map((job, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between font-bold text-sm">
                          <span>{job.company}</span>
                          <span>{job.duration}</span>
                        </div>
                        <div className="flex justify-between italic text-xs text-gray-600">
                          <span>{job.role}</span>
                          <span>{job.location}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 mt-2 text-sm space-y-1">
                          {job.bulletPoints.map((bp, bidx) => (
                            <li key={bidx}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase text-blue-800 border-b border-gray-200 mb-2">Education</h3>
                    {tailoredData.education.map((edu, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between font-bold text-sm">
                          <span>{edu.institution}</span>
                          <span>{edu.duration}</span>
                        </div>
                        <div className="text-xs">{edu.degree} — {edu.location} {edu.cgpa ? `(CGPA: ${edu.cgpa})` : ""}</div>
                      </div>
                    ))}
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase text-blue-800 border-b border-gray-200 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {tailoredData.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeTailor;
