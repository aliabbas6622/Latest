import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutGrid,
    Users,
    BookOpen,
    Globe,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight,
    Activity,
    Server,
    Database,
    Cpu
} from 'lucide-react';
import Layout from '../components/Layout';
import { analysisService } from '../services/analysisService';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const SuperAdminAnalysis = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // hitData is now provided by the stats object from analysisService

    useEffect(() => {
        const load = async () => {
            try {
                const data = await analysisService.getGlobalAnalytics();
                setStats(data);
            } catch (err) {
                console.error('Failed to load global analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium font-inter">Synchronizing global data nodes...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                            Global <span className="text-teal-600">Console</span>
                        </h1>
                        <p className="text-lg text-slate-500 mt-4 max-w-2xl font-medium leading-relaxed">Macro-level monitoring of the entire preparation ecosystem. Overseeing institutions, traffic, and content health.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-teal-50 px-4 py-2 rounded-2x border border-teal-100/50">
                        <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Live Telemetry Active</span>
                    </div>
                </div>

                {/* Macro KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Institutes</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.instituteCount}</p>
                                <span className="text-teal-500 text-[10px] font-black mb-1 flex items-center"><TrendingUp size={12} /> +1</span>
                            </div>
                        </div>
                        <Globe size={100} className="absolute -right-8 -bottom-8 text-slate-50 group-hover:text-teal-50/50 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Population</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.studentCount}</p>
                                <span className="text-teal-500 text-[10px] font-black mb-1 flex items-center"><TrendingUp size={12} /> +12%</span>
                            </div>
                        </div>
                        <Users size={100} className="absolute -right-8 -bottom-8 text-slate-50 group-hover:text-teal-50/50 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Knowledge Assets</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-slate-800 tracking-tight">{stats.questionCount}</p>
                                <span className="text-amber-500 text-[10px] font-black mb-1 uppercase tracking-widest">MCQs</span>
                            </div>
                        </div>
                        <BookOpen size={100} className="absolute -right-8 -bottom-8 text-slate-50 group-hover:text-teal-50/50 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-teal-600 p-7 rounded-[2rem] shadow-lg shadow-teal-600/10 relative overflow-hidden group">
                        <div className="relative z-10 text-white">
                            <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest mb-1">Global Accuracy</p>
                            <div className="flex items-end gap-3">
                                <p className="text-4xl font-black text-white tracking-tight">{stats.globalAccuracy}%</p>
                                <div className="mb-2 h-1.5 w-16 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full" style={{ width: `${stats.globalAccuracy}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <ShieldCheck size={100} className="absolute -right-8 -bottom-8 text-white/10" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Global Activity Chart */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 leading-tight">System Traffic</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest leading-tight">Requests per hour (24H cycle)</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-100/50 italic">Peak Load</span>
                            </div>
                        </div>
                        <div className="h-[250px] w-full mt-4 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={stats?.hitData || []}>
                                    <defs>
                                        <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.08} />
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                        itemStyle={{ fontWeight: 800, color: '#0d9488' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="hits"
                                        stroke="#0d9488"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* System Health Panel */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <Activity className="text-teal-600" size={20} /> System Vitality
                            </h3>

                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-teal-200 transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <Server size={14} className="text-teal-600" /> Database
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic animate-pulse">Stable</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 tracking-tight">99.98%</p>
                                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-[99%]" />
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-teal-200 transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <Database size={14} className="text-teal-600" /> Latency
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Fast</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 tracking-tight">124ms</p>
                                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[85%]" />
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-teal-200 transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <Cpu size={14} className="text-teal-600" /> CPU Load
                                        </div>
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Stable</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800 tracking-tight">42%</p>
                                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 w-[42%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Admin Tools */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 relative overflow-hidden group">
                        <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight">Admin Shell</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white hover:shadow-md transition-all group/btn">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/btn:text-teal-600 transition-colors shadow-sm">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm italic">Audit</span>
                                </div>
                                <ArrowUpRight size={16} className="text-slate-300 group-hover/btn:text-teal-600 transition-colors" />
                            </button>
                            <button className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white hover:shadow-md transition-all group/btn">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/btn:text-teal-600 transition-colors shadow-sm">
                                        <Users size={20} />
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm italic">Access</span>
                                </div>
                                <ArrowUpRight size={16} className="text-slate-300 group-hover/btn:text-teal-600 transition-colors" />
                            </button>
                        </div>

                        <div className="mt-8 p-6 bg-teal-50 rounded-3xl border border-teal-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-tight">Security Protocol</p>
                                <p className="text-sm font-bold text-teal-900 leading-snug">All systems running on encrypted nodes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SuperAdminAnalysis;
