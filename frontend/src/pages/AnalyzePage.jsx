import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Info,
  Shield,
  BarChart2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import EmotionBadge from '../components/common/EmotionBadge';
import { getEmotionConfig } from '../utils/emotionTheme';

const EXAMPLES = [
  {
    title: 'Delight / Satisfaction',
    text: 'I am totally blown away by how easy and intuitive this platform is! Support replied within 2 minutes and resolved my ticket.',
  },
  {
    title: 'Anger / Frustration',
    text: 'This is the third time our scheduled export has crashed without an error code. Extremely dissatisfied with this software.',
  },
  {
    title: 'Surprise / Novelty',
    text: 'I honestly did not anticipate seeing real-time emotion probability distributions right out of the box! Pleasantly shocked.',
  },
  {
    title: 'Fear / Anxiety',
    text: 'We are very worried that the upcoming server migration might cause database corruption and critical downtime for our users.',
  },
  {
    title: 'Sadness / Regret',
    text: 'I am so disappointed that the legacy export features were removed. We have relied on them for years.',
  },
  {
    title: 'Neutral / Informational',
    text: 'The shipment arrived on Thursday at 2:00 PM and includes two serial cables and one power adapter.',
  },
];

export const AnalyzePage = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please enter feedback text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeText(trimmed, true);
      setResult(res.data);
    } catch (err) {
      console.error('Text analysis failed:', err);
      const msg = err.response?.data?.detail || 'Inference request failed. Please check backend connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `Emotion: ${result.dominant_emotion} (${Math.round(result.confidence * 100)}%)\nText: "${result.text}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#2457D6] text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          Transformer Emotion Pipeline
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
          Analyze Text
        </h2>
        <p className="text-sm text-[#66758A] max-w-2xl">
          Evaluate nuanced emotional signals in customer reviews, survey responses, and feedback with transformer AI inference.
        </p>
      </div>

      {/* Main Workspace Split or Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Input */}
        <div className="lg:col-span-7 space-y-5">
          <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17243B]">
                Customer Text / Feedback Input
              </label>
              <span className="text-xs text-[#94A3B8]">
                {text.length} / 5000 characters
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              rows={6}
              maxLength={5000}
              placeholder="Paste or type customer review, support ticket, or feedback message here..."
              className="w-full p-4 text-sm text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition-all placeholder:text-[#94A3B8] resize-none leading-relaxed"
            />

            {/* Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#66758A]">
                Try realistic sample reviews:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setText(ex.text);
                      setError(null);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F5F7FA] hover:bg-[#EAF1FF] hover:text-[#2457D6] border border-[#E2E8F0] text-[#66758A] transition-colors cursor-pointer"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleClear}
                disabled={!text && !result}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#66758A] hover:text-[#C9475B] transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2457D6] hover:bg-[#1948BB] text-white text-sm font-semibold rounded-xl shadow-sm shadow-[#2457D6]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running Inference...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Emotion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Results */}
        <div className="lg:col-span-5 space-y-5">
          {!result && !loading && (
            <div className="surface-card-static p-8 border border-[#E2E8F0] rounded-2xl bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center mx-auto">
                <BarChart2 className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="text-sm font-bold text-[#17243B]">
                Awaiting Analysis
              </h4>
              <p className="text-xs text-[#66758A] leading-relaxed max-w-xs mx-auto">
                Enter text on the left and select "Analyze Emotion" to generate genuine transformer emotion predictions.
              </p>
            </div>
          )}

          {loading && (
            <div className="surface-card-static p-12 border border-[#E2E8F0] rounded-2xl bg-white text-center">
              <div className="w-8 h-8 border-3 border-[#EAF1FF] border-t-[#2457D6] rounded-full animate-spin mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#17243B]">
                Evaluating Text Expression...
              </h4>
              <p className="text-xs text-[#66758A] mt-1">
                DistilRoBERTa emotion classifier is computing tensor probabilities
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#17243B]">
                  Model Inference Result
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-[#66758A] hover:text-[#2457D6] transition-colors cursor-pointer"
                  title="Copy results"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16856B]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Dominant Prediction Badge */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
                <div>
                  <span className="text-xs text-[#66758A] font-medium">Dominant Emotion</span>
                  <div className="mt-1">
                    <EmotionBadge
                      emotion={result.dominant_emotion}
                      score={result.confidence}
                      size="lg"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#66758A] font-medium">Confidence</span>
                  <div className="text-xl font-black text-[#17243B]">
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Full probability breakdown */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#66758A]">
                  All Emotion Probabilities
                </span>
                <div className="space-y-2">
                  {result.predictions.map((p, idx) => {
                    const conf = getEmotionConfig(p.label);
                    const pct = Math.round(p.score * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#17243B] capitalize flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: conf.barColor }}
                            />
                            {conf.label}
                          </span>
                          <span className="font-semibold text-[#66758A]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#F1F4F8] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: conf.barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model identifier and disclaimer */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-[11px] text-[#94A3B8]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-medium text-[#66758A]">
                    <Shield className="w-3.5 h-3.5 text-[#2457D6]" />
                    {result.model}
                  </span>
                  <span>Auto-saved to history</span>
                </div>
                <p className="italic leading-relaxed">
                  {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
