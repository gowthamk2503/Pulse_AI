import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, Cpu, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import EmotionBadge from '../common/EmotionBadge';
import { getEmotionConfig } from '../../utils/emotionTheme';

const SAMPLE_TEXTS = [
  {
    title: "Delighted Customer",
    text: "I am absolutely thrilled with the customer support and product speed! Everything exceeded my expectations.",
  },
  {
    title: "Frustrated Review",
    text: "I am completely furious about the unexpected downtime and unresponsive help desk. Unacceptable service.",
  },
  {
    title: "Surprised Feedback",
    text: "I was stunned by how quickly the analytics refreshed! I certainly did not anticipate such rapid processing.",
  },
  {
    title: "Neutral Inquiry",
    text: "The package was delivered on Wednesday morning and matches the model specifications in the invoice.",
  },
];

export const InteractivePreview = () => {
  const [text, setText] = useState(SAMPLE_TEXTS[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeText(text, false);
      setResult(res.data);
    } catch (err) {
      console.error("Live preview error:", err);
      setError("Unable to run live inference. Please ensure the backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="interactive-demo" className="surface-card p-6 md:p-8 max-w-4xl mx-auto border border-[#E2E8F0] rounded-2xl bg-white shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1FF] text-[#2457D6] text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Live Inference
          </div>
          <h3 className="text-xl font-bold text-[#17243B]">
            Test Real-Time Emotion Classification
          </h3>
          <p className="text-sm text-[#66758A] mt-1">
            Choose a preset or type any customer feedback to evaluate model scores directly.
          </p>
        </div>
        <div className="text-xs text-[#94A3B8] font-medium bg-[#F5F7FA] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
          Model: DistilRoBERTa Emotion
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="py-4 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-[#66758A] self-center mr-1">
          Preset Examples:
        </span>
        {SAMPLE_TEXTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(sample.text);
              setResult(null);
              setError(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              text === sample.text
                ? 'bg-[#EAF1FF] text-[#2457D6] border-[#2457D6] font-semibold'
                : 'bg-white text-[#66758A] border-[#E2E8F0] hover:bg-[#F5F7FA]'
            }`}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full p-4 text-sm text-[#17243B] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] outline-none transition-all placeholder:text-[#94A3B8] resize-none"
            placeholder="Type or paste customer feedback text here..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-[#94A3B8]">
            {text.length} characters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">
            Analyzes expressiveness across 7 emotions
          </span>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2457D6] hover:bg-[#1948BB] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Sample
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Inference Output */}
      {result && (
        <div className="mt-6 pt-6 border-t border-[#E2E8F0] space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-medium text-[#66758A]">
                Predicted Dominant Emotion
              </span>
              <div className="flex items-center gap-2 mt-1">
                <EmotionBadge
                  emotion={result.dominant_emotion}
                  score={result.confidence}
                  size="lg"
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-[#66758A]">Confidence Level</span>
              <div className="text-lg font-bold text-[#17243B]">
                {Math.round(result.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Full Distribution Bars */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-[#66758A] uppercase tracking-wider">
              Model Probability Distribution
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {result.predictions.map((p, i) => {
                const conf = getEmotionConfig(p.label);
                const pct = Math.round(p.score * 100);
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#17243B] capitalize">
                        {conf.label}
                      </span>
                      <span className="font-semibold text-[#66758A]">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
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

          <p className="text-[11px] text-[#94A3B8] italic pt-2">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractivePreview;
