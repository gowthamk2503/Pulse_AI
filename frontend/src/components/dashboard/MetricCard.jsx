import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = '#2457D6', bg = '#EAF1FF' }) => {
  return (
    <div className="surface-card p-5 border border-[#E2E8F0] rounded-2xl bg-white flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#66758A] uppercase tracking-wider">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[#94A3B8] font-normal pt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color: color }}
      >
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
    </div>
  );
};

export default MetricCard;
