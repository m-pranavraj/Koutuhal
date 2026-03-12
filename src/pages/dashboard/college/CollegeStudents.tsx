import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Users, Search, GraduationCap, Mail, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CollegeStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const { data: college } = await supabase.from("college_profiles").select("id").eq("user_id", user!.id).maybeSingle();
      if (!college) { setLoading(false); return; }

      const { data } = await supabase
        .from("student_profiles")
        .select("*, profiles:user_id(full_name, email, avatar_url)")
        .eq("college_id", (college as any).id)
        .order("created_at", { ascending: false });

      if (data) setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const degrees = Array.from(new Set(students.map(s => s.degree).filter(Boolean)));

  const filtered = students.filter(s => {
    const name = s.profiles?.full_name || "";
    const email = s.profiles?.email || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    const matchDegree = degreeFilter === "all" || s.degree === degreeFilter;
    return matchSearch && matchDegree;
  });

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Student Directory</h1>
          <p className="text-neutral-500 mt-2 font-medium">Manage and monitor students registered under your institution.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{students.length} Registered</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or email..."
            className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus-visible:ring-primary/20" 
          />
        </div>
        <Select value={degreeFilter} onValueChange={setDegreeFilter}>
          <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:ring-primary/20">
            <SelectValue placeholder="All Degrees" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10 text-white rounded-xl">
            <SelectItem value="all">All Degrees</SelectItem>
            {degrees.map(d => <SelectItem key={d as string} value={d as string}>{d as string}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card border-white/5 py-20 text-center">
          <Users className="h-16 w-16 mx-auto text-neutral-800 mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">No students found</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">Try adjusting your filters or search terms.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-white/5 shadow-premium group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                      {s.profiles?.avatar_url ? (
                        <img src={s.profiles.avatar_url} alt={s.profiles.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <GraduationCap className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">{s.profiles?.full_name || "Anonymous User"}</h3>
                      <p className="text-xs font-bold text-white/40 flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3" />
                        {s.profiles?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Degree</p>
                      <p className="text-xs font-bold text-white/80">{s.degree || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Branch</p>
                      <p className="text-xs font-bold text-white/80 truncate">{s.branch || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Graduation</p>
                      <p className="text-xs font-bold text-white/80">{s.graduation_year || "N/A"}</p>
                    </div>
                     <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Skills</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">{s.skills?.length || 0} Skills</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" asChild className="w-full justify-between h-10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-xs font-bold border border-white/5 transition-all group/btn">
                    <Link to={`#`}>
                      View Detailed Profile
                      <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegeStudents;

