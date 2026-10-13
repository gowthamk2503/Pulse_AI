import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2457D6] flex items-center justify-center text-white">
                <Activity className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#17243B]">
                pulse<span className="text-[#2457D6]">ai</span>
              </span>
            </div>
            <p className="text-sm text-[#66758A] max-w-sm leading-relaxed">
              Paper & Pulse — AI-powered emotion intelligence designed for clarity. Turn customer reviews, feedback, and conversations into structured emotional insights.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-[#16856B]" />
              <span>Transformer Model: DistilRoBERTa (Emotion Fine-Tuned)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17243B] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-[#66758A]">
              <li>
                <a href="#features" className="hover:text-[#2457D6] transition-colors">
                  Product Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#2457D6] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-[#2457D6] transition-colors">
                  Live Interactive Demo
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-[#2457D6] transition-colors">
                  Use Cases
                </a>
              </li>
            </ul>
          </div>

          {/* Authentication & Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17243B] mb-3">
              Access
            </h4>
            <ul className="space-y-2 text-sm text-[#66758A]">
              <li>
                <Link to="/login" className="hover:text-[#2457D6] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#2457D6] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-[#2457D6] transition-colors">
                  Quick Text Analysis
                </Link>
              </li>
              <li>
                <Link to="/batch-analysis" className="hover:text-[#2457D6] transition-colors">
                  Batch CSV Pipeline
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} PulseAI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-[#C9475B] fill-current" /> for emotional intelligence and clarity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
