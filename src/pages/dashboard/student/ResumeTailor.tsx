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

// Register fonts for PDF (using standard Helvetica for ATS safety)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333333",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  }
});

// Define the PDF Document Structure
const ResumePDF = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </Page>
  </Document>
);

const ResumeTailor = () => {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
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
      setTailoredResume(data.tailoredResume || "No result received.");
      setIsEditing(false);
      toast({ title: "Resume tailored successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!tailoredResume) return;

    try {
      const blob = await pdf(<ResumePDF content={tailoredResume} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Tailored_Resume_Koutuhal.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
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
                placeholder="Paste the job description here..."
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
                placeholder="Paste your resume content here..."
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

      {tailoredResume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-accent" /> Tailored Resume
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-1" /> {isEditing ? "Preview" : "Edit"}
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={tailoredResume}
                  onChange={(e) => setTailoredResume(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 rounded-lg p-6 text-sm">
                  {tailoredResume}
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
