import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BarChart,
    AlertTriangle,
    TrendingUp,
    ArrowRight,
    Search,
    Download
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { analysisService } from '../services/analysisService';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const InstitutionAnalysis = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            if (user?.institutionId) {
                try {
                    const data = await analysisService.getInstitutionAnalytics(user.institutionId);
                    setStats(data);
                } catch (err) {
                    console.error('Failed to load institution analytics:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium font-inter">Generating campus report...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!stats) return <Layout><div className="p-12 text-center text-slate-500 font-medium italic">No data available for this institution.</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Institution <span className="text-teal-600">Insights</span></h1>
                        <p className="text-lg text-slate-500 mt-2 font-medium">Campus-wide performance and engagement metrics.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                            <Download size={16} /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                            Apply Filter
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all"
                    >
                        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Students</p>
                        <p className="text-4xl font-black text-slate-800 mt-1 tracking-tight">{stats.totalStudents}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all"
                    >
                        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BarChart size={28} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Accuracy</p>
                        <p className="text-4xl font-black text-slate-800 mt-1 tracking-tight">{stats.averageAccuracy}%</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-teal-600 p-8 rounded-[2.5rem] shadow-lg shadow-teal-600/10 relative overflow-hidden group hover:shadow-xl transition-all"
                    >
                        <div className="relative z-10 text-white">
                            <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest">Questions Attempted</p>
                            <p className="text-4xl font-black text-white mt-1 tracking-tight">{stats.totalAttempts}</p>
                        </div>
                        <TrendingUp size={120} className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform" />
                    </motion.div>
                </div>

                {/* Engagement Trend */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Engagement Trend</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Student activity (Last 7 Days)</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.engagementTrend}>
                                <defs>
                                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.08} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    itemStyle={{ fontWeight: 800, color: '#0d9488' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attempts"
                                    stroke="#0d9488"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAttempts)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Struggling Topics */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <AlertTriangle className="text-amber-500" /> Critical Focus Areas
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {stats.strugglingTopics.length === 0 ? (
                                <p className="text-slate-400 italic py-10 text-center">No critical areas identified yet.</p>
                            ) : (
                                stats.strugglingTopics.map((topic: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl group hover:bg-slate-50 transition-all border border-transparent hover:border-slate-50">
                                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex flex-col items-center justify-center shrink-0">
                                            <span className="text-lg font-black leading-none">{topic.accuracy}%</span>
                                            <span className="text-[8px] font-black uppercase mt-1">Accuracy</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-extrabold text-slate-800 truncate text-lg">{topic.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{topic.count} Student Attempts</p>
                                        </div>
                                        <button className="p-3 text-slate-300 hover:text-teal-600 transition-colors">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="w-full mt-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-md transition-all uppercase tracking-widest text-[10px]">
                            View Full Topic Distribution
                        </button>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
                        <h3 className="text-2xl font-black text-slate-800 mb-10">Real-time Activity</h3>
                        <div className="space-y-4">
                            {stats.recentAttempts.length === 0 ? (
                                <p className="text-slate-400 italic py-10 text-center">Waiting for students to start practicing...</p>
                            ) : (
                                stats.recentAttempts.slice(0, 8).map((attempt: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2.5 h-2.5 rounded-full ${attempt.is_correct ? 'bg-teal-500' : 'bg-red-500'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-none mb-1 group-hover:text-teal-600 transition-colors">
                                                    Anonymous Student <span className="font-medium text-slate-400">attempted</span> {attempt.questions?.topic}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(attempt.submitted_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className={`text-[9px] font-black px-2.5 py-1 rounded-lg tracking-widest uppercase ${attempt.is_correct ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-600'}`}>
                                            {attempt.is_correct ? 'SUCCESS' : 'FAILURE'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default InstitutionAnalysis;
