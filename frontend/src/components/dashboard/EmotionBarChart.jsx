import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { getEmotionConfig } from '../../utils/emotionTheme';

export const EmotionBarChart = ({ data = [], dataKey = "count", yLabel = "Frequency" }) => {
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
      value: item[dataKey],
      rawEmotion: item.emotion,
      color: config.barColor,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-md text-xs space-y-1">
          <p className="font-bold text-[#17243B]">{d.name}</p>
          <p className="text-[#66758A]">
            {dataKey === "average_confidence" ? "Avg Confidence" : "Count"}:{" "}
            <span className="font-semibold text-[#17243B]">
              {dataKey === "average_confidence" ? `${Math.round(d.value * 100)}%` : d.value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
            tick={{ fill: '#66758A', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
            tick={{ fill: '#66758A', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionBarChart;
