import React, { useState } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Zap,
    AlertOctagon,
    Library,
    BarChart2,
    TrendingUp,
    Bell,
    Info,
    AlertTriangle,
    Zap as UrgentIcon,
    Palette,
    Accessibility,
    User as UserIcon
} from 'lucide-react';
import ModeIndicator from './ModeIndicator';
import { notificationService, Notification } from '../services/notificationService';

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isManualCollapsed, setIsManualCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    React.useEffect(() => {
        if (user && supabase) {
            fetchNotifications();

            // Real-time notification listener
            const channel = supabase
                .channel('notifications-db-changes')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications' },
                    () => {
                        console.log('New notification received!');
                        fetchNotifications();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        const data = await notificationService.getNotifications(user.id);
        setNotifications(data);
        const unreadRows = data.filter(n => !n.is_read);
        setUnreadCount(unreadRows.length);
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await notificationService.markAllAsRead(user.id);
        await fetchNotifications();
    };

    const handleNotificationClick = async (notif: Notification) => {
        if (!user || notif.is_read) return;
        await notificationService.markAsRead(user.id, notif.id);
        await fetchNotifications();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const NavItem = ({ to, icon: Icon, label, isCollapsed }: { to: string, icon: any, label: string, isCollapsed?: boolean }) => {

        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                    }`}
                title={isCollapsed ? label : ""}
            >
                <Icon size={18} className={`transition-colors duration-200 shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all">{label}</span>}
            </Link>
        );
    };

    // Mode Detection
    const isUnderstandMode = location.pathname.includes('/understand/');
    const isApplyMode = location.pathname.includes('/apply/');
    const [isHovered, setIsHovered] = useState(false);

    // Collapsed logic: Collapsed if in specific modes OR manually collapsed, BUT NOT if hovered
    const isCollapsed = (isUnderstandMode || isApplyMode || isManualCollapsed) && !isHovered;

    return (
        <div className="min-h-screen flex transition-colors duration-500 bg-[#F5F7FA]">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Transitioning on mobile */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                fixed md:sticky top-0 left-0 h-screen md:h-[calc(100vh-2rem)]
                bg-white border-r border-slate-200 z-40 
                flex flex-col transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                md:rounded-br-3xl
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 transition-all relative group`}>
                    <div className="flex items-center gap-3">
                        <div className={`shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-40'}`}>
                            <img src="/logo.png" alt="Aptivo Logo" className="w-full h-auto object-contain" />
                        </div>
                    </div>

                    {/* Manual Toggle Button (Desktop) */}
                    <button
                        onClick={() => setIsManualCollapsed(!isManualCollapsed)}
                        className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-primary-600 shadow-sm transition-all opacity-0 group-hover:opacity-100 z-50`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}><path d="m15 18-6-6 6-6" /></svg>
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    {user?.role === UserRole.SUPER_ADMIN && (
                        <>
                            <NavItem to="/super-admin/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />
                            <NavItem to="/super-admin/analysis" icon={TrendingUp} label="Platform Insights" isCollapsed={isCollapsed} />
                            <NavItem to="/super-admin/users" icon={Users} label="Admin Permissions" isCollapsed={isCollapsed} />
                            <a
                                href="http://localhost:3000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1 group`}
                                title={isCollapsed ? "Content Manager" : ""}
                            >
                                <Library size={18} className="transition-colors duration-200 shrink-0 text-slate-400 group-hover:text-slate-600" />
                                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all">Content Manager</span>}
                            </a>
                        </>
                    )}
                    {user?.role === UserRole.ADMIN && (
                        <>
                            <NavItem to="/institution/dashboard" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} />
                            <NavItem to="/institution/analysis" icon={BarChart2} label="Campus Analysis" isCollapsed={isCollapsed} />
                            <NavItem to="/institution/students" icon={Users} label="Students" isCollapsed={isCollapsed} />
                            <NavItem to="/institution/universities" icon={GraduationCap} label="Curriculum" isCollapsed={isCollapsed} />
                        </>
                    )}
                    {user?.role === UserRole.STUDENT && (
                        <>
                            <NavItem to="/student/home" icon={LayoutDashboard} label="Home" isCollapsed={isCollapsed} />
                            <NavItem to="/student/analysis" icon={TrendingUp} label="My Performance" isCollapsed={isCollapsed} />
                            <NavItem to="/student/mistakes" icon={AlertOctagon} label="Mistake Log" isCollapsed={isCollapsed} />
                        </>
                    )}
                </nav>

                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 w-full text-left rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 duration-200 group`}
                        title={isCollapsed ? "Sign Out" : ""}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
                {/* Top Navbar */}
                <header className={`h-16 border-b sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between transition-all duration-500 ${(isUnderstandMode || isApplyMode) ? 'bg-white border-primary-100 shadow-sm shadow-primary-500/5' :
                    'bg-white/80 backdrop-blur-md border-slate-200'
                    }`}>
                    <div className="flex items-center gap-4">
                        {!isUnderstandMode && !isApplyMode && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all active:scale-95"
                            >
                                <Menu size={24} />
                            </button>
                        )}

                        {/* Center: Mode Indicator (Toggle) */}
                        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                            <ModeIndicator />
                        </div>

                        {/* Search Bar - Only on Neutral Pages */}
                        {!isUnderstandMode && !isApplyMode && (
                            <div className="relative hidden sm:block group">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 w-64 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm"
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 transition-colors group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right mr-2 hidden sm:flex text-slate-800">
                            <span className="text-sm font-semibold">{user?.name}</span>
                            <span className="text-xs opacity-70 capitalize">{user?.role.replace('_', ' ').toLowerCase()}</span>
                        </div>

                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsNotifOpen(!isNotifOpen);
                                    setIsDropdownOpen(false); // Close profile dropdown
                                    setUnreadCount(0);
                                }}
                                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all relative group active:scale-95"
                            >
                                <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-scale-in origin-top-right">
                                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900">Notifications</h3>
                                        <div className="flex items-center gap-3">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                            <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded-full">{notifications.length} Total</span>
                                        </div>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Bell size={24} />
                                                </div>
                                                <p className="text-sm text-slate-500">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 border-b border-slate-50 transition-colors cursor-pointer relative group ${notif.is_read ? 'bg-white' : 'bg-primary-50/30'}`}
                                                >
                                                    {!notif.is_read && (
                                                        <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full"></div>
                                                    )}
                                                    <div className="flex gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'urgent' ? 'bg-red-50 text-red-600' :
                                                            notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {notif.type === 'urgent' ? <UrgentIcon size={18} /> :
                                                                notif.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm truncate ${notif.is_read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>{notif.title}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-2 font-medium text-right">
                                                                {timeAgo(new Date(notif.created_at))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button className="w-full p-3 text-center text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-slate-50">
                                            View All Notification History
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(!isDropdownOpen);
                                    setIsNotifOpen(false); // Close notifications
                                }}
                                className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-primary-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-95 duration-200"
                            >
                                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=0d9488&color=fff`} alt="Profile" />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 cursor-default"
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 py-2 z-50 animate-scale-in origin-top-right overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
                                            <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user?.name}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 truncate tracking-widest mt-0.5">{user?.role.replace('_', ' ')}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                to="/profile"
                                                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-all group ${location.pathname === '/profile'
                                                    ? 'text-primary-600 bg-primary-50/50'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <UserIcon size={18} className={`transition-transform group-hover:scale-110 ${location.pathname === '/profile' ? 'text-primary-500' : 'text-slate-400'}`} />
                                                <span>Public profile</span>
                                            </Link>

                                            <Link
                                                to="/settings"
                                                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-all group ${location.pathname === '/settings'
                                                    ? 'text-primary-600 bg-primary-50/50'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Settings size={18} className={`transition-transform group-hover:rotate-45 ${location.pathname === '/settings' ? 'text-primary-500' : 'text-slate-400'}`} />
                                                <span>Account settings</span>
                                            </Link>

                                            <Link
                                                to="/settings#appearance"
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left group"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Palette size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
                                                <span>Appearance</span>
                                            </Link>

                                            <Link
                                                to="/settings#accessibility"
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left group"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Accessibility size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
                                                <span>Accessibility</span>
                                            </Link>

                                            <button
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left group"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setIsNotifOpen(true);
                                                }}
                                            >
                                                <Bell size={18} className="text-slate-400 group-hover:animate-bounce" />
                                                <span>Notifications</span>
                                            </button>

                                            <div className="h-px bg-slate-100 my-2"></div>

                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all text-left group"
                                            >
                                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className={`${(isUnderstandMode || isApplyMode) ? 'max-w-5xl mx-auto' : 'max-w-7xl mx-auto'} w-full p-4 sm:p-8 animate-fade-in`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;