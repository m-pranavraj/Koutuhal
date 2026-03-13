import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GraduationCap, Mail, BookOpen, Award, Clock, FileText } from "lucide-react";

const CollegeStudentProfile = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    acceptedOffers: 0,
  });

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: studentData } = await supabase
        .from("student_profiles")
        .select("id, user_id, degree, branch, graduation_year, skills, college_name")
        .eq("id", studentId as string)
        .maybeSingle();

      if (!studentData) {
        setStudent(null);
        return;
      }

      setStudent(studentData);

      const [profileRes, appsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", studentData.user_id)
          .maybeSingle(),
        supabase
          .from("applications")
          .select("id")
          .eq("student_id", studentData.id),
      ]);

      setProfile(profileRes.data || null);

      const appIds = (appsRes.data || []).map((a: any) => a.id);
      if (appIds.length === 0) {
        setStats({ applications: 0, interviews: 0, offers: 0, acceptedOffers: 0 });
        return;
      }

      const [interviewsRes, offersRes] = await Promise.all([
        supabase.from("interviews").select("id", { count: "exact", head: true }).in("application_id", appIds),
        supabase.from("offers").select("id, status").in("application_id", appIds),
      ]);

      const offers = offersRes.data || [];
      setStats({
        applications: appIds.length,
        interviews: interviewsRes.count || 0,
        offers: offers.length,
        acceptedOffers: offers.filter((o: any) => o.status === "accepted").length,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56 bg-white/5" />
        <Skeleton className="h-44 rounded-3xl bg-white/5" />
        <Skeleton className="h-32 rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 text-white">
          <Link to="/dashboard/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </Button>
        <Card className="glass-card border-white/5 py-14 text-center">
          <CardContent>
            <p className="text-white/70 font-semibold">Student not found or you do not have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 text-white">
        <Link to="/dashboard/students">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
      </Button>

      <Card className="glass-card border-white/5 shadow-premium">
        <CardContent className="p-8">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || "student"} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-white tracking-tight">{profile?.full_name || "Student"}</h1>
              <p className="text-sm text-white/60 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {profile?.email || "No email available"}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-white/10 text-white border-white/10">{student.degree || "No degree"}</Badge>
                <Badge className="bg-white/10 text-white border-white/10">{student.branch || "No branch"}</Badge>
                <Badge className="bg-white/10 text-white border-white/10">Batch {student.graduation_year || "N/A"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="glass-card border-white/5"><CardContent className="p-6"><p className="text-xs text-white/50">Applications</p><p className="text-3xl font-black text-white mt-1">{stats.applications}</p><FileText className="h-4 w-4 text-primary mt-3" /></CardContent></Card>
        <Card className="glass-card border-white/5"><CardContent className="p-6"><p className="text-xs text-white/50">Interviews</p><p className="text-3xl font-black text-white mt-1">{stats.interviews}</p><Clock className="h-4 w-4 text-amber-400 mt-3" /></CardContent></Card>
        <Card className="glass-card border-white/5"><CardContent className="p-6"><p className="text-xs text-white/50">Offers</p><p className="text-3xl font-black text-white mt-1">{stats.offers}</p><BookOpen className="h-4 w-4 text-cyan-400 mt-3" /></CardContent></Card>
        <Card className="glass-card border-white/5"><CardContent className="p-6"><p className="text-xs text-white/50">Accepted Offers</p><p className="text-3xl font-black text-white mt-1">{stats.acceptedOffers}</p><Award className="h-4 w-4 text-emerald-400 mt-3" /></CardContent></Card>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(student.skills || []).length > 0 ? (
              (student.skills || []).map((skill: string) => (
                <Badge key={skill} className="bg-primary/10 text-primary border-primary/20">{skill}</Badge>
              ))
            ) : (
              <p className="text-white/60 text-sm">No skills added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeStudentProfile;
