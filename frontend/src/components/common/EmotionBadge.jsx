import React from 'react';
import { getEmotionConfig } from '../../utils/emotionTheme';

export const EmotionBadge = ({ emotion, score, size = 'md', showDot = true }) => {
  const config = getEmotionConfig(emotion);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: config.barColor }}
        />
      )}
      <span>{config.label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-75 text-[11px] font-normal">
          {Math.round(score * 100)}%
        </span>
      )}
    </span>
  );
};

export default EmotionBadge;
