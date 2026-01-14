import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { profileService, AdminProfile } from '../services/profileService';
import { UserRole } from '../types';
import { Search, ShieldCheck, ShieldAlert, UserCheck, UserX, Loader2, Building2 } from 'lucide-react';
import PremiumAlert from '../components/PremiumAlerts';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminUsers = () => {
    const [admins, setAdmins] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        setLoading(true);
        try {
            const data = await profileService.getAdmins();
            setAdmins(data);
        } catch (error: any) {
            setNotification({ type: 'error', message: 'Failed to load admins: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (searchTerm.trim()) {
                const data = await profileService.searchAdmins(searchTerm);
                setAdmins(data);
            } else {
                await loadAdmins();
            }
        } catch (error: any) {
            setNotification({ type: 'error', message: 'Search failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = async (userId: string, currentStatus: boolean) => {
        setActionLoading(userId);
        try {
            await profileService.updateUploadPermission(userId, !currentStatus);
            setAdmins(prev => prev.map(a => a.id === userId ? { ...a, can_upload: !currentStatus } : a));
            setNotification({
                type: 'success',
                message: `Permissions updated for ${admins.find(a => a.id === userId)?.name}`
            });
        } catch (error: any) {
            setNotification({ type: 'error', message: 'Update failed: ' + error.message });
        } finally {
            setActionLoading(null);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Admin Permissions</h1>
                <p className="text-slate-500 mt-2">Delegate MCQ upload permissions to Institution Admins.</p>
            </div>

            {notification && (
                <div className="mb-6">
                    <PremiumAlert
                        type={notification.type}
                        title={notification.type === 'success' ? 'SUCCESS' : 'ERROR'}
                        description={notification.message}
                        onClose={() => setNotification(null)}
                    />
                </div>
            )}

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
                    />
                </form>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold uppercase tracking-wider">{admins.length} Managed Users</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                        <p className="text-slate-500 font-medium">Fetching administrative profiles...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Admin Details</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Institution</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Upload Access</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Primary Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode='popLayout'>
                                {admins.map((admin, idx) => (
                                    <motion.tr
                                        key={admin.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 leading-tight">{admin.name}</span>
                                                <span className="text-sm text-slate-500">{admin.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {admin.institution_name ? (
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <Building2 size={16} className="text-slate-400" />
                                                    {admin.institution_name}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">N/A (Super)</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => togglePermission(admin.id, admin.can_upload)}
                                                    disabled={actionLoading === admin.id || admin.role === UserRole.SUPER_ADMIN}
                                                    className={`
                                                        relative flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                                                        ${admin.role === UserRole.SUPER_ADMIN
                                                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                            : admin.can_upload
                                                                ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 active:scale-95'
                                                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95'
                                                        }
                                                    `}
                                                >
                                                    {actionLoading === admin.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : admin.role === UserRole.SUPER_ADMIN ? (
                                                        <ShieldCheck size={14} />
                                                    ) : admin.can_upload ? (
                                                        <UserCheck size={14} />
                                                    ) : (
                                                        <UserX size={14} />
                                                    )}

                                                    {admin.role === UserRole.SUPER_ADMIN
                                                        ? 'Permanent'
                                                        : admin.can_upload ? 'Has Access' : 'No Access'
                                                    }

                                                    {admin.can_upload && admin.role !== UserRole.SUPER_ADMIN && (
                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`
                                                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                    ${admin.role === UserRole.SUPER_ADMIN
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }
                                                `}>
                                                    {admin.role.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No administrative users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default SuperAdminUsers;
