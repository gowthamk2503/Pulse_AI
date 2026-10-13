import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getEmotionConfig } from '../../utils/emotionTheme';

export const EmotionPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
        No emotion distribution data available
      </div>
    );
  }

  const chartData = data.map((item) => {
    const config = getEmotionConfig(item.emotion);
    return {
      name: config.label,
      value: item.count,
      percentage: item.percentage,
      color: config.barColor,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-md text-xs space-y-1">
          <p className="font-bold text-[#17243B]">{d.name}</p>
          <p className="text-[#66758A]">Count: <span className="font-semibold text-[#17243B]">{d.value}</span></p>
          <p className="text-[#66758A]">Share: <span className="font-semibold text-[#17243B]">{d.percentage}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionPieChart;
