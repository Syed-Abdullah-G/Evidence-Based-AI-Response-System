import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  X,
  AlertCircle,
  Sparkles,
  Edit2,
  GraduationCap
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    adminPassword,
    setAdminPassword,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
  } = useAdminAuth();

  const [copied, setCopied] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>(adminPassword);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);

  if (!isAdminModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(adminPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.trim()) {
      setAdminPassword(newPasswordInput.trim());
      setIsEditing(false);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white flex items-center space-x-2">
                <span>Department Staff Admin Security</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Student Aadhaar & PII Privacy Shield
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminModalOpen(false)}
            aria-label="Close Admin Modal"
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${
              isAdminAuthenticated
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isAdminAuthenticated ? (
                <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-semibold block">
                  {isAdminAuthenticated ? 'Department Admin: Unlocked' : 'Department Admin: Locked'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isAdminAuthenticated
                    ? 'Student Aadhaar & Bank A/C unmasked'
                    : 'Aadhaar details locked & blurred'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  logoutAdmin();
                } else {
                  loginAdmin();
                }
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                isAdminAuthenticated
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-xs'
              }`}
            >
              {isAdminAuthenticated ? 'Lock Session' : 'Quick Unlock'}
            </button>
          </div>

          {/* Admin Password Showcase Card */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Department Master Admin Password</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 p-1 text-[11px] flex items-center space-x-1 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px]">{showPassword ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setNewPasswordInput(adminPassword);
                  }}
                  className="text-slate-500 hover:text-slate-800 p-1 text-[11px] flex items-center space-x-1 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title="Change Password"
                >
                  <Edit2 className="w-3 h-3" />
                  <span className="text-[10px]">Edit</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveNewPassword} className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    placeholder="Enter new admin password..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded font-medium cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-2.5 py-1.5 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-md p-2.5 shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-slate-900 select-all">
                    {showPassword ? adminPassword : '••••••••••••'}
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">
                    MASTER KEY
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {editSuccess && (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1 animate-in fade-in">
                <Check className="w-3 h-3" />
                <span>Admin password updated successfully!</span>
              </div>
            )}
          </div>

          {/* Usage Instructions for College Staff */}
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>College Staff Guidelines:</strong> Used by newly joined department faculty & HOD to unmask confidential student <strong>Aadhaar UID/VID</strong>, <strong>PAN Card</strong>, and <strong>Disbursal Bank Accounts</strong> when preparing the official Alumni Success Meet citation and honorarium vouchers.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-500">
                All student PII unmasking actions are cryptographically hashed and logged to the departmental audit ledger.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500 inline" />
            <span>EduCite Department Gateway</span>
          </span>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
