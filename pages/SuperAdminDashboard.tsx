import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/mockBackend';
import { Institution, InstitutionStatus } from '../types';
import { Check, X, ShieldAlert, CheckCircle, AlertCircle, Search, Building2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Megaphone, Send, Info, AlertTriangle, Zap as UrgentIcon } from 'lucide-react';
import PremiumAlert, { AlertType } from '../components/PremiumAlerts';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [refresh, setRefresh] = useState(0);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'urgent',
        target_role: 'ALL' as 'STUDENT' | 'ADMIN' | 'ALL'
    });

    useEffect(() => {
        if (searchTerm.trim()) {
            setInstitutions(db.searchInstitutions(searchTerm));
        } else {
            setInstitutions(db.getInstitutions());
        }
    }, [refresh, searchTerm]);

    const handleApprove = async (inst: Institution) => {
        if (!user) return;
        try {
            await db.approveInstitution(inst.id, user.role);
            setNotification({
                type: 'success',
                message: `Institution '${inst.name}' approved successfully. An admin account has been created for ${inst.officialEmail} with default password: Password@123`
            });
            setRefresh(p => p + 1);
            // Clear notification after 10 seconds so they have time to copy
            setTimeout(() => setNotification(null), 10000);
        } catch (e: any) {
            setNotification({
                type: 'error',
                message: `Error approving institution: ${e.message}`
            });
        }
    };

    const handleReject = async (id: string) => {
        if (!user) return;
        try {
            await db.rejectInstitution(id, user.role);
            setNotification({
                type: 'success',
                message: 'Institution registration rejected.'
            });
            setRefresh(p => p + 1);
            setTimeout(() => setNotification(null), 5000);
        } catch (e: any) {
            setNotification({
                type: 'error',
                message: e.message
            });
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!broadcastForm.title || !broadcastForm.message) {
            setNotification({ type: 'error', message: 'Please fill in all broadcast fields.' });
            return;
        }

        setIsSending(true);
        try {
            await notificationService.createBroadcast({
                ...broadcastForm,
                created_by: user.id
            });
            setNotification({ type: 'success', message: 'Broadcast sent successfully to ' + broadcastForm.target_role });
            setBroadcastForm({ title: '', message: '', type: 'info', target_role: 'ALL' });
        } catch (e: any) {
            setNotification({ type: 'error', message: 'Failed to send broadcast: ' + e.message });
        } finally {
            setIsSending(false);
        }
    };

    const pendingInst = institutions.filter(i => i.status === InstitutionStatus.PENDING);
    const activeInst = institutions.filter(i => i.status === InstitutionStatus.APPROVED);

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage institution approvals and platform overview.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filter institutions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open('http://localhost:3000', '_blank')}
                        className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 text-sm"
                    >
                        <ShieldAlert size={18} /> Launch Admin Console
                    </button>
                </div>
            </div>

            {notification && (
                <div className="mb-6">
                    <PremiumAlert
                        type={notification.type === 'success' ? 'success' : 'error'}
                        title={notification.type.toUpperCase()}
                        description={notification.message}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending Requests</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{pendingInst.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Institutions</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{activeInst.length}</p>
                </div>
                <Link to="/super-admin/analysis" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Platform Activity</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-2">View Insights</p>
                        </div>
                        <TrendingUp size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Quick Access to Uploader */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-2xl mb-10 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold mb-2">Consolidated Admin Console</h2>
                        <p className="text-slate-300">Manage all MCQs, Bulk Uploads, and Institution verification from the external Admin Console tool.</p>
                    </div>
                    <button
                        onClick={() => window.open('http://localhost:3000', '_blank')}
                        className="bg-primary-500 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-primary-400 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                        Open Console <ArrowUpRight size={20} />
                    </button>
                </div>
            </div>

            {/* Platform Broadcast Section */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Platform Broadcast</h2>
                        <p className="text-sm text-slate-500">Send an announcement to all students or admins instantly.</p>
                    </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Announcement Title</label>
                            <input
                                type="text"
                                placeholder="E.g., System Maintenance"
                                value={broadcastForm.title}
                                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                                <select
                                    value={broadcastForm.type}
                                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                >
                                    <option value="info">Information</option>
                                    <option value="warning">Warning</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
                                <select
                                    value={broadcastForm.target_role}
                                    onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                >
                                    <option value="ALL">Everyone</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="ADMIN">Admins Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message Content</label>
                            <textarea
                                rows={4}
                                placeholder="What would you like to announce?"
                                value={broadcastForm.message}
                                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isSending ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'}`}
                        >
                            {isSending ? 'Sending...' : <><Send size={18} /> Dispatch Broadcast</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Pending Approvals */}
            <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-amber-500" size={20} />
                    Pending Approvals
                </h2>
                {pendingInst.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-500">
                        {searchTerm ? 'No pending institutions match your search.' : 'No pending institution registrations.'}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Institution Name</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Domain</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingInst.map(inst => (
                                    <tr key={inst.id} className="hover:bg-primary-50 transition-colors duration-150">
                                        <td className="px-6 py-4 font-medium text-slate-900">{inst.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{inst.officialEmail}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs bg-slate-100 px-2 py-1 rounded inline-block mt-2">@{inst.domain}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleApprove(inst)}
                                                className="inline-flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 hover:bg-primary-700 active:scale-95 transition-transform duration-200"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(inst.id)}
                                                className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 active:scale-95 transition-transform duration-200"
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Active Institutions List */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Active Institutions</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Institution Name</th>
                                <th className="px-6 py-4 font-semibold">Admin Email</th>
                                <th className="px-6 py-4 font-semibold">Domain</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeInst.map(inst => (
                                <tr key={inst.id} className="hover:bg-slate-50 transition-colors duration-150">
                                    <td className="px-6 py-4 font-medium text-slate-900">{inst.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{inst.officialEmail}</td>
                                    <td className="px-6 py-4 text-slate-600">@{inst.domain}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {activeInst.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        {searchTerm ? 'No active institutions match your search.' : 'No active institutions found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </Layout>
    );
};

export default SuperAdminDashboard;