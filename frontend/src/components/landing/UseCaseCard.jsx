import React from 'react';

export const UseCaseCard = ({ title, description, icon: Icon, badge }) => {
  return (
    <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] text-[#2457D6] flex items-center justify-center">
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
        <span className="text-[11px] font-semibold text-[#66758A] bg-[#F1F4F8] px-2.5 py-1 rounded-md">
          {badge}
        </span>
      </div>
      <h4 className="text-base font-bold text-[#17243B]">{title}</h4>
      <p className="text-sm text-[#66758A] leading-relaxed">{description}</p>
    </div>
  );
};

export default UseCaseCard;
