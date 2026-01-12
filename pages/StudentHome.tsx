import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '../services/notificationService';
import { studentService } from '../services/studentService';
import {
    BookOpen,
    Zap,
    ArrowRight,
    Flame,
    Sparkles,
    Clock,
    ChevronRight,
    Bell,
    X,
    Trophy,
    CheckCircle2
} from 'lucide-react';

const StudentHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
    const [showBanner, setShowBanner] = useState(true);
    const [streakData, setStreakData] = useState<any>(null);
    const [todayProgress, setTodayProgress] = useState<any>(null);
    const [latestContent, setLatestContent] = useState<{ sets: any[], questions: any[] }>({ sets: [], questions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomeData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [notifs, sData, tProgress, content] = await Promise.all([
                    notificationService.getNotifications(user.id),
                    studentService.getStreakData(user.id),
                    studentService.getTodayProgress(user.id),
                    studentService.getLatestContent()
                ]);

                const studentNotifs = notifs.filter(n => (n.target_role === 'STUDENT' || n.target_role === 'ALL') && !n.is_read);
                if (studentNotifs.length > 0) setLatestNotification(studentNotifs[0]);

                setStreakData(sData);
                setTodayProgress(tProgress);
                setLatestContent(content);
            } catch (err) {
                console.error("Error loading home data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, [user]);

    // Automatic Timezone Sync
    useEffect(() => {
        if (user && streakData) {
            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // The streakData object now includes profiles join with timezone
            if (streakData.profiles?.timezone !== detectedTz) {
                studentService.updateUserTimezone(user.id, detectedTz).catch(console.error);
            }
        }
    }, [user, streakData]);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24">

                {/* 1. Global Integrated Announcement */}
                <AnimatePresence>
                    {showBanner && latestNotification && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <div className="bg-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-xl shadow-indigo-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">New Broadcast</span>
                                        <p className="text-sm font-bold leading-tight">{latestNotification.message}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (latestNotification && user) {
                                            await notificationService.markAsRead(user.id, latestNotification.id);
                                        }
                                        setShowBanner(false);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. Personalized Hero Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            Welcome, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">Ready to sharpen your skills today?</p>
                    </motion.div>

                    {/* Streak Spark Pill */}
                    {streakData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white px-6 py-4 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-4 group hover:shadow-xl transition-all duration-500 cursor-pointer"
                            onClick={() => navigate('/student/analysis')}
                        >
                            <div className={`p-3 rounded-2xl ${todayProgress?.is_streak_day ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Flame className={`w-8 h-8 ${todayProgress?.is_streak_day ? 'fill-orange-600 animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900">{streakData.current_streak} Day Streak</div>
                                <div className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                    {todayProgress?.is_streak_day ? (
                                        <><CheckCircle2 className="w-3 h-3 text-green-500" /> Goal met today</>
                                    ) : (
                                        <><Clock className="w-3 h-3" /> {Math.max(0, (streakData.threshold || 5) - (todayProgress?.attempt_count || 0))} more to keep it</>
                                    )}
                                </div>
                            </div>
                            <div className="ml-2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* 3. Main Modes (Redesigned) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Understand Mode */}
                    <motion.button
                        whileHover={{ y: -10 }}
                        onClick={() => navigate('/student/understand/topics')}
                        className="relative group bg-slate-900 p-1 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 opacity-50"></div>
                        <div className="relative bg-white p-10 rounded-[2.3rem] h-full text-left">
                            <div className="flex justify-between items-start mb-12">
                                <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <BookOpen className="w-10 h-10" />
                                </div>
                                <Sparkles className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Understand</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                                Master key concepts through curated theory, visual aids, and solved logic.
                            </p>
                            <div className="flex items-center gap-3 font-black text-emerald-600 uppercase tracking-widest text-sm">
                                Explore Topics <ArrowRight className="group-hover:translate-x-3 transition-transform duration-300" />
                            </div>
                        </div>
                    </motion.button>

                    {/* Apply Mode */}
                    <motion.button
                        whileHover={{ y: -10 }}
                        onClick={() => navigate('/student/apply/topics')}
                        className="relative group bg-slate-900 p-1 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 opacity-50"></div>
                        <div className="relative bg-white p-10 rounded-[2.3rem] h-full text-left">
                            <div className="flex justify-between items-start mb-12">
                                <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <Zap className="w-10 h-10" />
                                </div>
                                <Trophy className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Apply</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                                Test your speed and accuracy with real-time feedback and smart analysis.
                            </p>
                            <div className="flex items-center gap-3 font-black text-indigo-600 uppercase tracking-widest text-sm">
                                Start Practice <ArrowRight className="group-hover:translate-x-3 transition-transform duration-300" />
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* 4. "What's New" Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Freshly Added</h2>
                        </div>
                        <Link to="/student/apply/topics" className="text-sm font-bold text-primary-600 hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl"></div>
                            ))
                        ) : (
                            <>
                                {latestContent.sets.map((set: any) => (
                                    <div
                                        key={set.id}
                                        onClick={() => navigate(`/student/apply/set/${set.slug || set.id}`)}
                                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">Practice Set</span>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(set.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-black text-slate-900 text-xl group-hover:text-primary-600 transition-colors mb-2">{set.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{set.topic}</p>
                                        <div className="mt-6 flex items-center gap-2 text-primary-600 font-bold text-xs">
                                            Attempt Now <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}

                                {/* If no sets, show placeholder */}
                                {latestContent.sets.length === 0 && (
                                    <div className="md:col-span-3 bg-slate-50 p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest">No new content recently. Keep practicing existing sets!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default StudentHome;
