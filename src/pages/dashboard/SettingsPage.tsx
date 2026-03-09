import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap, Building2, Upload, Plus, Trash2, Linkedin, Loader2, Star } from "lucide-react";

const SettingsPage = () => {
  const { user, roles, profile } = useAuth();
  const { toast } = useToast();
  const primaryRole = roles[0] || "student";

  const [profileForm, setProfileForm] = useState({ full_name: "", email: "", bio: "", phone: "", location: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Student
  const [studentForm, setStudentForm] = useState({ headline: "", skills: "", linkedin_url: "", github_url: "", portfolio_url: "", college_name: "", degree: "", branch: "", graduation_year: "" });
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);

  // Org
  const [orgForm, setOrgForm] = useState({ company_name: "", industry: "", website: "", description: "", location: "", company_size: "" });

  // College
  const [collegeForm, setCollegeForm] = useState({ college_name: "", location: "", website: "", description: "", contact_email: "", contact_phone: "" });

  // Mentor
  const [mentorForm, setMentorForm] = useState({ headline: "", expertise: "", qualifications: "", years_experience: "", session_type: "free", hourly_rate: "", currency: "USD", linkedin_url: "" });
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
    if (p) setProfileForm({ full_name: p.full_name || "", email: p.email || "", bio: p.bio || "", phone: p.phone || "", location: p.location || "" });

    if (primaryRole === "student") {
      const { data: sp } = await supabase.from("student_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (sp) {
        setStudentForm({
          headline: sp.headline || "", skills: sp.skills?.join(", ") || "",
          linkedin_url: sp.linkedin_url || "", github_url: sp.github_url || "", portfolio_url: sp.portfolio_url || "",
          college_name: sp.college_name || "", degree: sp.degree || "", branch: sp.branch || "",
          graduation_year: sp.graduation_year?.toString() || "",
        });
        setEducation(Array.isArray(sp.education) ? sp.education : []);
        setExperience(Array.isArray(sp.experience) ? sp.experience : []);
      }
    } else if (primaryRole === "organization") {
      const { data: op } = await supabase.from("organization_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (op) setOrgForm({ company_name: op.company_name || "", industry: op.industry || "", website: op.website || "", description: op.description || "", location: op.location || "", company_size: op.company_size || "" });
    } else if (primaryRole === "college") {
      const { data: cp } = await supabase.from("college_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (cp) setCollegeForm({ college_name: cp.college_name || "", location: cp.location || "", website: cp.website || "", description: cp.description || "", contact_email: cp.contact_email || "", contact_phone: cp.contact_phone || "" });
    } else if (primaryRole === "mentor") {
      const { data: mp } = await supabase.from("mentor_profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (mp) {
        setMentorForm({
          headline: mp.headline || "", expertise: mp.expertise?.join(", ") || "",
          qualifications: mp.qualifications || "", years_experience: mp.years_experience?.toString() || "",
          session_type: mp.session_type || "free", hourly_rate: mp.hourly_rate?.toString() || "",
          currency: mp.currency || "USD", linkedin_url: mp.linkedin_url || "",
        });
      }
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user!.id}/avatar.${ext}`;
        await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
      await supabase.from("profiles").update({ ...profileForm, avatar_url }).eq("user_id", user!.id);

      if (primaryRole === "student") {
        await supabase.from("student_profiles").update({
          headline: studentForm.headline, skills: studentForm.skills ? studentForm.skills.split(",").map(s => s.trim()) : [],
          linkedin_url: studentForm.linkedin_url || null, github_url: studentForm.github_url || null, portfolio_url: studentForm.portfolio_url || null,
          college_name: studentForm.college_name || null, degree: studentForm.degree || null, branch: studentForm.branch || null,
          graduation_year: studentForm.graduation_year ? parseInt(studentForm.graduation_year) : null,
          education, experience,
        }).eq("user_id", user!.id);
      } else if (primaryRole === "organization") {
        await supabase.from("organization_profiles").update({
          company_name: orgForm.company_name, industry: orgForm.industry || null, website: orgForm.website || null,
          description: orgForm.description || null, location: orgForm.location || null, company_size: orgForm.company_size || null,
        }).eq("user_id", user!.id);
      } else if (primaryRole === "college") {
        await supabase.from("college_profiles").update({
          college_name: collegeForm.college_name, location: collegeForm.location || null, website: collegeForm.website || null,
          description: collegeForm.description || null, contact_email: collegeForm.contact_email || null, contact_phone: collegeForm.contact_phone || null,
        }).eq("user_id", user!.id);
      } else if (primaryRole === "mentor") {
        await supabase.from("mentor_profiles").update({
          headline: mentorForm.headline || null,
          expertise: mentorForm.expertise ? mentorForm.expertise.split(",").map(s => s.trim()) : [],
          qualifications: mentorForm.qualifications || null,
          years_experience: mentorForm.years_experience ? parseInt(mentorForm.years_experience) : null,
          session_type: mentorForm.session_type as any,
          hourly_rate: mentorForm.hourly_rate ? parseFloat(mentorForm.hourly_rate) : 0,
          currency: mentorForm.currency || "USD",
          linkedin_url: mentorForm.linkedin_url || null,
        }).eq("user_id", user!.id);
      }
      toast({ title: "Profile saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const addEducation = () => setEducation([...education, { institution: "", degree: "", field: "", year: "" }]);
  const addExperience = () => setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, key: string, val: string) => setEducation(education.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  const updateExperience = (i: number, key: string, val: string) => setExperience(experience.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  const importFromLinkedin = async () => {
    if (!linkedinUrl) {
      toast({ title: "Please enter your LinkedIn URL", variant: "destructive" });
      return;
    }
    setImportingLinkedin(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-linkedin", {
        body: { linkedin_url: linkedinUrl },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Import failed");

      const d = data.data;
      setMentorForm((prev) => ({
        ...prev,
        headline: d.headline || prev.headline,
        expertise: d.expertise?.join(", ") || prev.expertise,
        qualifications: d.qualifications || prev.qualifications,
        years_experience: d.years_experience?.toString() || prev.years_experience,
        linkedin_url: d.linkedin_url || linkedinUrl,
      }));
      if (d.full_name) setProfileForm((prev) => ({ ...prev, full_name: d.full_name }));
      if (d.bio) setProfileForm((prev) => ({ ...prev, bio: d.bio }));

      toast({ title: "Profile imported from LinkedIn! âœ¨", description: "Review the data and save." });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImportingLinkedin(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1.5" /> General</TabsTrigger>
          {primaryRole === "student" && <TabsTrigger value="student"><GraduationCap className="h-4 w-4 mr-1.5" /> Student</TabsTrigger>}
          {primaryRole === "organization" && <TabsTrigger value="org"><Briefcase className="h-4 w-4 mr-1.5" /> Organization</TabsTrigger>}
          {primaryRole === "college" && <TabsTrigger value="college"><Building2 className="h-4 w-4 mr-1.5" /> College</TabsTrigger>}
          {primaryRole === "mentor" && <TabsTrigger value="mentor"><Star className="h-4 w-4 mr-1.5" /> Mentor</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border">
              <CardHeader><CardTitle>General Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{profileForm.full_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Upload className="h-4 w-4" /> Upload Photo
                    </Label>
                    <input id="avatar" type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                    {avatarFile && <p className="text-xs text-muted-foreground mt-1">{avatarFile.name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={profileForm.full_name} onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>Location</Label><Input value={profileForm.location} onChange={(e) => setProfileForm(p => ({ ...p, location: e.target.value }))} /></div>
                </div>
                <div><Label>Bio</Label><Textarea value={profileForm.bio} onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))} rows={4} /></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {primaryRole === "student" && (
          <TabsContent value="student">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="border">
                <CardHeader><CardTitle>Student Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Headline</Label><Input value={studentForm.headline} onChange={(e) => setStudentForm(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. B.Tech CSE Student" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>College Name</Label><Input value={studentForm.college_name} onChange={(e) => setStudentForm(p => ({ ...p, college_name: e.target.value }))} placeholder="e.g. IIT Delhi" /></div>
                    <div><Label>Degree</Label><Input value={studentForm.degree} onChange={(e) => setStudentForm(p => ({ ...p, degree: e.target.value }))} placeholder="e.g. B.Tech" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Branch</Label><Input value={studentForm.branch} onChange={(e) => setStudentForm(p => ({ ...p, branch: e.target.value }))} placeholder="e.g. Computer Science" /></div>
                    <div><Label>Graduation Year</Label><Input type="number" value={studentForm.graduation_year} onChange={(e) => setStudentForm(p => ({ ...p, graduation_year: e.target.value }))} placeholder="2026" /></div>
                  </div>
                  <div><Label>Skills (comma-separated)</Label><Input value={studentForm.skills} onChange={(e) => setStudentForm(p => ({ ...p, skills: e.target.value }))} placeholder="React, Python, ML" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>LinkedIn</Label><Input value={studentForm.linkedin_url} onChange={(e) => setStudentForm(p => ({ ...p, linkedin_url: e.target.value }))} /></div>
                    <div><Label>GitHub</Label><Input value={studentForm.github_url} onChange={(e) => setStudentForm(p => ({ ...p, github_url: e.target.value }))} /></div>
                    <div><Label>Portfolio</Label><Input value={studentForm.portfolio_url} onChange={(e) => setStudentForm(p => ({ ...p, portfolio_url: e.target.value }))} /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  <Button size="sm" variant="outline" onClick={addEducation}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((ed, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3 items-end border rounded-lg p-3">
                      <div><Label className="text-xs">Institution</Label><Input value={ed.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} /></div>
                      <div><Label className="text-xs">Degree</Label><Input value={ed.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} /></div>
                      <div><Label className="text-xs">Field</Label><Input value={ed.field} onChange={(e) => updateEducation(i, "field", e.target.value)} /></div>
                      <div className="flex gap-2">
                        <div className="flex-1"><Label className="text-xs">Year</Label><Input value={ed.year} onChange={(e) => updateEducation(i, "year", e.target.value)} /></div>
                        <Button size="icon" variant="ghost" className="text-destructive mt-5" onClick={() => removeEducation(i)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {education.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No education added yet.</p>}
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Experience</CardTitle>
                  <Button size="sm" variant="outline" onClick={addExperience}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experience.map((exp, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div><Label className="text-xs">Company</Label><Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} /></div>
                        <div><Label className="text-xs">Role</Label><Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} /></div>
                        <div className="flex gap-2">
                          <div className="flex-1"><Label className="text-xs">Duration</Label><Input value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} /></div>
                          <Button size="icon" variant="ghost" className="text-destructive mt-5" onClick={() => removeExperience(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div><Label className="text-xs">Description</Label><Textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2} /></div>
                    </div>
                  ))}
                  {experience.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        )}

        {primaryRole === "organization" && (
          <TabsContent value="org">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border">
                <CardHeader><CardTitle>Organization Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Company Name</Label><Input value={orgForm.company_name} onChange={(e) => setOrgForm(p => ({ ...p, company_name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Industry</Label><Input value={orgForm.industry} onChange={(e) => setOrgForm(p => ({ ...p, industry: e.target.value }))} /></div>
                    <div><Label>Website</Label><Input value={orgForm.website} onChange={(e) => setOrgForm(p => ({ ...p, website: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Location</Label><Input value={orgForm.location} onChange={(e) => setOrgForm(p => ({ ...p, location: e.target.value }))} /></div>
                    <div><Label>Company Size</Label><Input value={orgForm.company_size} onChange={(e) => setOrgForm(p => ({ ...p, company_size: e.target.value }))} placeholder="e.g. 50-100" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={orgForm.description} onChange={(e) => setOrgForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        )}

        {primaryRole === "college" && (
          <TabsContent value="college">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border">
                <CardHeader><CardTitle>College Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>College Name</Label><Input value={collegeForm.college_name} onChange={(e) => setCollegeForm(p => ({ ...p, college_name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Location</Label><Input value={collegeForm.location} onChange={(e) => setCollegeForm(p => ({ ...p, location: e.target.value }))} /></div>
                    <div><Label>Website</Label><Input value={collegeForm.website} onChange={(e) => setCollegeForm(p => ({ ...p, website: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Contact Email</Label><Input value={collegeForm.contact_email} onChange={(e) => setCollegeForm(p => ({ ...p, contact_email: e.target.value }))} /></div>
                    <div><Label>Contact Phone</Label><Input value={collegeForm.contact_phone} onChange={(e) => setCollegeForm(p => ({ ...p, contact_phone: e.target.value }))} /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={collegeForm.description} onChange={(e) => setCollegeForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        )}

        {primaryRole === "mentor" && (
          <TabsContent value="mentor">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* LinkedIn Import */}
              <Card className="border border-primary/20 bg-primary/5">
                <CardHeader><CardTitle className="flex items-center gap-2"><Linkedin className="h-5 w-5" /> Import from LinkedIn</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="flex-1"
                    />
                    <Button onClick={importFromLinkedin} disabled={importingLinkedin}>
                      {importingLinkedin ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</> : "Import"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Paste your LinkedIn URL and we'll auto-fill your mentor profile using AI.
                  </p>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader><CardTitle>Mentor Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Headline</Label><Input value={mentorForm.headline} onChange={(e) => setMentorForm(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. Senior Engineer at Google" /></div>
                  <div><Label>Expertise (comma-separated)</Label><Input value={mentorForm.expertise} onChange={(e) => setMentorForm(p => ({ ...p, expertise: e.target.value }))} placeholder="React, System Design, Career Coaching" /></div>
                  <div><Label>Qualifications</Label><Textarea value={mentorForm.qualifications} onChange={(e) => setMentorForm(p => ({ ...p, qualifications: e.target.value }))} rows={3} placeholder="M.S. Computer Science, Stanford University" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Years of Experience</Label><Input type="number" value={mentorForm.years_experience} onChange={(e) => setMentorForm(p => ({ ...p, years_experience: e.target.value }))} /></div>
                    <div><Label>LinkedIn URL</Label><Input value={mentorForm.linkedin_url} onChange={(e) => setMentorForm(p => ({ ...p, linkedin_url: e.target.value }))} /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader><CardTitle>Session Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Session Type</Label>
                    <Select value={mentorForm.session_type} onValueChange={(v) => setMentorForm(p => ({ ...p, session_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {mentorForm.session_type === "paid" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Hourly Rate</Label><Input type="number" value={mentorForm.hourly_rate} onChange={(e) => setMentorForm(p => ({ ...p, hourly_rate: e.target.value }))} placeholder="50" /></div>
                      <div>
                        <Label>Currency</Label>
                        <Select value={mentorForm.currency} onValueChange={(v) => setMentorForm(p => ({ ...p, currency: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (â‚¬)</SelectItem>
                            <SelectItem value="GBP">GBP (Â£)</SelectItem>
                            <SelectItem value="INR">INR (â‚¹)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        )}
      </Tabs>

      <Button onClick={saveProfile} disabled={saving} className="w-full h-12 font-bold">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default SettingsPage;

