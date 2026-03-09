import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Briefcase, Calendar, TrendingUp, GraduationCap, Building2, Award } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, interviews: 0, offers: 0, colleges: 0, orgs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    const [usersRes, jobsRes, appsRes, interviewsRes, offersRes, collegesRes, orgsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }),
      supabase.from("interviews").select("id", { count: "exact", head: true }),
      supabase.from("offers").select("id", { count: "exact", head: true }),
      supabase.from("college_profiles").select("id", { count: "exact", head: true }),
      supabase.from("organization_profiles").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      users: usersRes.count || 0,
      jobs: jobsRes.count || 0,
      applications: appsRes.count || 0,
      interviews: interviewsRes.count || 0,
      offers: offersRes.count || 0,
      colleges: collegesRes.count || 0,
      orgs: orgsRes.count || 0,
    });
    setLoading(false);
  };

  const cards = [
    { label: "Total Users", value: stats.users, icon: <Users className="h-6 w-6" /> },
    { label: "Colleges", value: stats.colleges, icon: <Building2 className="h-6 w-6" /> },
    { label: "Organizations", value: stats.orgs, icon: <Briefcase className="h-6 w-6" /> },
    { label: "Job Listings", value: stats.jobs, icon: <Briefcase className="h-6 w-6" /> },
    { label: "Applications", value: stats.applications, icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Interviews", value: stats.interviews, icon: <Calendar className="h-6 w-6" /> },
    { label: "Offers", value: stats.offers, icon: <Award className="h-6 w-6" /> },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Overview of platform metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="hover:shadow-lg transition-shadow border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <div className="text-primary">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{card.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
