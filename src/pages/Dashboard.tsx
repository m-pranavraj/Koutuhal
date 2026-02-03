import {
  User,
  Target,
  Users,
  Briefcase,
  Gift,
  Package,
  Calendar,
  Star,
  Clock,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DashboardCard } from '@/components/cards/DashboardCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const dashboardItems = [
  {
    icon: User,
    title: 'Edit Profile',
    description: 'Update your profile details, work experience and education here.',
    buttonText: 'Edit Profile',
  },
  {
    icon: Target,
    title: 'Set Career Goals',
    description: 'Set your career goals and preferences to get personalized expert matches.',
    buttonText: 'Set Career Goals',
  },
  {
    icon: Users,
    title: 'Discover Experts',
    description: 'Find experts based on your interests. Set career goals first for better matches.',
    buttonText: 'Discover Experts',
  },
  {
    icon: Briefcase,
    title: 'Job Applications',
    description: 'Track your job applications and their current status in one place.',
    buttonText: 'Job Applications',
  },
  {
    icon: Gift,
    title: 'Refer & Earn',
    description: 'Invite friends and colleagues to earn free guidance calls and SuperDMs.',
    buttonText: 'Refer & Earn',
  },
  {
    icon: Package,
    title: 'Add Offerings',
    description: 'Define the topics you guide on, set fee, and customize details.',
    buttonText: 'Add Offerings',
  },
  {
    icon: Calendar,
    title: 'My Bookings',
    description: 'View and manage your upcoming and past DMs and calls.',
    buttonText: 'My Bookings',
  },
  {
    icon: Star,
    title: 'My Reviews',
    description: 'See reviews from seekers and build credibility with verified reviews.',
    buttonText: 'My Reviews',
  },
  {
    icon: Clock,
    title: 'Set Availability',
    description: 'Manage your schedule and availability for 1:1 guidance sessions.',
    buttonText: 'Set Availability',
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Dashboard Header */}
      <section className="border-b bg-white py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="flex justify-center">
              <TabsList className="h-12 p-1">
                <TabsTrigger
                  value="dashboard"
                  className="px-8 py-2 data-[state=active]:gradient-primary data-[state=active]:text-white"
                >
                  My Dashboard
                </TabsTrigger>
                <TabsTrigger value="profile" className="px-8 py-2">
                  Profile
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dashboardItems.map((item) => (
                  <DashboardCard
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    buttonText={item.buttonText}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-8">
              <div className="mx-auto max-w-2xl rounded-xl border bg-card p-8">
                <div className="mb-8 flex flex-col items-center">
                  <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-primary to-purple-500">
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                      U
                    </div>
                  </div>
                  <h2 className="text-xl font-bold">User Profile</h2>
                  <p className="text-muted-foreground">@username</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">Complete Onboarding</h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Complete your profile to get the most out of Koutuhal
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 gradient-primary" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Button variant="outline" className="justify-start gap-2">
                      <User className="h-4 w-4" />
                      My Dashboard
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Briefcase className="h-4 w-4" />
                      Resume
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Users className="h-4 w-4" />
                      Chat with Experts
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Target className="h-4 w-4" />
                      Discover Experts
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Gift className="h-4 w-4" />
                      Refer & Earn
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 text-red-500 hover:text-red-600"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
