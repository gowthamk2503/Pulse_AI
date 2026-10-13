import React from 'react';
import { Sparkles, MessageSquare, BarChart2, Shield } from 'lucide-react';
import EmotionBadge from '../common/EmotionBadge';

export const HeroPreviewCard = () => {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Decorative subtle background pastel blob */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#EAF1FF] via-[#DDF6EC] to-[#F0ECFF] rounded-3xl blur-xl opacity-60 -z-10" />

      {/* Main Surface Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-[#17243B]/5 p-6 space-y-5">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16856B]" />
            <span className="text-xs font-semibold text-[#17243B] uppercase tracking-wider">
              Live Model Preview
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#66758A] bg-[#F1F4F8] px-2 py-0.5 rounded-md">
            Illustrative Sample
          </span>
        </div>

        {/* Sample Customer Input */}
        <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#66758A]">
            <MessageSquare className="w-3.5 h-3.5 text-[#2457D6]" />
            <span className="font-medium">Customer Feedback #4829</span>
          </div>
          <p className="text-sm text-[#17243B] font-normal leading-relaxed italic">
            “The new onboarding flow is remarkably smooth. Our whole team was up and running in minutes, and support was genuinely delightful!”
          </p>
        </div>

        {/* Emotion Classification Result */}
        <div className="space-y-3 bg-white border border-[#E2E8F0] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#66758A]">Predicted Dominant Emotion</span>
            <EmotionBadge emotion="joy" score={0.96} size="md" />
          </div>

          {/* Model confidence bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#66758A]">Model Confidence</span>
              <span className="font-semibold text-[#16856B]">96.4%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#16856B] h-2 rounded-full transition-all duration-1000"
                style={{ width: '96.4%' }}
              />
            </div>
          </div>

          {/* Secondary emotion probabilities */}
          <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#FFF0E3] text-[#B96B26] border border-[#FEDCC0] p-1.5 rounded-lg">
              <div className="text-[10px] font-medium uppercase">Surprise</div>
              <div className="font-bold text-xs">2.1%</div>
            </div>
            <div className="bg-[#F1F4F8] text-[#5A687D] border border-[#DCE2EB] p-1.5 rounded-lg">
              <div className="text-[10px] font-medium uppercase">Neutral</div>
              <div className="font-bold text-xs">1.2%</div>
            </div>
            <div className="bg-[#FCE8ED] text-[#C9475B] border border-[#F7C4CE] p-1.5 rounded-lg">
              <div className="text-[10px] font-medium uppercase">Anger</div>
              <div className="font-bold text-xs">0.3%</div>
            </div>
          </div>
        </div>

        {/* Footer Model info */}
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#2457D6]" />
            DistilRoBERTa Emotion Model
          </span>
          <span>Zero-shot fine-tuned</span>
        </div>
      </div>
    </div>
  );
};

export default HeroPreviewCard;
