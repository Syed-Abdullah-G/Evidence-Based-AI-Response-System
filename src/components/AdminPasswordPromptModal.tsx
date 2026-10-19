import React, { useState } from 'react';
import { Key, X, Check, Lock, Info, ExternalLink, GraduationCap } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminPasswordPromptModal: React.FC = () => {
  const {
    isPasswordPromptOpen,
    setIsPasswordPromptOpen,
    promptReason,
    verifyPassword,
    setIsAdminModalOpen,
    onAuthSuccessCallback,
    adminPassword,
  } = useAdminAuth();

  const [inputPassword, setInputPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isPasswordPromptOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword) {
      setErrorMessage('Please enter the Department Admin password.');
      return;
    }

    const isValid = verifyPassword(inputPassword);
    if (isValid) {
      setIsSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        setIsPasswordPromptOpen(false);
        setIsSuccess(false);
        setInputPassword('');
        if (onAuthSuccessCallback) {
          onAuthSuccessCallback();
        }
      }, 500);
    } else {
      setErrorMessage('Incorrect password. Click "Admin" in top bar to view or copy the active password.');
    }
  };

  const handleOpenAdminInfo = () => {
    setIsPasswordPromptOpen(false);
    setIsAdminModalOpen(true);
  };

  const handleQuickFill = () => {
    setInputPassword(adminPassword);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
                <span>Department Staff Auth</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-sans">
                Student Aadhaar & PII Privacy Shield
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPasswordPromptOpen(false);
              setErrorMessage('');
              setInputPassword('');
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1 text-left">
            <p className="text-xs font-semibold text-slate-800">
              Department Admin Password Required
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {promptReason || 'Department staff privileges are required to unmask and copy student Aadhaar, PAN, and bank details for the Alumni Success Meet.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span>Admin Master Password</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[10px] text-amber-700 hover:text-amber-800 hover:underline cursor-pointer font-medium"
              >
                Auto-fill ({adminPassword})
              </button>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter admin password..."
                autoFocus
                className="w-full bg-slate-50 focus:bg-white text-slate-900 font-mono text-xs rounded-md pl-9 pr-3 py-2 border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none transition-all"
              />
            </div>
            {errorMessage && (
              <p className="text-[11px] text-rose-600 font-medium pt-0.5 animate-in fade-in">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Helper box with link to Admin dashboard button */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>View or customize this credential in the </span>
              <button
                type="button"
                onClick={handleOpenAdminInfo}
                className="font-semibold underline text-amber-950 hover:text-amber-700 inline-flex items-center space-x-0.5 cursor-pointer"
              >
                <span>Admin</span>
                <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
              </button>
              <span> button in the top bar.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsPasswordPromptOpen(false);
                setErrorMessage('');
                setInputPassword('');
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:bg-emerald-600"
            >
              {isSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Authorized!</span>
                </>
              ) : (
                <span>Authorize & Unmask</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
