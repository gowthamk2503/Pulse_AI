import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Activity, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/analyze': 'Analyze Text',
  '/batch-analysis': 'Batch CSV Analysis',
  '/analytics': 'Emotion Analytics',
  '/history': 'Analysis History',
  '/settings': 'Settings',
};

export const TopBar = ({ setMobileOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [modelOnline, setModelOnline] = useState(true);

  useEffect(() => {
    const checkModel = async () => {
      try {
        const res = await api.health();
        setModelOnline(res.data.status === 'healthy');
      } catch {
        setModelOnline(false);
      }
    };
    checkModel();
  }, []);

  const title = TITLES[location.pathname] || 'Workspace';

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-[#66758A] hover:text-[#17243B] rounded-lg focus:outline-none"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#17243B] tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Model status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-medium text-[#66758A]">
          <span
            className={`w-2 h-2 rounded-full ${
              modelOnline ? 'bg-[#16856B]' : 'bg-[#B96B26]'
            }`}
          />
          <span className="hidden md:inline">DistilRoBERTa Emotion:</span>
          <span className={modelOnline ? 'text-[#16856B] font-semibold' : 'text-[#B96B26] font-semibold'}>
            {modelOnline ? 'Online' : 'Standby'}
          </span>
        </div>

        {/* User initials link to settings */}
        <Link
          to="/settings"
          className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-[#F5F7FA] border border-[#E2E8F0] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#2457D6] text-white flex items-center justify-center font-bold text-xs">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-medium text-[#17243B] hidden sm:inline">
            {user?.full_name || 'My Profile'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
