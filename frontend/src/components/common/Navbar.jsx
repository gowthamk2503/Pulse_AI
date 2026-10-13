import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#2457D6] flex items-center justify-center text-white shadow-sm group-hover:bg-[#1948BB] transition-colors">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#17243B]">
              pulse<span className="text-[#2457D6]">ai</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#66758A]">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#2457D6] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#2457D6] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('interactive-demo')}
              className="hover:text-[#2457D6] transition-colors cursor-pointer"
            >
              Live Demo
            </button>
            <button
              onClick={() => scrollToSection('use-cases')}
              className="hover:text-[#2457D6] transition-colors cursor-pointer"
            >
              Use Cases
            </button>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl transition-all shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3.5 py-2 text-sm font-medium text-[#66758A] hover:text-[#17243B] transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#17243B] hover:text-[#2457D6] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl transition-all shadow-sm shadow-[#2457D6]/20"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#66758A] hover:text-[#17243B] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E2E8F0] bg-white px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 text-base font-medium text-[#17243B]"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-base font-medium text-[#17243B]"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="block w-full text-left py-2 text-base font-medium text-[#17243B]"
          >
            Live Demo
          </button>
          <button
            onClick={() => scrollToSection('use-cases')}
            className="block w-full text-left py-2 text-base font-medium text-[#17243B]"
          >
            Use Cases
          </button>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-[#2457D6] rounded-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 text-center text-sm font-medium text-[#17243B] border border-[#E2E8F0] rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 text-center text-sm font-semibold text-white bg-[#2457D6] rounded-xl"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
