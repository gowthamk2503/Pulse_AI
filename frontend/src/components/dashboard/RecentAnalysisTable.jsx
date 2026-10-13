import React from 'react';
import EmotionBadge from '../common/EmotionBadge';

export const RecentAnalysisTable = ({ analyses = [] }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#94A3B8]">
        No recent analyses recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#F5F7FA] text-[#66758A] border-b border-[#E2E8F0]">
          <tr>
            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Text Snippet</th>
            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Detected Emotion</th>
            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Confidence</th>
            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Source</th>
            <th className="py-3 px-4 font-semibold uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {analyses.map((item) => {
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent';
            return (
              <tr key={item.id} className="hover:bg-[#F5F7FA]/75 transition-colors">
                <td className="py-3 px-4 max-w-xs truncate font-medium text-[#17243B]">
                  {item.text}
                </td>
                <td className="py-3 px-4">
                  <EmotionBadge emotion={item.predicted_label} size="sm" />
                </td>
                <td className="py-3 px-4 font-semibold text-[#17243B]">
                  {Math.round(item.confidence_score * 100)}%
                </td>
                <td className="py-3 px-4 text-[#66758A] capitalize">
                  {item.source_type || 'single'}
                </td>
                <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                  {dateStr}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAnalysisTable;
