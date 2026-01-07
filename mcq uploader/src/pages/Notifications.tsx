import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Send, Bell, Loader2, Trash2, CheckCircle, ShieldAlert, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('STUDENT');
    const [isSending, setIsSending] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await dbService.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSending(true);
        try {
            const { error } = await dbService.createNotification(title, message, targetRole);
            if (error) throw error;

            setTitle('');
            setMessage('');
            load();
        } catch (err: any) {
            alert("Failed to send notification: " + err.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-8">
            <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-textMain tracking-tight">Broadcasting</h2>
                    <p className="text-textSecondary mt-2 text-base md:text-lg">Send announcements to all platform users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Composer */}
                <div className="lg:col-span-5 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-3xl border border-border shadow-soft sticky top-8"
                    >
                        <h3 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Compose Message
                        </h3>
                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">Target Audience</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-bold text-sm transition-all"
                                >
                                    <option value="STUDENT">All Students</option>
                                    <option value="INSTITUTION_ADMIN">All Institution Admins</option>
                                    <option value="ALL">Everyone</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">Headline *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. New Mock Tests Available!"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-medium transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-textSecondary mb-2 uppercase tracking-widest">Message Body *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your announcement here..."
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-medium transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSending || !title || !message}
                                className="w-full py-4 bg-primary hover:bg-primaryHover text-teal-950 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                Broadcast Announcement
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* History */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-textMain flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            Broadcast History
                        </h3>
                        <span className="text-xs font-bold text-teal-800 bg-primary/20 px-3 py-1 rounded-full">{notifications.length} Sent</span>
                    </div>

                    {loading ? (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="font-bold">Fetching history...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <Bell className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold">No announcements sent yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {notifications.map((notif, idx) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white p-6 rounded-2xl border border-border shadow-soft relative group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-primary/20 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded-lg border border-primary/20 uppercase tracking-tighter">
                                                    {notif.target_role}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-textMain mb-2">{notif.title}</h4>
                                        <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">{notif.message}</p>

                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4 text-[10px] font-bold text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Admin Broadcast
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                            <div className="text-teal-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Delivered
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
