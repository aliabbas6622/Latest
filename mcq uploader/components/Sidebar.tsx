import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Upload, BookOpen, HelpCircle, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add', icon: PlusCircle, label: 'Add Question' },
    { to: '/upload', icon: Upload, label: 'Bulk Upload' },
    { to: '/bank', icon: BookOpen, label: 'Question Bank' },
  ];

  const bottomNavItems = [
    { to: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:z-auto
      `}>
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-primary flex items-center gap-2 tracking-tight">
              <span>Aptivo</span>
            </h1>
            <p className="text-[11px] font-bold text-textSecondary mt-1 uppercase tracking-widest pl-0.5 opacity-70">Admin Console</p>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose} // Close sidebar on nav click (mobile)
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium text-sm relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30 ${
                  isActive
                    ? 'bg-primary/20 text-teal-900 shadow-sm font-semibold'
                    : 'text-textSecondary hover:bg-gray-50 hover:text-textMain'
                }`
              }
            >
               {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-800' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                  </>
               )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/30">
          <p className="px-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest opacity-60 mb-2">Support</p>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30 ${
                  isActive
                    ? 'bg-primary/20 text-teal-900 shadow-sm font-semibold'
                    : 'text-textSecondary hover:bg-white hover:text-textMain'
                }`
              }
            >
               <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
               <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-teal-900 font-bold text-sm shadow-sm ring-2 ring-white">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-textMain truncate">Admin User</p>
              <p className="text-xs font-medium text-textSecondary opacity-80 truncate">admin@aptivo.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;