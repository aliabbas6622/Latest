import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { Check } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [roleMode, setRoleMode] = useState<'INSTITUTION' | 'STUDENT'>('STUDENT');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        setTimeout(async () => {
            try {
                await login(email, password, rememberMe);

                // Get user role logic (Works for both Mock and Supabase)
                let role = '';

                // 1. Try Local Storage (Mock Mode)
                const storedUser = localStorage.getItem('aptivo_session_user') || sessionStorage.getItem('aptivo_session_user');
                if (storedUser) {
                    role = JSON.parse(storedUser).role;
                } else {
                    // 2. Try Supabase Profile (Supabase Mode)
                    // We need to dynamically import this to avoid circular dependencies or issues if context is used differently
                    // But since we are inside a component, we can use the helper we will import
                    const { getMyProfile } = await import('../supabase/db');
                    const profile = await getMyProfile();
                    if (profile) role = profile.role;
                }

                if (role === UserRole.SUPER_ADMIN) navigate('/super-admin/dashboard');
                else if (role === UserRole.INSTITUTION_ADMIN) navigate('/institution/dashboard');
                else if (role === UserRole.STUDENT) navigate('/student/home');
                else {
                    // Fallback if role is not recognized or found
                    setError('User profile not found. Please contact support.');
                    setLoading(false);
                }

            } catch (err: any) {
                setError(err.message || 'Login failed');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to access your dashboard</p>
                </div>

                {/* Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                    <button
                        type="button"
                        onClick={() => setRoleMode('STUDENT')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'STUDENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRoleMode('INSTITUTION')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${roleMode === 'INSTITUTION' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Institution / Admin
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                            placeholder={roleMode === 'STUDENT' ? 'student@university.edu' : 'admin@institution.edu'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-300 group-hover:border-primary-400'}`}>
                                {rememberMe && <Check size={12} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="hidden"
                            />
                            <span className="text-sm text-slate-600 select-none">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg shadow-primary-500/20 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    <p className="mb-2">
                        New Student? <Link to="/signup" className="text-primary-600 hover:underline font-medium">Create an account</Link>
                    </p>
                    <p>
                        Institution? <Link to="/register-institution" className="text-primary-600 hover:underline">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;