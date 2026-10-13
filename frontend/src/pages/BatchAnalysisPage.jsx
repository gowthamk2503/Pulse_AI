import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Trash2,
  FileText,
  BarChart2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import EmotionBadge from '../components/common/EmotionBadge';
import EmotionPieChart from '../components/dashboard/EmotionPieChart';
import EmotionBarChart from '../components/dashboard/EmotionBarChart';
import MetricCard from '../components/dashboard/MetricCard';
import { getEmotionConfig } from '../utils/emotionTheme';

export const BatchAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Filters for results table
  const [searchFilter, setSearchFilter] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');

  const fileInputRef = useRef(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid CSV file (.csv).');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResults(null);
    setPreviewLoading(true);

    try {
      const res = await api.previewCSV(selectedFile);
      setPreview(res.data);
      if (res.data.suggested_text_columns?.length > 0) {
        setSelectedColumn(res.data.suggested_text_columns[0]);
      } else if (res.data.columns?.length > 0) {
        setSelectedColumn(res.data.columns[0]);
      }
    } catch (err) {
      console.error('CSV Preview failed:', err);
      const msg = err.response?.data?.detail || 'Failed to inspect CSV file.';
      setError(msg);
      setFile(null);
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file || !selectedColumn) {
      setError('Please select a text column to analyze.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.analyzeBatch(file, selectedColumn, true);
      setResults(res.data);
    } catch (err) {
      console.error('Batch analysis failed:', err);
      const msg = err.response?.data?.detail || 'Batch analysis failed on server.';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSelectedColumn('');
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadEnrichedCSV = () => {
    if (!results || !results.results) return;

    const headers = ['Row', 'Text', 'Predicted_Emotion', 'Confidence'];
    const rows = results.results.map((r) => [
      r.row_index,
      `"${r.text.replace(/"/g, '""')}"`,
      r.predicted_emotion,
      r.confidence,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pulseai_enriched_${file?.name || 'dataset.csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredRows = (results?.results || []).filter((r) => {
    const matchesSearch = searchFilter
      ? r.text.toLowerCase().includes(searchFilter.toLowerCase())
      : true;
    const matchesEmotion =
      emotionFilter === 'all'
        ? true
        : r.predicted_emotion.toLowerCase() === emotionFilter.toLowerCase();
    return matchesSearch && matchesEmotion;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0E3] text-[#B96B26] text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Batch Dataset Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
            Batch CSV Analysis
          </h2>
          <p className="text-sm text-[#66758A]">
            Upload customer feedback datasets, customer reviews, or surveys for high-throughput emotion classification.
          </p>
        </div>

        {/* Sample download button */}
        <a
          href="/sample_customer_feedback.csv"
          download
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2457D6] bg-[#EAF1FF] hover:bg-[#D5E3FF] rounded-xl transition-colors shrink-0 self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5" />
          Download Sample CSV
        </a>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Configuration Card */}
      {!results && (
        <div className="surface-card p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl bg-white shadow-sm space-y-6">
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2457D6] rounded-2xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all bg-[#F5F7FA]/50 hover:bg-[#EAF1FF]/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div className="w-14 h-14 rounded-2xl bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center mb-4 shadow-xs">
                <Upload className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h4 className="text-base font-bold text-[#17243B] mb-1">
                Drag and drop your CSV dataset here
              </h4>
              <p className="text-xs text-[#66758A] max-w-sm mb-4">
                Supports standard comma-separated text files up to 20MB. Automatically detects text columns.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#2457D6] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F5F7FA] shadow-xs"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DDF6EC] text-[#16856B] flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#17243B]">{file.name}</div>
                    <div className="text-xs text-[#66758A]">
                      {(file.size / 1024).toFixed(1)} KB • {preview?.total_rows || 0} rows detected
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 text-[#66758A] hover:text-[#C9475B] transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {previewLoading ? (
                <div className="py-8 text-center text-xs text-[#66758A]">
                  Inspecting CSV headers and content...
                </div>
              ) : preview && (
                <div className="space-y-5">
                  {/* Column selection */}
                  <div className="bg-white p-4 border border-[#E2E8F0] rounded-xl space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17243B]">
                      Select Feedback Text Column
                    </label>
                    <p className="text-xs text-[#66758A]">
                      Choose which column in your CSV contains the sentences or reviews to analyze:
                    </p>
                    <select
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="w-full sm:w-80 mt-1 p-2.5 text-sm text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#2457D6] outline-none"
                    >
                      {preview.columns?.map((col) => (
                        <option key={col} value={col}>
                          {col} {preview.suggested_text_columns?.includes(col) ? ' (Suggested)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sample rows preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#66758A]">
                      First 5 Rows Preview
                    </span>
                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F5F7FA] text-[#66758A] border-b border-[#E2E8F0]">
                          <tr>
                            {preview.columns?.map((col) => (
                              <th
                                key={col}
                                className={`py-2 px-3 font-semibold ${
                                  col === selectedColumn ? 'text-[#2457D6] bg-[#EAF1FF]/50' : ''
                                }`}
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {preview.sample_rows?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#F5F7FA]">
                              {preview.columns?.map((col) => (
                                <td
                                  key={col}
                                  className={`py-2 px-3 max-w-xs truncate ${
                                    col === selectedColumn ? 'font-medium text-[#17243B]' : 'text-[#66758A]'
                                  }`}
                                >
                                  {String(row[col] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={analyzing || !selectedColumn}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#2457D6] hover:bg-[#1948BB] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#2457D6]/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {analyzing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Dataset with Transformer...
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          Analyze Dataset ({preview.total_rows} rows)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary KPI Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#16856B] bg-[#DDF6EC] px-2.5 py-0.5 rounded-full">
                Batch Inference Complete
              </span>
              <h3 className="text-xl font-bold text-[#17243B] mt-1">
                {file?.name || 'Processed Dataset'}
              </h3>
              <p className="text-xs text-[#66758A] mt-0.5">
                Model: {results.model_name} • Text column: <span className="font-semibold text-[#17243B]">{results.text_column}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#66758A] bg-[#F5F7FA] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Analyze Another
              </button>
              <button
                type="button"
                onClick={handleDownloadEnrichedCSV}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Enriched CSV
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Processed Rows"
              value={results.processed_rows.toLocaleString()}
              subtitle={`Out of ${results.total_rows} total rows`}
              icon={FileSpreadsheet}
              color="#2457D6"
              bg="#EAF1FF"
            />
            <MetricCard
              title="Dominant Emotion"
              value={results.dominant_emotion.toUpperCase()}
              subtitle="Highest frequency emotion"
              icon={CheckCircle2}
              color="#16856B"
              bg="#DDF6EC"
            />
            <MetricCard
              title="Average Confidence"
              value={`${Math.round(results.average_confidence * 100)}%`}
              subtitle="Mean model probability"
              icon={Cpu}
              color="#B96B26"
              bg="#FFF0E3"
            />
            <MetricCard
              title="Failed / Skipped"
              value={results.failed_rows.toString()}
              subtitle="Rows that could not be parsed"
              icon={AlertCircle}
              color="#66758A"
              bg="#F1F4F8"
            />
          </div>

          {/* Emotion Visual Distribution */}
          <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
            <h4 className="text-sm font-bold text-[#17243B]">
              Dataset Emotion Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {Object.entries(results.emotion_distribution).map(([emotion, count]) => {
                const conf = getEmotionConfig(emotion);
                const pct = Math.round((count / results.processed_rows) * 100);
                return (
                  <div
                    key={emotion}
                    className="p-3 rounded-xl border text-center space-y-1"
                    style={{ backgroundColor: conf.bg, borderColor: conf.border }}
                  >
                    <div className="text-[11px] font-bold uppercase" style={{ color: conf.text }}>
                      {conf.label}
                    </div>
                    <div className="text-lg font-black" style={{ color: conf.text }}>
                      {count}
                    </div>
                    <div className="text-[10px] opacity-75 font-medium" style={{ color: conf.text }}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Results Table */}
          <div className="surface-card border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h4 className="text-sm font-bold text-[#17243B]">
                  Row-by-Row Predictions ({filteredRows.length} shown)
                </h4>
                <p className="text-xs text-[#66758A]">
                  Filter and examine classification results for individual customer feedback items
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search feedback..."
                    className="pl-8 pr-3 py-1.5 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg outline-none focus:bg-white focus:border-[#2457D6]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#66758A]">
                  <Filter className="w-3.5 h-3.5" />
                  <select
                    value={emotionFilter}
                    onChange={(e) => setEmotionFilter(e.target.value)}
                    className="py-1.5 px-2 text-xs text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg outline-none"
                  >
                    <option value="all">All Emotions</option>
                    {Object.keys(results.emotion_distribution).map((em) => (
                      <option key={em} value={em}>
                        {em.charAt(0).toUpperCase() + em.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7FA] text-[#66758A] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-16">Row</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Feedback Content</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-36">Predicted Emotion</th>
                    <th className="py-2.5 px-3 font-semibold uppercase tracking-wider w-28">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredRows.map((r) => (
                    <tr key={r.row_index} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-3 text-[#94A3B8] font-mono">
                        #{r.row_index}
                      </td>
                      <td className="py-3 px-3 text-[#17243B] max-w-md font-medium leading-relaxed">
                        {r.text}
                      </td>
                      <td className="py-3 px-3">
                        <EmotionBadge emotion={r.predicted_emotion} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#17243B]">
                        {Math.round(r.confidence * 100)}%
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#94A3B8]">
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchAnalysisPage;
