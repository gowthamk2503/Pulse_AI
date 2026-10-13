import React from 'react';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Start by analyzing a sample text or uploading a dataset.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="surface-card-static p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 border border-[#E2E8F0] rounded-xl bg-white">
      <div className="w-12 h-12 rounded-full bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-[#17243B] mb-1.5">{title}</h3>
      <p className="text-sm text-[#66758A] mb-6 max-w-sm">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-lg transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
