import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  RefreshCw,
  Gauge,
  Layers,
  Inbox,
} from 'lucide-react';
import { api } from '../services/api';
import EmotionPieChart from '../components/dashboard/EmotionPieChart';
import EmotionBarChart from '../components/dashboard/EmotionBarChart';
import EmotionBadge from '../components/common/EmotionBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getEmotionConfig } from '../utils/emotionTheme';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [sumRes, histRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getHistory({ limit: 100 }),
      ]);
      setData(sumRes.data);
      setHistoryItems(histRes.data.items || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!historyItems || historyItems.length === 0) return;

    const headers = ['ID', 'Text', 'Emotion', 'Confidence', 'Source', 'Date'];
    const rows = historyItems.map((item) => [
      item.id,
      `"${item.text.replace(/"/g, '""')}"`,
      item.predicted_label,
      item.confidence_score,
      item.source_type,
      item.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulseai_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating visual analytics..." size="lg" />;
  }

  const hasData = data && data.total_analyzed > 0;

  const filteredHistory = historyItems.filter((item) => {
    const matchesSearch = searchTerm
      ? item.text.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesEmotion =
      selectedEmotion === 'all'
        ? true
        : item.predicted_label.toLowerCase() === selectedEmotion.toLowerCase();
    return matchesSearch && matchesEmotion;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0ECFF] text-[#7C5CBF] text-xs font-semibold mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Affective Analytics & Patterns
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
            Emotion Analytics
          </h2>
          <p className="text-sm text-[#66758A]">
            Aggregate distribution and confidence trends computed across all analyzed feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-2 text-[#66758A] hover:text-[#2457D6] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F5F7FA] transition-colors cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {hasData && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Records CSV
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Inbox}
          title="No analytics data available"
          description="Analytics charts require analyzed customer feedback records. Start by analyzing a few customer reviews."
          actionText="Analyze Text"
          actionLink="/analyze"
        />
      ) : (
        <>
          {/* Top Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Proportion Donut */}
            <div className="lg:col-span-5 surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#17243B]">
                  Emotion Category Distribution
                </h3>
                <p className="text-xs text-[#66758A]">
                  Relative proportion of detected affective states
                </p>
              </div>

              <EmotionPieChart data={data.emotion_distribution} />

              <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-xs">
                {data.emotion_distribution.map((item, idx) => {
                  const conf = getEmotionConfig(item.emotion);
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: conf.barColor }}
                        />
                        <span className="font-medium text-[#17243B] capitalize">
                          {conf.label}
                        </span>
                      </div>
                      <span className="font-bold text-[#17243B]">
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume Bar Chart */}
            <div className="lg:col-span-7 surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#17243B]">
                  Feedback Volume by Emotion
                </h3>
                <p className="text-xs text-[#66758A]">
                  Total number of analyzed customer feedback items per emotion
                </p>
              </div>

              <EmotionBarChart data={data.emotion_distribution} dataKey="count" />
            </div>
          </div>

          {/* Average Confidence by Emotion Chart */}
          <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#17243B]">
                Model Confidence Reliability by Emotion
              </h3>
              <p className="text-xs text-[#66758A]">
                Mean prediction probability score calculated per emotional category
              </p>
            </div>

            <EmotionBarChart
              data={data.confidence_by_emotion}
              dataKey="average_confidence"
              yLabel="Confidence"
            />
          </div>

          {/* Filterable Table */}
          <div className="surface-card border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17243B]">
                  Corroborating Feedback Records ({filteredHistory.length})
                </h3>
                <p className="text-xs text-[#66758A]">
                  Browse texts contributing to these aggregate distributions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search records..."
                    className="pl-8 pr-3 py-1.5 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg outline-none focus:bg-white focus:border-[#2457D6]"
                  />
                </div>

                <select
                  value={selectedEmotion}
                  onChange={(e) => setSelectedEmotion(e.target.value)}
                  className="py-1.5 px-2.5 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg outline-none"
                >
                  <option value="all">All Emotion Types</option>
                  {data.emotion_distribution.map((em) => (
                    <option key={em.emotion} value={em.emotion}>
                      {em.emotion.charAt(0).toUpperCase() + em.emotion.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#66758A] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Feedback Text</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-36">Classified Emotion</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">Confidence</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-24">Type</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-28">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-3 text-[#17243B] font-medium max-w-md truncate">
                        {item.text}
                      </td>
                      <td className="py-3 px-3">
                        <EmotionBadge emotion={item.predicted_label} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#17243B]">
                        {Math.round(item.confidence_score * 100)}%
                      </td>
                      <td className="py-3 px-3 text-[#66758A] capitalize">
                        {item.source_type || 'single'}
                      </td>
                      <td className="py-3 px-3 text-[#94A3B8] whitespace-nowrap">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                        No records match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
