import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '../services/notificationService';
import PremiumAlert, { AlertType } from '../components/PremiumAlerts';
import { Megaphone, Info, AlertTriangle, Zap as UrgentIcon, X as CloseIcon, ChevronLeft, ChevronRight, BookOpen, Zap, ArrowRight } from 'lucide-react';

const StudentHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const data = await notificationService.getNotifications();
        // Only show student relevant ones or ALL, and pick the latest one
        const studentNotifs = data.filter(n => n.target_role === 'STUDENT' || n.target_role === 'ALL');
        if (studentNotifs.length > 0) {
            setLatestNotification(studentNotifs[0]);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Announcements Banner */}
                {showBanner && latestNotification && (
                    <div className="mb-8">
                        <PremiumAlert
                            type={latestNotification.type as AlertType}
                            title={`${latestNotification.type.toUpperCase()} ANNOUNCEMENT`}
                            description={latestNotification.message}
                            onClose={() => setShowBanner(false)}
                        />
                    </div>
                )}

                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md mx-auto">
                            Choose how you want to learn today.
                        </p>
                    </motion.div>

                    {/* Mode Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
                        {/* Understand Mode Card */}
                        <motion.button
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            onClick={() => navigate('/student/understand/topics')}
                            className="group relative bg-white p-8 md:p-10 rounded-[2rem] border-2 border-slate-200 shadow-sm hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 text-left overflow-hidden"
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50 rounded-full -mr-20 -mt-20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <BookOpen size={32} />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">
                                    Understand
                                </h2>

                                {/* Description */}
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    Learn concepts, study definitions, explore solved examples, and build a strong foundation.
                                </p>

                                {/* CTA */}
                                <div className="flex items-center gap-2 text-primary-600 font-bold group-hover:gap-4 transition-all">
                                    Start Learning
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.button>

                        {/* Apply Mode Card */}
                        <motion.button
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            onClick={() => navigate('/student/apply/topics')}
                            className="group relative bg-white p-8 md:p-10 rounded-[2rem] border-2 border-slate-200 shadow-sm hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 text-left overflow-hidden"
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50 rounded-full -mr-20 -mt-20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <Zap size={32} />
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">
                                    Apply
                                </h2>

                                {/* Description */}
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    Practice questions, test your accuracy, get instant feedback, and track your progress.
                                </p>

                                {/* CTA */}
                                <div className="flex items-center gap-2 text-primary-600 font-bold group-hover:gap-4 transition-all">
                                    Start Practicing
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Subtle hint */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-sm text-slate-400 mt-12 text-center"
                    >
                        You can switch modes anytime from the header toggle.
                    </motion.p>
                </div>
            </div>
        </Layout>
    );
};

export default StudentHome;
