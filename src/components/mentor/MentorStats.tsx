import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Wallet, ArrowUpRight } from "lucide-react";

const data = [
    { name: 'Mon', earnings: 120 },
    { name: 'Tue', earnings: 240 },
    { name: 'Wed', earnings: 180 },
    { name: 'Thu', earnings: 320 },
    { name: 'Fri', earnings: 450 },
    { name: 'Sat', earnings: 520 },
    { name: 'Sun', earnings: 380 },
];

export const MentorStats = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Earnings Overview (Glassmorphic) */}
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ADFF44]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex flex-row items-center justify-between mb-8">
                        <div>
                            <h3 className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-1">Weekly Earnings</h3>
                            <div className="text-5xl font-display font-black text-white tracking-tight">$2,210<span className="text-3xl text-neutral-500">.00</span></div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[#ADFF44]/10 flex items-center justify-center border border-[#ADFF44]/20">
                            <TrendingUp className="h-6 w-6 text-[#ADFF44]" />
                        </div>
                    </div>

                    <div className="h-[250px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ADFF44" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ADFF44" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#ADFF44', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#ADFF44', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#ADFF44"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorEarnings)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex flex-col gap-6">
                {/* Available Payout */}
                <div className="flex-1 bg-black border border-neutral-800 rounded-[2.5rem] p-8 flex items-center justify-between hover:border-[#ADFF44]/30 transition-all group">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-[#ADFF44] flex items-center justify-center shadow-[0_0_30px_rgba(173,255,68,0.3)] group-hover:scale-110 transition-transform">
                            <DollarSign className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <p className="text-neutral-500 font-bold text-sm uppercase mb-1">Available Payout</p>
                            <h3 className="text-4xl font-display font-black text-white">$850.00</h3>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ADFF44]/10 text-[#ADFF44] text-xs font-bold border border-[#ADFF44]/20">
                            Ready to Withdraw
                        </span>
                    </div>
                </div>

                {/* Projected */}
                <div className="flex-1 bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 rounded-[2.5rem] p-8 flex items-center justify-between hover:border-white/20 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-neutral-500 font-bold text-sm uppercase mb-1">Projected (This Month)</p>
                            <h3 className="text-4xl font-display font-black text-white">$4,500.00</h3>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="flex items-center text-[#ADFF44] font-bold text-lg">
                            <ArrowUpRight className="w-5 h-5 mr-1" /> 12%
                        </span>
                        <span className="text-neutral-500 text-xs">vs last month</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
