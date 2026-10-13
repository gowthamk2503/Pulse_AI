import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Brain,
  Sparkles,
  Gauge,
  ArrowRight,
  Upload,
  Layers,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import MetricCard from '../components/dashboard/MetricCard';
import EmotionPieChart from '../components/dashboard/EmotionPieChart';
import EmotionBarChart from '../components/dashboard/EmotionBarChart';
import RecentAnalysisTable from '../components/dashboard/RecentAnalysisTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import EmotionBadge from '../components/common/EmotionBadge';
import { getEmotionConfig } from '../utils/emotionTheme';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalyticsSummary();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError('Unable to load analytics metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard analytics..." size="lg" />;
  }

  const hasData = data && data.total_analyzed > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="surface-card p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2457D6] bg-[#EAF1FF] px-2.5 py-0.5 rounded-full">
            Workspace Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
            Your emotion intelligence workspace
          </h2>
          <p className="text-sm text-[#66758A] max-w-2xl">
            Explore the emotional patterns in your analyzed feedback and track sentiment trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2457D6] hover:bg-[#1948BB] text-white text-sm font-semibold rounded-xl shadow-sm shadow-[#2457D6]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Analyze New Text
          </Link>
          <Link
            to="/batch-analysis"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F5F7FA] text-[#17243B] border border-[#E2E8F0] text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#66758A]" />
            Upload CSV
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Texts Analyzed"
          value={hasData ? data.total_analyzed.toLocaleString() : '0'}
          subtitle="Processed feedback records"
          icon={FileText}
          color="#2457D6"
          bg="#EAF1FF"
        />
        <MetricCard
          title="Dominant Emotion"
          value={
            hasData && data.dominant_emotion !== 'None'
              ? data.dominant_emotion.toUpperCase()
              : 'N/A'
          }
          subtitle={
            hasData && data.dominant_emotion !== 'None'
              ? getEmotionConfig(data.dominant_emotion).description
              : 'No classifications recorded'
          }
          icon={Brain}
          color="#16856B"
          bg="#DDF6EC"
        />
        <MetricCard
          title="Emotions Detected"
          value={hasData ? `${data.distinct_emotions_count} / 7` : '0 / 7'}
          subtitle="Distinct emotional classes"
          icon={Layers}
          color="#7C5CBF"
          bg="#F0ECFF"
        />
        <MetricCard
          title="Average Confidence"
          value={hasData ? `${Math.round(data.average_confidence * 100)}%` : '0%'}
          subtitle="Mean model probability"
          icon={Gauge}
          color="#B96B26"
          bg="#FFF0E3"
        />
      </div>

      {!hasData ? (
        <EmptyState
          icon={Inbox}
          title="No analyzed feedback records yet"
          description="PulseAI hasn't recorded any text analyses in this workspace yet. Try testing a sample sentence or upload a customer reviews CSV file."
          actionText="Analyze First Text"
          actionLink="/analyze"
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Donut Chart & Category Breakdown */}
            <div className="lg:col-span-5 surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#17243B]">
                  Emotion Share Breakdown
                </h3>
                <span className="text-xs text-[#94A3B8]">Proportional</span>
              </div>
              <EmotionPieChart data={data.emotion_distribution} />

              <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                {data.emotion_distribution.map((item, idx) => {
                  const conf = getEmotionConfig(item.emotion);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: conf.barColor }}
                        />
                        <span className="font-medium text-[#17243B] capitalize">
                          {conf.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#66758A]">{item.count} items</span>
                        <span className="font-semibold text-[#17243B] w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bar Chart of Frequencies */}
            <div className="lg:col-span-7 surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#17243B]">
                    Emotion Volume Distribution
                  </h3>
                  <p className="text-xs text-[#66758A]">
                    Frequency of each emotional category detected in analyzed text
                  </p>
                </div>
                <button
                  onClick={fetchSummary}
                  className="p-1.5 text-[#66758A] hover:text-[#2457D6] rounded-lg hover:bg-[#F5F7FA] transition-colors cursor-pointer"
                  title="Refresh metrics"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <EmotionBarChart data={data.emotion_distribution} dataKey="count" />
            </div>
          </div>

          {/* Recent Analyses Section */}
          <div className="surface-card border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17243B]">
                  Recent Feedback Analyses
                </h3>
                <p className="text-xs text-[#66758A]">
                  Latest text predictions processed by the emotion model
                </p>
              </div>
              <Link
                to="/history"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2457D6] hover:text-[#1948BB]"
              >
                View Full History
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <RecentAnalysisTable analyses={data.recent_analyses} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
