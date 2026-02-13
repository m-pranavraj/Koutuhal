import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, ShoppingCart, FileText, Bot } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem('koutuhal_token');

            try {
                // Fetch Stats
                const statsRes = await fetch('/api/v1/admin/analytics/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsRes.ok) setStats(await statsRes.json());

                // Fetch Users
                const usersRes = await fetch('/api/v1/admin/users?limit=20', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (usersRes.ok) setUsers(await usersRes.json());

            } catch (error) {
                toast.error("Failed to load admin data");
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            fetchAdminData();
        }
    }, [user]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin text-[#ADFF44]" /></div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 space-y-8 pt-24">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Admin Console</h1>
                <p className="text-zinc-400">System overview and user management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.users} icon={Users} />
                <StatCard title="Orders" value={stats.orders} icon={ShoppingCart} />
                <StatCard title="Files" value={stats.files} icon={FileText} />
                <StatCard title="AI Jobs" value={stats.ai_jobs} icon={Bot} />
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900">
                                <TableHead className="text-zinc-400">Name</TableHead>
                                <TableHead className="text-zinc-400">Email</TableHead>
                                <TableHead className="text-zinc-400">Role</TableHead>
                                <TableHead className="text-zinc-400">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium text-white">{u.name}</TableCell>
                                    <TableCell className="text-zinc-300">{u.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-[#ADFF44]/20 text-[#ADFF44]'}`}>
                                            {u.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{format(new Date(u.created_at), 'PP')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                    <div className="text-2xl font-bold text-white">{value || 0}</div>
                </div>
                <Icon className="h-8 w-8 text-[#ADFF44] opacity-80" />
            </CardContent>
        </Card>
    );
}
