import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/mockBackend';
import { studentService } from '../services/studentService';
import { University } from '../types';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, MapPin, AlertOctagon, Zap, BookOpen, TrendingUp, Bell, ChevronRight, Info, Target, LayoutGrid } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { StreakWidget } from '../components/StreakWidget';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [universities, setUniversities] = useState<University[]>([]);
    const [stats, setStats] = useState({
        totalAttempts: 0,
        correctAttempts: 0,
        accuracy: 0,
        totalMistakes: 0
    });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [institution, setInstitution] = useState<any>(null);
    const [streakData, setStreakData] = useState<any>(null);
    const [todayProgress, setTodayProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch mock universities for listing
                setUniversities(db.getUniversities());

                if (user) {
                    // Fetch real data from Supabase via studentService
                    const [notifs, analyticData] = await Promise.all([
                        studentService.getActiveNotifications(),
                        studentService.getStudentAnalytics(user.id)
                    ]);

                    setNotifications(notifs);
                    setStats({
                        totalAttempts: analyticData.totalAttempts,
                        correctAttempts: analyticData.correctAttempts,
                        accuracy: analyticData.accuracy,
                        totalMistakes: (analyticData.totalAttempts - analyticData.correctAttempts)
                    });

                    if (user) {
                        const [sData, tProgress] = await Promise.all([
                            studentService.getStreakData(user.id),
                            studentService.getTodayProgress(user.id)
                        ]);
                        setStreakData(sData);
                        setTodayProgress(tProgress);
                    }

                    if (user.institutionId) {
                        const instData = await studentService.getUniversityDetails(user.institutionId);
                        setInstitution(instData);
                    }
                }
            } catch (err) {
                console.error("Dashboard hit a snag:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    // Automatic Timezone Sync
    useEffect(() => {
        if (user && streakData) {
            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // The streakData object now includes profiles join with timezone
            if (streakData.profiles?.timezone !== detectedTz) {
                console.log(`Syncing timezone: ${detectedTz}`);
                studentService.updateUserTimezone(user.id, detectedTz).catch(console.error);
            }
        }
    }, [user, streakData]);

    const isUnlocked = (univ: University) => {
        return user?.institutionId && univ.unlockedForIds.includes(user.institutionId);
    };

    const handleAccess = (univId: string) => {
        navigate(`/student/university/${univId}`);
    };

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row gap-8 min-h-screen pb-20">
                <div className="flex-1 space-y-10">
                    <header className="animate-fade-in">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                            Welcome, <span className="text-primary-600 underline decoration-primary-200 decoration-4 underline-offset-4">{user?.name}</span>
                        </h1>
                        <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
                            Your preparation journey is looking strong. Here's your current overview.
                        </p>
                    </header>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <Link to="/student/analysis" className="group bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">Live Accuracy</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Perfomance Score</p>
                            <p className="text-4xl font-black text-slate-900 mt-1">{stats.accuracy}%</p>
                            <div className="mt-4 flex items-center text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform">
                                Full Analysis <ChevronRight size={14} />
                            </div>
                        </Link>

                        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <BookOpen size={24} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest">Mastery</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Solved Correct</p>
                            <p className="text-4xl font-black text-slate-900 mt-1">
                                {stats.correctAttempts}
                                <span className="text-sm text-slate-300 font-bold ml-2">Total: {stats.totalAttempts}</span>
                            </p>
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.accuracy}%` }}></div>
                            </div>
                        </div>

                        <Link to="/student/mistakes" className="group bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:border-red-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:animate-bounce-short">
                                    <AlertOctagon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-widest">Needs Review</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mistake Log</p>
                            <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalMistakes}</p>
                            <div className="mt-4 flex items-center text-xs font-bold text-red-500 group-hover:translate-x-1 transition-transform">
                                Practice Weak Spots <ChevronRight size={14} />
                            </div>
                        </Link>
                    </div>

                    {/* Announcements Section */}
                    {notifications.length > 0 && (
                        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-primary-100 text-primary-700 rounded-lg">
                                    <Bell size={18} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 font-heading">Recent Broadcasts</h2>
                            </div>
                            <div className="space-y-4">
                                {notifications.map((notif, i) => (
                                    <div key={notif.id} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                            <Bell size={64} className="text-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-white font-black text-lg">{notif.title}</h4>
                                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-primary-100 text-primary-700 rounded-lg">
                                <LayoutGrid size={18} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 font-heading">Available Curriculums</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {universities.map((univ, index) => {
                                const unlocked = isUnlocked(univ);
                                return (
                                    <div
                                        key={univ.id}
                                        className={`relative group rounded-2xl border transition-all duration-500 overflow-hidden ${unlocked
                                            ? 'bg-white border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary-300'
                                            : 'bg-slate-50 border-slate-200 opacity-75'
                                            }`}
                                    >
                                        <div className="h-40 relative overflow-hidden">
                                            <div className={`absolute inset-0 transition-transform duration-1000 group-hover:scale-110 ${unlocked ? 'bg-gradient-to-br from-primary-600 to-teal-800' : 'bg-slate-300'}`}></div>
                                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent">
                                                <h3 className="text-2xl font-black text-white leading-tight">{univ.name}</h3>
                                                <div className="flex items-center text-white/80 text-xs font-bold mt-1 uppercase tracking-widest">
                                                    <MapPin size={12} className="mr-1 text-primary-300" />
                                                    {univ.location}
                                                </div>
                                            </div>
                                            {!unlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                                                    <div className="bg-white/90 p-3 rounded-2xl shadow-xl">
                                                        <Lock className="text-slate-900" size={24} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                                Complete entrance preparation for {univ.name}. Includes specific patterns and historical question data.
                                            </p>

                                            <button
                                                disabled={!unlocked}
                                                onClick={() => handleAccess(univ.id)}
                                                className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 ${unlocked
                                                    ? 'bg-slate-900 text-white hover:bg-primary-600 shadow-lg shadow-slate-900/10 hover:shadow-primary-600/20 active:scale-95'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {unlocked ? (
                                                    <>Start Learning <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" /></>
                                                ) : (
                                                    <>Locked by Administrator</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Personal Details & Institution Info */}
                <div className="w-full lg:w-80 space-y-6">
                    {streakData && todayProgress && (
                        <StreakWidget
                            currentStreak={streakData.current_streak}
                            longestStreak={streakData.longest_streak}
                            attemptCount={todayProgress.attempt_count}
                            threshold={streakData.threshold || 5}
                            isStreakDay={todayProgress.is_streak_day}
                        />
                    )}

                    {institution && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Your Institution</h3>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 mb-3 text-primary-600">
                                    <Zap size={32} fill="currentColor" />
                                </div>
                                <h4 className="font-black text-slate-900">{institution.name}</h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{institution.domain}</span>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={12} />
                                    Active Content
                                </h5>
                                {Object.keys(institution.curriculum || {}).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(institution.curriculum).map(subj => (
                                            <span key={subj} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                                                {subj}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 font-medium italic">General curriculum active.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-primary-600 to-teal-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        <div className="absolute -right-8 -bottom-8 opacity-10 blur-xl">
                            <TrendingUp size={160} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2">Paper Analysis</h3>
                            <p className="text-primary-100 text-xs font-bold leading-relaxed mb-6">
                                Detailed breakdown of your performance across all simulated exams.
                            </p>
                            <Link to="/student/analysis" className="block w-full py-3 bg-white text-primary-700 text-center rounded-xl font-black text-xs hover:bg-primary-50 transition-colors shadow-lg">
                                View Full Report
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;