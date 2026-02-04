import { Button } from "@/components/ui/button";
import { User, Target, Search, Briefcase, Gift, MessageSquare } from "lucide-react";

const DashboardCard = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <button className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 border border-gray-100 dark:border-slate-800 group w-full h-48">
    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
      <Icon className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
    </div>
    <span className="font-semibold text-slate-700 dark:text-slate-200 text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400">
      {title}
    </span>
  </button>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-8 pt-32">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, Pranav</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your AI learning journey and opportunities.</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-0">
            Complete Profile
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard icon={User} title="Edit Profile" />
          <DashboardCard icon={Target} title="My AI Goals" />
          <DashboardCard icon={Search} title="Discover Mentors" />
          <DashboardCard icon={Briefcase} title="Job Applications" />
          <DashboardCard icon={Gift} title="Refer & Earn" />
          <DashboardCard icon={MessageSquare} title="My Reviews" />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
