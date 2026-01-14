import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, Building } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-2">Manage your account information.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary-600 to-teal-800 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=0d9488&color=fff&size=128`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-8">
                        <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                        <p className="text-slate-500">{user?.role ? user.role.replace('_', ' ') : 'User'}</p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                                </div>
                                <p className="text-slate-900 font-medium pl-11">{user?.email}</p>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Shield size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Role</span>
                                </div>
                                <p className="text-slate-900 font-medium pl-11 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
                            </div>

                            {user?.institutionId && (
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 md:col-span-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <Building size={16} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Institution ID</span>
                                    </div>
                                    <p className="text-slate-900 font-medium pl-11 font-mono">{user.institutionId}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
