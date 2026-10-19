import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  FileSearch, 
  Send, 
  Download, 
  Sparkles, 
  Info, 
  ArrowRight, 
  RotateCcw, 
  BookmarkCheck,
  Check,
  ChevronRight,
  HelpCircle,
  Clock,
  Globe,
  Languages,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  GraduationCap,
  Award
} from 'lucide-react';
import { AnalysisResult, SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { SensitiveTextRenderer } from './SensitiveTextRenderer';
import { detectSensitivePII } from '../utils/piiDetector';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AIAnalysisPanelProps {
  currentQuery: string;
  result: AnalysisResult | null;
  isLoading: boolean;
  onAskQuestion: (query: string) => void;
  onExportPDF: () => void;
  onOpenStepsModal: () => void;
  onViewRelatedSection: (sectionName: string) => void;
  onLogNullFinding: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  currentQuery,
  result,
  isLoading,
  onAskQuestion,
  onExportPDF,
  onOpenStepsModal,
  onViewRelatedSection,
  onLogNullFinding,
  currentLanguage,
  onSelectLanguage,
}) => {
  const { isAdminAuthenticated, requestAdminAuthorization } = useAdminAuth();
  const [inputValue, setInputValue] = useState<string>('');
  const [nullFindingLogged, setNullFindingLogged] = useState<boolean>(false);
  const [isGloballyUnmasked, setIsGloballyUnmasked] = useState<boolean>(false);

  const isPIIPresent = Boolean(
    result?.hasSensitiveData ||
    (result?.answer && detectSensitivePII(result.answer)) ||
    (currentQuery && detectSensitivePII(currentQuery))
  );

  const handleToggleGlobalUnmask = () => {
    if (isGloballyUnmasked) {
      setIsGloballyUnmasked(false);
    } else {
      if (!isAdminAuthenticated) {
        requestAdminAuthorization('Unmask and view confidential student Aadhaar & identifiers', () => {
          setIsGloballyUnmasked(true);
        });
      } else {
        setIsGloballyUnmasked(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onAskQuestion(inputValue.trim());
      setInputValue('');
      setNullFindingLogged(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    onAskQuestion(prompt);
    setNullFindingLogged(false);
  };

  const handleNullLogClick = () => {
    onLogNullFinding();
    setNullFindingLogged(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Header Bar */}
      <div className="h-12 border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between text-xs font-semibold text-slate-800 select-none bg-white">
        <div className="flex items-center space-x-2">
          {result && !result.found ? (
            <FileSearch className="w-4 h-4 text-slate-700" />
          ) : (
            <Bot className="w-4 h-4 text-slate-700" />
          )}
          <span className="uppercase tracking-wider font-sans">
            {result && !result.found ? 'AUDIT FINDING' : 'Staff Citation Engine'}
          </span>
          {isPIIPresent && (
            <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-medium">
              <Lock className="w-2.5 h-2.5 text-amber-700" />
              <span>Aadhaar Shield Active</span>
            </span>
          )}
        </div>

        {/* Right side of header: Language Selector & Timestamp */}
        <div className="flex items-center space-x-3">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onSelectLanguage={onSelectLanguage}
            variant="pill"
          />

          {result && (
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3" />
              <span>{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Faculty Query Bubble */}
        {(currentQuery || result?.query) && (
          <div className="flex justify-end animate-in fade-in slide-in-from-top-1">
            <div className="bg-slate-100 text-slate-800 text-sm font-sans px-5 py-3 rounded-2xl rounded-tr-sm max-w-[90%] shadow-xs leading-relaxed">
              <SensitiveTextRenderer
                text={currentQuery || result?.query || ''}
                isGloballyUnmasked={isGloballyUnmasked}
              />
            </div>
          </div>
        )}

        {/* Language Quick-Switch Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs select-none">
          <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 mr-1 flex-shrink-0">
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>Translate:</span>
          </span>
          <div className="flex space-x-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1 ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={`Switch response to ${lang.name} (${lang.nativeName})`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sensitive PII Shield Notification Banner */}
        {isPIIPresent && !isLoading && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 font-sans flex items-center space-x-1.5">
                  <span>Confidential Student Aadhaar & Identifiers Locked</span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-mono px-1.5 py-0.2 rounded font-medium">
                    Department Shield
                  </span>
                </div>
                <p className="text-[11.5px] text-amber-900/90 mt-0.5 leading-relaxed font-sans">
                  The student's <strong>Aadhaar UID</strong>, <strong>PAN Card</strong>, and <strong>Direct Bank Account</strong> are locked and blurred. Click any blurred value or use the master toggle with Department Admin Password to unmask.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleGlobalUnmask}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex-shrink-0 self-start sm:self-center shadow-xs ${
                isGloballyUnmasked
                  ? 'bg-amber-200/90 hover:bg-amber-300 text-amber-950 border-amber-400'
                  : 'bg-white hover:bg-amber-100/60 text-amber-900 border-amber-300'
              }`}
            >
              {isGloballyUnmasked ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Re-Blur Aadhaar</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Unmask with Admin</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-slate-300" />
              <div className="h-4 w-36 bg-slate-300 rounded" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3.5 bg-slate-200 rounded w-full" />
              <div className="h-3.5 bg-slate-200 rounded w-5/6" />
              <div className="h-3.5 bg-slate-200 rounded w-4/6" />
            </div>
            <div className="h-9 w-40 bg-slate-200 rounded mt-4" />
          </div>
        )}

        {/* Result Output Display */}
        {!isLoading && result && (
          <div className="animate-in fade-in duration-200">
            {result.found ? (
              /* CASE 1: MATCH FOUND */
              <div className="bg-indigo-50/60 border border-indigo-100/90 rounded-2xl p-6 shadow-xs space-y-5">
                {/* Match Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-slate-900" />
                    <span>{result.matchTitle || 'Verified Student Record Match'}</span>
                  </div>

                  {isPIIPresent && (
                    <span className="text-[10px] font-mono font-medium text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{isGloballyUnmasked ? 'UNMASKED VIEW' : 'AADHAAR BLURRED'}</span>
                    </span>
                  )}
                </div>

                {/* AI Answer Content in Selected Language with Sensitive Data Blurring */}
                <div className="text-slate-800 text-[14px] sm:text-[14.5px] leading-relaxed space-y-3 font-sans">
                  {result.answer.split('\n\n').map((paragraph, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <SensitiveTextRenderer
                        text={paragraph}
                        isGloballyUnmasked={isGloballyUnmasked}
                      />
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-indigo-100/80 pt-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Department Actions for Staff
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      id="btn-export-pdf-panel"
                      onClick={onExportPDF}
                      className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Citation to PDF</span>
                    </button>

                    <button
                      id="btn-view-application-steps"
                      onClick={onOpenStepsModal}
                      className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                      <span>View Felicitation Protocol</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* CASE 2: NO SUPPORTING EVIDENCE FOUND */
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5 border border-slate-200">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 tracking-tight leading-snug">
                      {result.matchTitle || 'No supporting evidence found in student repository'}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-sans">
                      {result.answer}
                    </p>
                  </div>
                </div>

                {/* Related Context Box */}
                {result.relatedContext && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Related Academic Regulations</span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {result.relatedContext}
                    </p>

                    <button
                      id="btn-view-related-section"
                      onClick={() => onViewRelatedSection('ACADEMIC REGULATIONS')}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer pt-1"
                    >
                      <span>View academic regulations</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    id="btn-refine-query"
                    onClick={() => {
                      const input = document.getElementById('ai-followup-input');
                      input?.focus();
                    }}
                    className="flex-1 text-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Refine Inquiry
                  </button>

                  <button
                    id="btn-log-null-finding"
                    onClick={handleNullLogClick}
                    disabled={nullFindingLogged}
                    className={`flex-1 flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs ${
                      nullFindingLogged
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {nullFindingLogged ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Logged to Audit Ledger</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Log Null Finding</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staff Verification Preset Chips */}
        {!isLoading && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Department Staff Quick Queries for Ramesh (Alumni Meet)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickPrompt('Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left font-medium"
              >
                🎓 Comprehensive 8 Semesters, Projects & Extra-curriculars
              </button>

              <button
                onClick={() => handleQuickPrompt("What is Ramesh's Aadhaar number, PAN card, and honorarium bank details?")}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left font-medium flex items-center space-x-1"
              >
                <Lock className="w-3 h-3 text-amber-700 inline" />
                <span>Show Aadhaar number, PAN, and honorarium bank details (Locked)</span>
              </button>

              <button
                onClick={() => handleQuickPrompt('Give the full 8-semester marks breakdown and CGPA for Ramesh')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left"
              >
                📊 8-Semester Marks & CGPA (9.43 Gold Medalist)
              </button>

              <button
                onClick={() => handleQuickPrompt('What B.E. engineering course projects, patents, and internships did Ramesh complete?')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left"
              >
                🚀 B.E. Projects (Edge-AI Capstone & Patent)
              </button>

              <button
                onClick={() => handleQuickPrompt('What are the Smart India Hackathon (SIH) and extracurricular achievements of Ramesh?')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left"
              >
                🏆 Smart India Hackathon Winner & Chess Captain
              </button>

              <button
                onClick={() => handleQuickPrompt('What is the PhD fellowship stipend policy for alumnus?')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer text-left"
              >
                🔍 Query outside dossier (triggers Null Finding proof)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11.5px] font-mono text-slate-500 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Audit Complete</span>
          <span>•</span>
          <span>Confidence: {result?.confidence || 'High'}</span>
        </div>

        <span className="text-slate-400 font-sans text-[11px]">
          {result?.modelName || 'EduCite Model v4.2'}
        </span>
      </div>

      {/* Bottom Query Input Box */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            id="ai-followup-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about Ramesh's 8 semester marks, B.E. projects, SIH Hackathon, Aadhaar..."
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl pl-4 pr-11 py-3 border border-slate-200 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 font-sans shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send query"
            className="absolute right-2 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 p-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
