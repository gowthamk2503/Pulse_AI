import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Trash2,
  LogOut,
  Check,
  AlertCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [clearing, setClearing] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await updateProfile({ full_name: fullName.trim() });
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to purge all your saved analysis records?')) return;
    setClearing(true);
    try {
      await api.clearHistory();
      setSuccessMsg('Analysis history database purged successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setErrorMsg('Failed to purge history.');
    } finally {
      setClearing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF1FF] text-[#2457D6] text-xs font-semibold mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          Workspace Preferences
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243B] tracking-tight">
          Settings
        </h2>
        <p className="text-sm text-[#66758A]">
          Manage your account profile, persistent database history, and workspace preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#DDF6EC] border border-[#B4EBD5] text-[#16856B] text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FCE8ED] border border-[#F7C4CE] text-[#C9475B] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="surface-card p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl bg-white space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] text-[#2457D6] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17243B]">User Profile</h3>
            <p className="text-xs text-[#66758A]">Update your display name and view identity details</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17243B] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2.5 text-xs text-[#66758A] bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl cursor-not-allowed"
            />
            <span className="text-[11px] text-[#94A3B8] mt-1 block">
              Email address is your primary account identifier and cannot be changed.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#17243B] mb-1.5">
              Full Display Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 text-xs text-[#17243B] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#2457D6] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !fullName.trim() || fullName === user?.full_name}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2457D6] hover:bg-[#1948BB] rounded-xl shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Model & AI Configuration Details */}
      <div className="surface-card p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#DDF6EC] text-[#16856B] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17243B]">Configured AI Model</h3>
            <p className="text-xs text-[#66758A]">Transformer checkpoint used for affective classification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl">
            <span className="text-[#66758A] font-medium">Model Checkpoint:</span>
            <p className="text-[#17243B] font-bold mt-0.5">j-hartmann/emotion-english-distilroberta-base</p>
          </div>
          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl">
            <span className="text-[#66758A] font-medium">Emotion Taxonomy:</span>
            <p className="text-[#17243B] font-bold mt-0.5">Anger, Disgust, Fear, Joy, Neutral, Sadness, Surprise</p>
          </div>
          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl">
            <span className="text-[#66758A] font-medium">Inference Architecture:</span>
            <p className="text-[#17243B] font-bold mt-0.5">PyTorch TorchScript / Inference Mode (No Gradient)</p>
          </div>
          <div className="p-3 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl">
            <span className="text-[#66758A] font-medium">License & Access:</span>
            <p className="text-[#17243B] font-bold mt-0.5">Open Weights (Apache-2.0 / MIT Compatible)</p>
          </div>
        </div>
      </div>

      {/* Data and History Management */}
      <div className="surface-card p-6 sm:p-8 border border-[#E2E8F0] rounded-2xl bg-white space-y-4">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E3] text-[#B96B26] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17243B]">Data & Storage Controls</h3>
            <p className="text-xs text-[#66758A]">Manage local SQLite history database records</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0]">
          <div>
            <h4 className="text-xs font-bold text-[#17243B]">Purge Analysis History</h4>
            <p className="text-xs text-[#66758A] mt-0.5">
              Permanently delete all single and batch inference history stored in your SQLite database.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#C9475B] bg-white hover:bg-[#FCE8ED] border border-[#E2E8F0] hover:border-[#F7C4CE] rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {clearing ? 'Purging...' : 'Purge History'}
          </button>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="surface-card p-6 border border-[#E2E8F0] rounded-2xl bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#17243B]">Sign Out</h3>
          <p className="text-xs text-[#66758A]">End your current authenticated browser session</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C9475B] hover:bg-[#B33B4D] rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
