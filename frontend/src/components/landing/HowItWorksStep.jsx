import React from 'react';

export const HowItWorksStep = ({ stepNumber, title, description, icon: Icon }) => {
  return (
    <div className="relative p-6 border border-[#E2E8F0] rounded-2xl bg-white surface-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="w-8 h-8 rounded-full bg-[#EAF1FF] text-[#2457D6] font-bold text-sm flex items-center justify-center">
            {stepNumber}
          </span>
          <div className="text-[#66758A]">
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>
        <h4 className="text-base font-bold text-[#17243B] mb-2">{title}</h4>
        <p className="text-sm text-[#66758A] leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default HowItWorksStep;
