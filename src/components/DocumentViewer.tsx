import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Search, 
  EyeOff, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Check, 
  Lock, 
  GraduationCap 
} from 'lucide-react';
import { DocumentModel, AnalysisResult } from '../types';
import { SensitiveTextRenderer } from './SensitiveTextRenderer';
import { detectSensitivePII } from '../utils/piiDetector';
import { useAdminAuth } from '../context/AdminAuthContext';

interface DocumentViewerProps {
  document: DocumentModel;
  documents: DocumentModel[];
  onSelectDocument: (doc: DocumentModel) => void;
  analysisResult: AnalysisResult | null;
  targetSectionToView?: string | null;
  onClearTargetSection?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  documents,
  onSelectDocument,
  analysisResult,
  targetSectionToView,
  onClearTargetSection,
}) => {
  const { isAdminAuthenticated, requestAdminAuthorization } = useAdminAuth();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showDocDropdown, setShowDocDropdown] = useState<boolean>(false);
  const [inDocSearch, setInDocSearch] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isPIIUnmasked, setIsPIIUnmasked] = useState<boolean>(false);

  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const targetSectionRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const hasDocPII = Boolean(
    detectSensitivePII(document.fullText) ||
    (analysisResult?.hasSensitiveData)
  );

  const handleToggleDocPII = () => {
    if (isPIIUnmasked) {
      setIsPIIUnmasked(false);
    } else {
      if (!isAdminAuthenticated) {
        requestAdminAuthorization('Unmask and view student Aadhaar UID and confidential PII', () => {
          setIsPIIUnmasked(true);
        });
      } else {
        setIsPIIUnmasked(true);
      }
    }
  };

  // Auto scroll into highlight when analysisResult changes
  useEffect(() => {
    if (analysisResult?.found && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 150);
    }
  }, [analysisResult]);

  // Auto scroll to target section if clicked from AI Panel
  useEffect(() => {
    if (targetSectionToView && targetSectionRef.current) {
      targetSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      onClearTargetSection?.();
    }
  }, [targetSectionToView, onClearTargetSection]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 60));
  };

  // Helper to render text with highlight quote, PII blurring, and optional in-doc search query
  const renderTextWithHighlights = (text: string, quote?: string) => {
    if (!text) return null;

    // If there is an active citation quote to highlight
    if (analysisResult?.found && quote && text.includes(quote)) {
      const parts = text.split(quote);
      return (
        <span>
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              <SensitiveTextRenderer
                text={part}
                isGloballyUnmasked={isPIIUnmasked}
              />
              {idx < parts.length - 1 && (
                <mark
                  ref={highlightRef}
                  id="document-citation-highlight"
                  className="bg-amber-200/90 text-slate-900 px-1 py-0.5 rounded-sm shadow-sm ring-2 ring-amber-300/60 transition-all duration-300 relative inline group"
                >
                  <SensitiveTextRenderer
                    text={quote}
                    isGloballyUnmasked={isPIIUnmasked}
                  />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-0 bg-slate-900 text-white text-[10px] font-sans px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-md z-20">
                    Grounded Citation Proof
                  </span>
                </mark>
              )}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Secondary search highlight if in-doc search is active
    if (inDocSearch.trim().length > 1) {
      const searchRegex = new RegExp(`(${inDocSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      const parts = text.split(searchRegex);
      return (
        <span>
          {parts.map((part, i) =>
            searchRegex.test(part) ? (
              <mark key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded">
                <SensitiveTextRenderer
                  text={part}
                  isGloballyUnmasked={isPIIUnmasked}
                />
              </mark>
            ) : (
              <SensitiveTextRenderer
                key={i}
                text={part}
                isGloballyUnmasked={isPIIUnmasked}
              />
            )
          )}
        </span>
      );
    }

    return (
      <SensitiveTextRenderer
        text={text}
        isGloballyUnmasked={isPIIUnmasked}
      />
    );
  };

  const isNullFinding = analysisResult && !analysisResult.found;

  return (
    <div className={`flex flex-col h-full bg-slate-100 border-r border-slate-200 relative ${isMaximized ? 'fixed inset-0 z-50 bg-slate-100' : ''}`}>
      {/* Top Document Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-700 select-none z-20 shrink-0">
        {/* Left: Document Selector */}
        <div className="relative">
          <button
            id="btn-document-dropdown-toggle"
            onClick={() => setShowDocDropdown(!showDocDropdown)}
            className="flex items-center space-x-2 font-medium hover:text-slate-900 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="truncate max-w-[170px] sm:max-w-[230px] font-semibold text-slate-800">
              {document.shortTitle || document.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDocDropdown && (
            <div className="absolute left-0 top-full mt-1 w-84 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Department Student Dossier
              </div>
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument(doc);
                    setShowDocDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    doc.id === document.id ? 'bg-slate-100/80 font-semibold text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate text-slate-900 font-medium">{doc.shortTitle}</div>
                    <div className="text-[10px] text-slate-400">{doc.source}</div>
                  </div>
                  {doc.id === document.id && <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: PII Status Toggle */}
        <div className="hidden md:flex items-center space-x-2">
          {hasDocPII && (
            <button
              onClick={handleToggleDocPII}
              title={isPIIUnmasked ? "Click to blur sensitive Aadhaar & PII" : "Click to unmask sensitive Aadhaar & PII (Requires Department Admin Password)"}
              className={`flex items-center space-x-1 font-mono text-[10.5px] px-2 py-1 rounded border transition-colors cursor-pointer ${
                isPIIUnmasked
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-700" />
              <span>{isPIIUnmasked ? 'AADHAAR: UNMASKED' : 'AADHAAR: BLURRED'}</span>
            </button>
          )}
        </div>

        {/* Right: Zoom controls & Search */}
        <div className="flex items-center space-x-2">
          {showSearchInput ? (
            <div className="flex items-center bg-slate-100 rounded px-1.5 py-0.5 border border-slate-300">
              <Search className="w-3 h-3 text-slate-400 mr-1" />
              <input
                type="text"
                value={inDocSearch}
                onChange={(e) => setInDocSearch(e.target.value)}
                placeholder="Find in record..."
                className="w-24 text-[11px] bg-transparent outline-none text-slate-800"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  setInDocSearch('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              title="Search within student record"
              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-slate-200" />

          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs w-9 text-center text-slate-700 font-medium">
            {zoomLevel}%
          </span>

          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Exit fullscreen" : "Maximize viewer"}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Document Paper Container - Deep scrollable canvas */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 md:p-10 pb-24 flex flex-col items-center relative select-text min-h-0 w-full"
      >
        {isNullFinding ? (
          /* Null finding state with clean document background and skeleton lines */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white rounded-sm p-8 sm:p-12 md:p-16 min-h-[900px] transition-transform duration-150 relative border border-slate-200 shadow-md flex flex-col justify-between mb-8 shrink-0"
          >
            {/* Skeleton lines */}
            <div className="space-y-5 opacity-40 select-none pointer-events-none mt-4 flex-1">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />

              <div className="pt-8 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-200 rounded w-11/12" />
              </div>

              <div className="pt-8 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/5" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
              </div>
            </div>

            {/* Floating "No relevant passage found" overlay card */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-2xl p-8 text-center z-30 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mx-auto mb-4 border border-slate-200">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                No supporting evidence found
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
                The citation engine could not locate verified evidence matching your inquiry in this department record.
              </p>
            </div>

            {/* Null Finding Bottom Footer */}
            <div className="mt-auto pt-16 border-t border-slate-200 flex justify-between items-center text-[11px] font-sans text-slate-400">
              <span>Department Cumulative Record • Aalim Muhammed Salegh College of Engineering</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        ) : (
          /* The Standard Academic Dossier Paper Sheet */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white shadow-xl rounded-sm p-8 sm:p-12 md:p-16 text-slate-800 font-serif leading-relaxed min-h-fit sm:min-h-[1050px] transition-transform duration-150 relative border border-slate-200/90 flex flex-col justify-between mb-8 shrink-0"
          >
            {/* Official Academic Header */}
            <div className="text-center mb-10 pb-4 border-b-2 border-slate-900">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-amber-400 mb-2">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-950 uppercase font-serif">
                AALIM MUHAMMED SALEGH COLLEGE OF ENGINEERING
              </h1>
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 mt-2 font-serif">
                {document.source}
              </h2>
            </div>

            {/* Document Content Sections */}
            <div className="space-y-8 text-sm text-slate-800 bg-white flex-1">
              {document.sections && document.sections.length > 0 ? (
                document.sections.map((section) => {
                  const isTarget = targetSectionToView && section.title?.toLowerCase().includes(targetSectionToView.toLowerCase());
                  return (
                    <div
                      key={section.id}
                      ref={isTarget ? targetSectionRef : undefined}
                      className={`transition-colors rounded p-2 ${isTarget ? 'bg-amber-50/80 ring-2 ring-amber-400/60' : 'bg-white'}`}
                    >
                      {section.title && (
                        <h3 className="font-bold text-slate-900 uppercase tracking-tight mb-2 font-serif text-[14.5px] border-b border-slate-200 pb-1">
                          {section.sectionNumber} {section.title}:
                        </h3>
                      )}
                      <div className="text-slate-800 whitespace-pre-line leading-relaxed text-[13.5px] font-sans sm:text-[14px]">
                        {renderTextWithHighlights(section.content, analysisResult?.highlightQuote)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="whitespace-pre-line leading-relaxed text-[14px] font-serif">
                  {renderTextWithHighlights(document.fullText, analysisResult?.highlightQuote)}
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="mt-auto pt-24 border-t border-slate-200 flex justify-between items-center text-[11px] font-sans text-slate-400">
              <span>Department of CSE • Official Student Cumulative Dossier</span>
              <span>Confidential Department Record</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
