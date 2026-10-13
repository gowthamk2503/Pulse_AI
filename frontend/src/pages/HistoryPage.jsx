import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Eye,
  X,
  RefreshCw,
  Inbox,
  Shield,
  Layers,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import EmotionBadge from '../components/common/EmotionBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { getEmotionConfig } from '../utils/emotionTheme';

export const HistoryPage = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [emotion, setEmotion] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory({
        search: search || undefined,
        emotion: emotion !== 'all' ? emotion : undefined,
        limit: 100,
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load history from persistent database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [emotion]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteHistoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete item error:', err);
      setError('Failed to delete history record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setItems([]);
      setTotal(0);
      setSelectedRecord(null);
      setClearConfirm(false);
    } catch (err) {
      console.error('Clear history error:', err);
      setError('Failed to clear database history.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF1FF] text-[#2457D6] text-xs font-semibold mb-1">
            <HistoryIcon className="w-3.5 h-3.5" />
            SQLite Persistent Storage
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
            Analysis History
          </h2>
          <p className="text-sm text-[#66758A]">
            Review, inspect, or manage previously classified customer feedback records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="p-2 text-[#66758A] hover:text-[#2457D6] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F5F7FA] transition-colors cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#C9475B] bg-[#FCE8ED] hover:bg-[#F9D6DF] rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All History
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 border border-[#E2E8F0] rounded-2xl bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text in history..."
            className="w-full pl-9 pr-4 py-2 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#2457D6]"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#66758A]">
            <Filter className="w-3.5 h-3.5" />
            <span>Emotion:</span>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="py-1.5 px-2.5 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl outline-none"
            >
              <option value="all">All Emotions</option>
              <option value="joy">Joy</option>
              <option value="sadness">Sadness</option>
              <option value="anger">Anger</option>
              <option value="fear">Fear</option>
              <option value="surprise">Surprise</option>
              <option value="neutral">Neutral</option>
              <option value="disgust">Disgust</option>
            </select>
          </div>

          <span className="text-xs text-[#94A3B8] font-medium">
            {total} record{total === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching history from SQLite database..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No history records found"
          description={
            search || emotion !== 'all'
              ? 'No database records match your active search or emotion filters.'
              : 'You have not performed any single or batch analyses yet.'
          }
          actionText={search || emotion !== 'all' ? 'Reset Filters' : 'Analyze New Text'}
          onAction={
            search || emotion !== 'all'
              ? () => {
                  setSearch('');
                  setEmotion('all');
                }
              : undefined
          }
          actionLink={search || emotion !== 'all' ? undefined : '/analyze'}
        />
      ) : (
        <div className="surface-card border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-[#66758A] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-16">ID</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Analyzed Text Content</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-36">Emotion</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-24">Confidence</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-24">Source</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider w-28">Timestamp</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {items.map((item) => {
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr key={item.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-4 text-[#94A3B8] font-mono">
                        #{item.id}
                      </td>
                      <td className="py-3 px-4 max-w-md truncate font-medium text-[#17243B]">
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 text-[#66758A] hover:text-[#2457D6] hover:bg-[#EAF1FF] rounded-lg transition-colors cursor-pointer"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-[#66758A] hover:text-[#C9475B] hover:bg-[#FCE8ED] rounded-lg transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="surface-card bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E2E8F0] shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-bold text-[#66758A] uppercase">
                  Analysis Details • Record #{selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-[#17243B]">
                  Classification Breakdown
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 text-[#66758A] hover:text-[#17243B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original text */}
            <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="text-[11px] font-semibold text-[#66758A] uppercase">Original Text</span>
              <p className="text-xs text-[#17243B] leading-relaxed">
                "{selectedRecord.text}"
              </p>
            </div>

            {/* Dominant Prediction */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2E8F0]">
              <div>
                <span className="text-xs text-[#66758A]">Dominant Emotion</span>
                <div className="mt-1">
                  <EmotionBadge emotion={selectedRecord.predicted_label} size="md" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#66758A]">Confidence</span>
                <div className="text-lg font-bold text-[#17243B]">
                  {Math.round(selectedRecord.confidence_score * 100)}%
                </div>
              </div>
            </div>

            {/* Probability Bars */}
            {selectedRecord.all_scores && selectedRecord.all_scores.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#66758A] uppercase">
                  Full Probability Vector
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedRecord.all_scores.map((s, idx) => {
                    const conf = getEmotionConfig(s.label);
                    const pct = Math.round(s.score * 100);
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize text-[#17243B] font-medium">
                            {conf.label}
                          </span>
                          <span className="font-semibold text-[#66758A]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#F1F4F8] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: conf.barColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>Model: {selectedRecord.model_name}</span>
              <span>{new Date(selectedRecord.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="surface-card bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E2E8F0] shadow-xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#FCE8ED] text-[#C9475B] flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243B]">Delete Record #{deleteConfirmId}?</h3>
              <p className="text-xs text-[#66758A] mt-1">
                This action permanently removes this classification entry from your database history.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#66758A] bg-[#F5F7FA] hover:bg-[#E2E8F0] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C9475B] hover:bg-[#B33B4D] rounded-xl shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="surface-card bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E2E8F0] shadow-xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#FCE8ED] text-[#C9475B] flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243B]">Clear Entire History?</h3>
              <p className="text-xs text-[#66758A] mt-1">
                Are you sure you want to permanently delete all {total} recorded analyses from SQLite? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#66758A] bg-[#F5F7FA] hover:bg-[#E2E8F0] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C9475B] hover:bg-[#B33B4D] rounded-xl shadow-sm cursor-pointer"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
