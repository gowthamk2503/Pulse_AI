import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Gauge,
  FileSpreadsheet,
  BarChart3,
  Search,
  Download,
  FileText,
  Cpu,
  LineChart,
  Users,
  Compass,
  MessageCircle,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroPreviewCard from '../components/landing/HeroPreviewCard';
import InteractivePreview from '../components/landing/InteractivePreview';
import FeatureCard from '../components/landing/FeatureCard';
import HowItWorksStep from '../components/landing/HowItWorksStep';
import UseCaseCard from '../components/landing/UseCaseCard';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#17243B] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* 4.2 HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF1FF] border border-[#C8DCFF] text-[#2457D6] text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-POWERED EMOTION INTELLIGENCE
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17243B] tracking-tight leading-[1.12]">
                  Understand the emotion behind{' '}
                  <span className="text-[#2457D6] relative">
                    every word.
                    <span className="absolute left-0 bottom-1 w-full h-1 bg-[#2457D6]/20 rounded-full" />
                  </span>
                </h1>

                <p className="text-lg text-[#66758A] max-w-xl leading-relaxed">
                  Turn customer reviews, feedback, and conversations into clear emotional insights with AI-powered text analysis.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    to="/analyze"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-md shadow-[#2457D6]/20 transition-all cursor-pointer"
                  >
                    Start Analyzing
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#features"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-[#17243B] bg-white hover:bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Explore Features
                  </a>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-[#66758A] pt-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16856B]" />
                  <span>Built for clearer insights from customer feedback.</span>
                </div>
              </div>

              {/* Right Column Product Preview */}
              <div className="lg:col-span-5">
                <HeroPreviewCard />
              </div>
            </div>
          </div>
        </section>

        {/* 4.3 TRUST AND VALUE STRIP */}
        <section className="border-y border-[#E2E8F0] bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#17243B]">Text Understanding</div>
                  <div className="text-xs text-[#66758A]">Input any raw feedback</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DDF6EC] text-[#16856B] flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#17243B]">Emotion Classification</div>
                  <div className="text-xs text-[#66758A]">Pretrained transformer model</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0E3] text-[#B96B26] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#17243B]">Batch CSV Analysis</div>
                  <div className="text-xs text-[#66758A]">Process entire datasets</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0ECFF] text-[#7C5CBF] flex items-center justify-center shrink-0">
                  <LineChart className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#17243B]">Actionable Insights</div>
                  <div className="text-xs text-[#66758A]">Clean visual analytics</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4.4 FEATURES SECTION */}
        <section id="features" className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2457D6] bg-[#EAF1FF] px-3 py-1 rounded-full">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243B] tracking-tight">
                From raw feedback to emotional clarity.
              </h2>
              <p className="text-base text-[#66758A]">
                Explore the emotional signals hidden in the words your customers share.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Brain}
                title="Emotion Detection"
                description="Analyze text using a transformer-based emotion classification model fine-tuned for high-precision affective nuances."
                badgeColor="#DDF6EC"
                iconColor="#16856B"
              />
              <FeatureCard
                icon={Gauge}
                title="Confidence Scores"
                description="Inspect model probability scores alongside predicted emotion labels to understand classification confidence."
                badgeColor="#EAF1FF"
                iconColor="#2457D6"
              />
              <FeatureCard
                icon={FileSpreadsheet}
                title="Batch CSV Analysis"
                description="Process multiple customer feedback records, survey outputs, and review spreadsheets in a unified workflow."
                badgeColor="#FFF0E3"
                iconColor="#B96B26"
              />
              <FeatureCard
                icon={BarChart3}
                title="Visual Analytics"
                description="Explore emotion distributions and aggregate patterns through modern interactive charts and breakdown cards."
                badgeColor="#F0ECFF"
                iconColor="#7C5CBF"
              />
              <FeatureCard
                icon={Search}
                title="Search and Filtering"
                description="Find relevant predictions quickly by emotion category, text keywords, and confidence thresholds."
                badgeColor="#FCE8ED"
                iconColor="#C9475B"
              />
              <FeatureCard
                icon={Download}
                title="Exportable Results"
                description="Download processed datasets with predicted emotions and model scores as structured CSV files."
                badgeColor="#F1F4F8"
                iconColor="#5A687D"
              />
            </div>
          </div>
        </section>

        {/* 4.5 HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2457D6] bg-[#EAF1FF] px-3 py-1 rounded-full">
                Simple Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243B] tracking-tight">
                Three steps from text to insight.
              </h2>
              <p className="text-base text-[#66758A]">
                Turn unstructured text into structured emotion intelligence in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <HowItWorksStep
                stepNumber="1"
                title="Bring your text"
                description="Enter a single sentence, review, or upload a CSV dataset containing customer feedback messages."
                icon={FileText}
              />
              <HowItWorksStep
                stepNumber="2"
                title="Analyze with AI"
                description="The configured transformer emotion classification model evaluates language patterns and affective signals."
                icon={Cpu}
              />
              <HowItWorksStep
                stepNumber="3"
                title="Explore the results"
                description="View emotion labels, confidence scores, interactive distribution charts, and download enriched data."
                icon={LineChart}
              />
            </div>
          </div>
        </section>

        {/* 4.6 INTERACTIVE PRODUCT PREVIEW */}
        <section className="py-20 md:py-28 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <InteractivePreview />
          </div>
        </section>

        {/* 4.7 USE CASES */}
        <section id="use-cases" className="py-20 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2457D6] bg-[#EAF1FF] px-3 py-1 rounded-full">
                Practical Applications
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243B] tracking-tight">
                Built for customer-centric teams.
              </h2>
              <p className="text-base text-[#66758A]">
                Explore potential applications of text emotion intelligence across your organization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <UseCaseCard
                icon={Users}
                badge="Customer Experience"
                title="Customer Experience"
                description="Explore customer feedback across reviews and surveys to spot patterns of joy, surprise, or friction."
              />
              <UseCaseCard
                icon={Compass}
                badge="Product Research"
                title="Product Research"
                description="Understand user sentiment and emotional reactions to new feature releases and redesigns."
              />
              <UseCaseCard
                icon={MessageCircle}
                badge="Brand Monitoring"
                title="Brand Monitoring"
                description="Review emotional patterns in public mentions and inbound customer feedback."
              />
              <UseCaseCard
                icon={Headphones}
                badge="Support Analysis"
                title="Support Analysis"
                description="Identify potentially frustrated customer messages to prioritize empathetic resolution."
              />
            </div>

            <p className="text-center text-xs text-[#94A3B8] italic mt-10">
              Note: PulseAI classifies emotions expressed in text, rather than inferring a person's inner psychological state.
            </p>
          </div>
        </section>

        {/* 4.8 FINAL CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-[#F5F7FA] to-white border-t border-[#E2E8F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17243B] tracking-tight">
              Make every piece of feedback more meaningful.
            </h2>
            <p className="text-base sm:text-lg text-[#66758A] max-w-2xl mx-auto leading-relaxed">
              Start exploring emotion classification and customer feedback analytics with PulseAI today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-md shadow-[#2457D6]/20 transition-all cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-[#17243B] bg-white hover:bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
