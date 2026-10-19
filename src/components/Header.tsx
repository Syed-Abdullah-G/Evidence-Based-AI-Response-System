import React from 'react';
import { Search, FileText, Bell, User, Upload, ArrowRight, ShieldCheck, GraduationCap, Award } from 'lucide-react';
import { AnalysisResult, SupportedLanguage } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { useAdminAuth } from '../context/AdminAuthContext';

interface HeaderProps {
  activeTab: 'case-review' | 'verified-records';
  setActiveTab: (tab: 'case-review' | 'verified-records') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onExportPDF: () => void;
  onOpenUpload: () => void;
  latestResult: AnalysisResult | null;
  verifiedCount: number;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onExportPDF,
  onOpenUpload,
  latestResult,
  verifiedCount,
  currentLanguage,
  onSelectLanguage,
}) => {
  const { isAdminAuthenticated, setIsAdminModalOpen, adminPassword } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand + Navigation Tabs */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif font-black text-sm shadow-xs">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-slate-900 tracking-tight block leading-tight">
              Fact Trace
            </span>
          </div>
        </div>

        <nav className="flex space-x-5 text-sm font-medium">
          <button
            id="tab-case-review"
            onClick={() => setActiveTab('case-review')}
            className={`pb-4 pt-4 border-b-2 transition-colors cursor-pointer text-xs sm:text-sm ${
              activeTab === 'case-review'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Record Review
          </button>

          <button
            id="tab-verified-records"
            onClick={() => setActiveTab('verified-records')}
            className={`pb-4 pt-4 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer text-xs sm:text-sm ${
              activeTab === 'verified-records'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Audit Ledger</span>
            {verifiedCount > 0 && (
              <span className="bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded-full font-mono font-medium">
                {verifiedCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Right: Search Box + Action Buttons + Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <form onSubmit={handleSubmit} className="relative w-48 sm:w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="header-global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search semester marks, B.E. projects, SIH..."
            className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-xs rounded-md pl-9 pr-8 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 font-sans"
          />
          {searchQuery && (
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Multilingual Selector */}
        <LanguageSelector
          currentLanguage={currentLanguage}
          onSelectLanguage={onSelectLanguage}
          variant="header"
        />

        {/* Admin Dashboard Button */}
        <button
          id="btn-admin-dashboard"
          onClick={() => setIsAdminModalOpen(true)}
          title="Open Department Admin Security Panel (View Admin Password for student Aadhaar)"
          className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border transition-all cursor-pointer shadow-xs ${
            isAdminAuthenticated
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isAdminAuthenticated ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>Admin</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
            isAdminAuthenticated
              ? 'bg-emerald-200/80 text-emerald-950'
              : 'bg-amber-200/80 text-amber-950'
          }`}>
            {isAdminAuthenticated ? 'UNLOCKED' : 'KEY'}
          </span>
        </button>

        <button
          id="btn-upload-custom-doc"
          onClick={onOpenUpload}
          title="Upload or paste custom student records"
          className="hidden md:inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 rounded-md transition-colors cursor-pointer border border-slate-200"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Record</span>
        </button>

        <button
          id="btn-export-pdf-header"
          onClick={onExportPDF}
          title="Export Verified Student Citation Dossier to PDF"
          className="flex items-center space-x-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-md transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Citation PDF</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        <button
          id="btn-notifications"
          aria-label="Notifications"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute top-1.5 right-1.5" />
        </button>

        <button
          id="btn-user-profile"
          aria-label="Faculty Profile"
          title="Dept. Staff Session"
          className="p-1 text-slate-600 hover:text-slate-900 rounded-full border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[11px]">
            HOD
          </div>
        </button>
      </div>
    </header>
  );
};
