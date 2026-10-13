import React from 'react';

export const FeatureCard = ({ icon: Icon, title, description, badgeColor = '#EAF1FF', iconColor = '#2457D6' }) => {
  return (
    <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white hover:border-[#CBD5E1] transition-all group flex flex-col justify-between">
      <div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105"
          style={{ backgroundColor: badgeColor, color: iconColor }}
        >
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h4 className="text-base font-bold text-[#17243B] mb-2 group-hover:text-[#2457D6] transition-colors">
          {title}
        </h4>
        <p className="text-sm text-[#66758A] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
