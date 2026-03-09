import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Users, Search, GraduationCap } from "lucide-react";

const CollegeStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: college } = await supabase.from("college_profiles").select("id, college_name").eq("user_id", user!.id).single();
    if (!college) { setLoading(false); return; }
    // Get students who listed this college name
    const { data } = await supabase
      .from("student_profiles")
      .select("*, profiles:user_id(full_name, email)")
      .eq("college_name", college.college_name);
    if (data) setStudents(data);
    setLoading(false);
  };

  const degrees = [...new Set(students.map(s => s.degree).filter(Boolean))];

  const filtered = students.filter(s => {
    const name = s.profiles?.full_name || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchDegree = degreeFilter === "all" || s.degree === degreeFilter;
    return matchSearch && matchDegree;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">View and manage registered students</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        {degrees.length > 0 && (
          <Select value={degreeFilter} onValueChange={setDegreeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by degree" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              {degrees.map(d => <SelectItem key={d} value={d!}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center border">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No students found.</p>
        </Card>
      ) : (
        <Card className="border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Degree</th>
                    <th className="text-left p-4 font-medium">Branch</th>
                    <th className="text-left p-4 font-medium">Graduation</th>
                    <th className="text-left p-4 font-medium">Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{s.profiles?.full_name || "â€”"}</td>
                      <td className="p-4 text-muted-foreground">{s.profiles?.email || "â€”"}</td>
                      <td className="p-4">{s.degree || "â€”"}</td>
                      <td className="p-4">{s.branch || "â€”"}</td>
                      <td className="p-4">{s.graduation_year || "â€”"}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {s.skills?.slice(0, 3).map((sk: string) => (
                            <Badge key={sk} variant="secondary" className="text-xs">{sk}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="text-sm text-muted-foreground">Total students: {filtered.length}</div>
    </div>
  );
};

export default CollegeStudents;

