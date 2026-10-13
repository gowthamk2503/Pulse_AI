import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  MessageSquareText,
  FileSpreadsheet,
  BarChart3,
  History,
  Settings,
  LogOut,
  X,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze Text', path: '/analyze', icon: MessageSquareText },
  { name: 'Batch Analysis', path: '/batch-analysis', icon: FileSpreadsheet },
  { name: 'Emotion Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PA';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0]">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2457D6] flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#17243B]">
            pulse<span className="text-[#2457D6]">ai</span>
          </span>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-[#66758A] hover:text-[#17243B]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#EAF1FF] text-[#2457D6] font-semibold'
                    : 'text-[#66758A] hover:bg-[#F5F7FA] hover:text-[#17243B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#2457D6]' : 'text-[#66758A] group-hover:text-[#17243B]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2457D6]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile & Logout at Bottom */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-lg bg-[#2457D6] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#17243B] truncate">
              {user?.full_name || 'PulseAI User'}
            </div>
            <div className="text-[11px] text-[#66758A] truncate">
              {user?.email || 'user@pulseai.com'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#C9475B] hover:bg-[#FCE8ED] rounded-lg transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs flex-1 flex flex-col bg-white">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
