import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Target,
    Clock,
    AlertCircle,
    ChevronRight,
    Zap,
    BarChart2,
    ArrowUpRight,
    Search,
    CheckCircle,
    Activity,
    ShieldCheck
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import { Link } from 'react-router-dom';

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

const StudentAnalysis = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'TOPICS' | 'HISTORY'>('TOPICS');

    // Trending data is now coming from the analytics state

    useEffect(() => {
        const load = async () => {
            if (user) {
                try {
                    const data = await studentService.getStudentAnalytics(user.id);
                    setAnalytics(data);
                } catch (err) {
                    console.error('Failed to load analytics:', err);
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
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium font-inter">Crunching your performance data...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const { accuracy, totalAttempts, topics } = analytics || { accuracy: 0, totalAttempts: 0, topics: [] };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Performance <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-600">Analytics</span>
                        </h1>
                        <p className="text-lg text-slate-500 mt-4 max-w-xl">Deep insights into your learning journey and mastery levels. Track your progress across all simulated exams.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>

                {/* KPI Grid & Main Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Weekly Performance</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Accuracy metrics (Last 7 Days)</p>
                            </div>
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={analytics?.trendData || []}>
                                    <defs>
                                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="accuracy"
                                        stroke="#0d9488"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAcc)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Accuracy</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black text-slate-800 tracking-tight">{accuracy}%</p>
                                    <div className="mb-2 bg-teal-50 text-teal-600 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1">
                                        <ArrowUpRight size={12} /> +2.4%
                                    </div>
                                </div>
                                <div className="mt-5 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${accuracy}%` }}></div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Practice</p>
                                <p className="text-5xl font-black text-slate-800 tracking-tight">{totalAttempts}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Simulated attempts</p>
                            </div>
                            <Activity size={100} className="absolute -right-6 -bottom-6 text-slate-50 group-hover:text-teal-50/50 transition-colors" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-teal-600 p-7 rounded-[2rem] shadow-lg shadow-teal-600/10 relative overflow-hidden group"
                        >
                            <div className="relative z-10 text-white">
                                <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest mb-2">Mastery Index</p>
                                <p className="text-5xl font-black text-white tracking-tight">{topics.filter((t: any) => t.accuracy >= 80).length}</p>
                                <p className="text-[10px] text-teal-100/60 font-bold mt-2 uppercase tracking-widest">Topics with 80%+ Accuracy</p>
                            </div>
                            <ShieldCheck size={100} className="absolute -right-6 -bottom-6 text-white/10" />
                        </motion.div>
                    </div>
                </div>

                {/* Tabs & Main Content */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="border-b border-slate-100 px-10 py-4 flex items-center justify-between">
                        <div className="flex gap-10">
                            <button
                                onClick={() => setActiveTab('TOPICS')}
                                className={`text-sm font-black uppercase tracking-widest transition-all relative py-2 ${activeTab === 'TOPICS' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Topic Mastery
                                {activeTab === 'TOPICS' && <motion.div layoutId="tab" className="absolute -bottom-1 left-0 right-0 h-1 bg-teal-600 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('HISTORY')}
                                className={`text-sm font-black uppercase tracking-widest transition-all relative py-2 ${activeTab === 'HISTORY' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Learning Log
                                {activeTab === 'HISTORY' && <motion.div layoutId="tab" className="absolute -bottom-1 left-0 right-0 h-1 bg-teal-600 rounded-full" />}
                            </button>
                        </div>
                        <div className="relative group hidden sm:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search analytics..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-100 w-64"
                            />
                        </div>
                    </div>

                    <div className="p-8">
                        {activeTab === 'TOPICS' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Topics List */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                                        Performance by Topic <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                    </h3>
                                    {topics.length === 0 ? (
                                        <div className="py-20 text-center text-slate-400 italic">
                                            Start practicing to see topic insights!
                                        </div>
                                    ) : (
                                        topics.sort((a: any, b: any) => b.accuracy - a.accuracy).map((topic: any, idx: number) => {
                                            const status = topic.accuracy >= 80 ? 'Mastered' : topic.accuracy >= 50 ? 'Improving' : 'At Risk';
                                            const statusColor = topic.accuracy >= 80 ? 'text-teal-600 bg-teal-50' : topic.accuracy >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-500 bg-red-50';

                                            return (
                                                <div key={idx} className="group p-4 rounded-2xl border border-transparent hover:border-slate-50 hover:bg-slate-50/50 transition-all">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${topic.accuracy >= 80 ? 'bg-teal-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                            <span className="font-extrabold text-slate-800">{topic.name}</span>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${statusColor}`}>
                                                            {status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-2 flex-1 bg-slate-50 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                whileInView={{ width: `${topic.accuracy}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className={`h-full rounded-full ${topic.accuracy >= 80 ? 'bg-teal-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-800 w-10 text-right">
                                                            {topic.accuracy}%
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-4">
                                                        <span>{topic.total} Attempts</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                        <span>{Math.round(topic.total * (topic.accuracy / 100))} Correct</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Insight Card */}
                                <div className="lg:border-l lg:border-slate-100 lg:pl-12">
                                    <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                                        Learning Insights <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-teal-50/50 rounded-3xl border border-teal-100/50">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shrink-0">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-teal-900 text-sm">Key Strength</p>
                                                    <p className="text-teal-700 text-sm mt-1">
                                                        {topics.find((t: any) => t.accuracy >= 80)?.name || "Not enough data yet"}
                                                    </p>
                                                    <p className="text-xs text-teal-600/80 mt-2 leading-relaxed">
                                                        You're excelling here! Consider taking a harder drill to push your limits.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-amber-900 text-sm">Recommended Focus</p>
                                                    <p className="text-amber-700 text-sm mt-1">
                                                        {topics.find((t: any) => t.accuracy < 60)?.name || "You're balanced!"}
                                                    </p>
                                                    <p className="text-xs text-amber-600/80 mt-2 leading-relaxed">
                                                        Your accuracy is dipping here. Spend some time in **Understand Mode** to solidify the foundations.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50 relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <p className="text-xl font-bold text-slate-900 leading-tight">Ready to boost your score?</p>
                                                <p className="text-slate-500 text-sm mt-2 mb-6">Our AI has prepared a custom drill based on your weak areas.</p>
                                                <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center gap-2">
                                                    Start Smart Drill <ArrowUpRight size={16} />
                                                </button>
                                            </div>
                                            <BarChart2 className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-100 opacity-50 group-hover:scale-110 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    Recent Activity <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                                </h3>
                                {(!analytics?.recentAttempts || analytics.recentAttempts.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <Clock size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium italic">No activity recorded yet. Start practicing!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {analytics.recentAttempts.map((attempt: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:border-teal-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${attempt.isCorrect ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-500'}`}>
                                                        {attempt.isCorrect ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{attempt.topic}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {new Date(attempt.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${attempt.isCorrect ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
                                                    {attempt.isCorrect ? 'Success' : 'Incorrect'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentAnalysis;
