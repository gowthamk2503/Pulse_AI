import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center mb-6 shadow-sm">
        <Activity className="w-7 h-7 stroke-[2.2]" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#17243B] mb-2">404</h1>
      <h2 className="text-lg font-bold text-[#17243B] mb-1">Page Not Found</h2>
      <p className="text-sm text-[#66758A] max-w-sm mb-6">
        The requested URL was not found on the PulseAI emotion intelligence platform.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
