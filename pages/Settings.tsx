import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { User, Settings as SettingsIcon, Palette, Accessibility, Shield, LogOut, Mail, Fingerprint, ExternalLink, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'accessibility'>('account');

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['appearance', 'accessibility', 'account'].includes(hash)) {
            setActiveTab(hash as any);
        }
    }, [location.hash]);

    const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-8 py-5 transition-all relative font-bold text-sm tracking-tight ${activeTab === id
                ? 'text-primary-700'
                : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            <Icon size={18} className={activeTab === id ? 'text-primary-600' : ''} />
            {label}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
        </button>
    );

    return (
        <Layout>
            <div className="max-w-5xl mx-auto py-4">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Personal Workspace</h1>
                    <p className="text-slate-500 mt-2 font-medium">Fine-tune your Aptivo experience and account security.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Navigation Sidebar */}
                    <div className="lg:w-72 shrink-0">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-3 sticky top-24">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'account' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <User size={18} /> Account System
                                </button>
                                <button
                                    onClick={() => setActiveTab('appearance')}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'appearance' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Palette size={18} /> Visual Engine
                                </button>
                                <button
                                    onClick={() => setActiveTab('accessibility')}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === 'accessibility' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Accessibility size={18} /> Accessibility
                                </button>
                            </div>

                            <div className="h-px bg-slate-100 my-4 mx-4" />

                            <div className="px-5 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</span>
                                    <span className="text-sm font-bold text-slate-900 truncate">{user?.name}</span>
                                    <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
                            >
                                <div className="p-8 md:p-12">
                                    {activeTab === 'account' && (
                                        <div className="space-y-12">
                                            {/* Profile Section */}
                                            <section>
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity Details</h3>
                                                        <p className="text-sm text-slate-500 font-medium">How you appear across the Aptivo platform.</p>
                                                    </div>
                                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                                        <Fingerprint size={24} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="group space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                                                        <div className="relative">
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                                            <input
                                                                type="text"
                                                                defaultValue={user?.name}
                                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-900 shadow-inner"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="group space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                            <input
                                                                type="email"
                                                                defaultValue={user?.email}
                                                                disabled
                                                                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed font-medium shadow-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Security Section */}
                                            <section className="pt-10 border-t border-slate-100">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">System Security</h3>
                                                        <p className="text-sm text-slate-500 font-medium">Manage your sessions and platform access.</p>
                                                    </div>
                                                    <Shield size={24} className="text-primary-600" />
                                                </div>

                                                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:border-slate-200">
                                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="hidden sm:flex w-14 h-14 bg-white rounded-2xl shadow-md items-center justify-center text-red-500 border border-slate-100 shrink-0">
                                                                <LogOut size={28} />
                                                            </div>
                                                            <div className="text-center md:text-left">
                                                                <p className="text-lg font-black text-slate-900 tracking-tight">Active Sessions</p>
                                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Instantly revoke access across all devices. This will require a re-login on all currently active browsers.</p>
                                                            </div>
                                                        </div>
                                                        <button className="whitespace-nowrap px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95">
                                                            Terminate Sessions
                                                        </button>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {activeTab === 'appearance' && (
                                        <div className="py-12 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center text-primary-500 mb-8 shadow-xl shadow-primary-500/10">
                                                <Palette size={48} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center">Visual Customization</h3>
                                            <p className="text-slate-500 mt-4 max-w-md text-center font-medium leading-relaxed">
                                                We are developing a sophisticated theming engine for Aptivo. Soon you'll be able to toggle between Dark Mode, Glassmorphism, and custom accent colors.
                                            </p>

                                            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                                                <div className="p-6 rounded-3xl border-2 border-primary-600 bg-primary-50/30 flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary-600">
                                                        <SettingsIcon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-700">Light (Default)</span>
                                                </div>
                                                <div className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50/50 flex flex-col items-center gap-3 opacity-60 grayscale scale-95 transition-all">
                                                    <div className="w-10 h-10 rounded-full bg-slate-900 shadow-sm flex items-center justify-center text-white">
                                                        <Moon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deep Space</span>
                                                </div>
                                            </div>

                                            <div className="mt-12 flex items-center gap-2 bg-primary-50 text-primary-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                                Development Phase
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'accessibility' && (
                                        <div className="py-12 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-500 mb-8 shadow-xl shadow-blue-500/10">
                                                <Accessibility size={48} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight text-center">Inclusivity Settings</h3>
                                            <p className="text-slate-500 mt-4 max-w-md text-center font-medium leading-relaxed">
                                                Aptivo aims to be accessible for everyone. We're implementing screen reader optimizations, high-contrast modes, and dynamic text scaling.
                                            </p>

                                            <div className="mt-10 p-8 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-center gap-6 w-full max-w-lg">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                                                    <ExternalLink size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-blue-900">Accessibility Standards</p>
                                                    <p className="text-sm text-blue-700 font-medium">We targeting WCAG 2.1 AA compliance for the next major release.</p>
                                                </div>
                                            </div>

                                            <div className="mt-12 flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                Engine Under Review
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
