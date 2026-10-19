import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentViewer } from './components/DocumentViewer';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { VerifiedRecordsView } from './components/VerifiedRecordsView';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { ApplicationStepsModal } from './components/ApplicationStepsModal';
import { AdminModal } from './components/AdminModal';
import { AdminPasswordPromptModal } from './components/AdminPasswordPromptModal';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { DEFAULT_DOCUMENTS } from './data/defaultDocuments';
import { DocumentModel, AnalysisResult, VerifiedRecord, SupportedLanguage } from './types';
import { exportAnalysisToPDF } from './utils/pdfExport';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'case-review' | 'verified-records'>('case-review');
  const [documents, setDocuments] = useState<DocumentModel[]>(DEFAULT_DOCUMENTS);
  const [activeDocument, setActiveDocument] = useState<DocumentModel>(DEFAULT_DOCUMENTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh');
  const [currentQuery, setCurrentQuery] = useState<string>('Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetSectionToView, setTargetSectionToView] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState<boolean>(false);

  // Selected language state (en, ta, te, ml, hi, fr, de, ja)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('educite_language');
      if (saved) return saved as SupportedLanguage;
    } catch {
      // fallback
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('educite_language', selectedLanguage);
    } catch {
      // ignore
    }
  }, [selectedLanguage]);

  // Initial Result matching Ramesh Student Record
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>({
    id: 'initial-ramesh-case-1',
    query: 'Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh',
    documentId: DEFAULT_DOCUMENTS[0].id,
    documentTitle: DEFAULT_DOCUMENTS[0].title,
    sourceBadge: DEFAULT_DOCUMENTS[0].sourceBadge,
    found: true,
    matchTitle: 'Verified Student Record Match',
    answer: 'Ramesh Kumar (Roll No: 2019-BE-CSE-042) graduated with a **B.E. Computer Science & Engineering** degree holding a **Cumulative Grade Point Average (CGPA) of 9.43 / 10.0** (Department First Rank & University Gold Medalist).\n\n• **8-Semester GPA Progression**: Sem I (9.20), Sem II (9.35), Sem III (9.40), Sem IV (9.50), Sem V (9.45), Sem VI (9.60), Sem VII (9.50), Sem VIII (9.45).\n• **B.E. Course Projects**: Capstone project on "Autonomous Edge-AI Drone for Precision Agriculture" (Patent Published: IN-2023-4109822), Mini-Project on "Zero-Knowledge Academic Credential Verification", and Operating Systems Custom Microkernel.\n• **Extracurricular & Leadership**: 1st Prize Winner at **Smart India Hackathon (SIH 2021)** ($1,200 Cash Award), University Chess Team Captain (Inter-Collegiate Gold 2022), and President of the Open-Source Developers Club (OSDC).\n• **Confidential PII**: Aadhaar UID-8492-3847-1920, PAN BKZPK4820M, and Honorarium Bank Account ACC-92837401928 are locked under Department Admin security.',
    highlightQuote: '1. ACADEMIC PERFORMANCE (ALL 8 SEMESTERS) - CUMULATIVE GPA: 9.43 / 10.0 (First Class with Distinction & University Gold Medalist)',
    confidence: 'High',
    suggestedActions: ['Export Citation to PDF', 'View Felicitation Protocol'],
    timestamp: new Date().toISOString(),
    verificationHash: 'EDU-RAMESH-2025',
    modelName: 'EduCite Model v4.2',
    language: 'en',
    hasSensitiveData: true,
  });

  // Local storage persisted verified records
  const [verifiedRecords, setVerifiedRecords] = useState<VerifiedRecord[]>(() => {
    try {
      const saved = localStorage.getItem('educite_verified_records');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'rec-ramesh-1',
        query: 'Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh',
        documentId: DEFAULT_DOCUMENTS[0].id,
        documentTitle: DEFAULT_DOCUMENTS[0].shortTitle,
        sourceBadge: DEFAULT_DOCUMENTS[0].sourceBadge,
        found: true,
        answer: 'Ramesh Kumar (Roll: 2019-BE-CSE-042) graduated with B.E. CSE, CGPA 9.43 Gold Medalist across all 8 semesters, patent in Edge-AI UAVs, and SIH 2021 Winner.',
        highlightQuote: '1. ACADEMIC PERFORMANCE (ALL 8 SEMESTERS) - CUMULATIVE GPA: 9.43 / 10.0 (First Class with Distinction & University Gold Medalist)',
        timestamp: new Date().toISOString(),
        confidence: 'High',
        verificationHash: 'EDU-RAMESH-2025',
        language: 'en',
        hasSensitiveData: true,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('educite_verified_records', JSON.stringify(verifiedRecords));
    } catch {
      // ignore
    }
  }, [verifiedRecords]);

  // Execute Grounded Analysis using server endpoint
  const handleRunAnalysis = useCallback(
    async (
      queryText: string,
      doc: DocumentModel = activeDocument,
      lang: SupportedLanguage = selectedLanguage
    ) => {
      setIsLoading(true);
      setCurrentQuery(queryText);
      setSearchQuery(queryText);
      setActiveTab('case-review');

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryText,
            documentId: doc.id,
            documentTitle: doc.title || doc.shortTitle,
            documentSource: doc.source,
            documentText: doc.fullText,
            language: lang,
          }),
        });

        if (!response.ok) {
          throw new Error('Analysis request failed');
        }

        const data = await response.json();

        const newResult: AnalysisResult = {
          id: `res-${Date.now()}`,
          query: queryText,
          documentId: doc.id,
          documentTitle: doc.title,
          sourceBadge: doc.sourceBadge,
          found: data.found,
          matchTitle: data.matchTitle,
          answer: data.answer,
          highlightQuote: data.highlightQuote,
          confidence: data.confidence || 'High',
          relatedContext: data.relatedContext,
          suggestedActions: data.suggestedActions || [],
          timestamp: data.timestamp || new Date().toISOString(),
          verificationHash: data.verificationHash || 'EDU-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          modelName: data.modelName || 'EduCite Model v4.2',
          language: lang,
          hasSensitiveData: data.hasSensitiveData || queryText.toLowerCase().includes('aadhar') || queryText.toLowerCase().includes('aadhaar') || queryText.toLowerCase().includes('bank') || queryText.toLowerCase().includes('pan'),
        };

        setAnalysisResult(newResult);

        // Auto log to records
        const newRecord: VerifiedRecord = {
          id: `rec-${Date.now()}`,
          query: queryText,
          documentId: doc.id,
          documentTitle: doc.shortTitle || doc.title,
          sourceBadge: doc.sourceBadge,
          found: data.found,
          answer: data.answer,
          highlightQuote: data.highlightQuote,
          timestamp: newResult.timestamp,
          confidence: data.confidence || 'High',
          verificationHash: newResult.verificationHash,
          language: lang,
          hasSensitiveData: newResult.hasSensitiveData,
        };

        setVerifiedRecords((prev) => [newRecord, ...prev.filter((r) => r.query !== queryText)]);
      } catch (err) {
        console.error('Failed to run analysis:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeDocument, selectedLanguage]
  );

  // Dynamic Language Switch Handler
  const handleSelectLanguage = async (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);

    if (analysisResult) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answer: analysisResult.answer,
            matchTitle: analysisResult.matchTitle,
            relatedContext: analysisResult.relatedContext,
            targetLanguage: newLang,
          }),
        });

        if (response.ok) {
          const transData = await response.json();
          setAnalysisResult((prev) =>
            prev
              ? {
                  ...prev,
                  answer: transData.answer || prev.answer,
                  matchTitle: transData.matchTitle || prev.matchTitle,
                  relatedContext: transData.relatedContext || prev.relatedContext,
                  language: newLang,
                }
              : null
          );
        } else {
          // Re-analyze in target language
          await handleRunAnalysis(currentQuery, activeDocument, newLang);
        }
      } catch (err) {
        console.error('Translation switch error:', err);
        // Fallback: Re-run analysis with new language
        await handleRunAnalysis(currentQuery, activeDocument, newLang);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectDocument = (doc: DocumentModel) => {
    setActiveDocument(doc);
    if (doc.id === 'general-admin-guidelines') {
      handleRunAnalysis('What is the PhD fellowship stipend policy for alumnus?', doc, selectedLanguage);
    } else {
      handleRunAnalysis(currentQuery || 'Show all 8 semester marks, B.E. engineering course projects, and extracurricular activities of Ramesh', doc, selectedLanguage);
    }
  };

  const handleExportPDF = () => {
    if (analysisResult) {
      exportAnalysisToPDF(analysisResult, activeDocument);
    }
  };

  const handleExportRecordPDF = (record: VerifiedRecord) => {
    const syntheticResult: AnalysisResult = {
      id: record.id,
      query: record.query,
      documentId: record.documentId,
      documentTitle: record.documentTitle,
      sourceBadge: record.sourceBadge,
      found: record.found,
      answer: record.answer,
      highlightQuote: record.highlightQuote,
      confidence: record.confidence,
      suggestedActions: ['Export Citation to PDF'],
      timestamp: record.timestamp,
      verificationHash: record.verificationHash,
      modelName: 'EduCite Model v4.2',
      language: record.language || 'en',
      hasSensitiveData: record.hasSensitiveData,
    };
    exportAnalysisToPDF(syntheticResult);
  };

  const handleSelectRecordFromHistory = (record: VerifiedRecord) => {
    const matchingDoc = documents.find((d) => d.id === record.documentId) || documents[0];
    setActiveDocument(matchingDoc);
    setCurrentQuery(record.query);
    setSearchQuery(record.query);
    if (record.language) {
      setSelectedLanguage(record.language);
    }
    setAnalysisResult({
      id: record.id,
      query: record.query,
      documentId: matchingDoc.id,
      documentTitle: matchingDoc.title,
      sourceBadge: matchingDoc.sourceBadge,
      found: record.found,
      matchTitle: record.found ? 'Verified Student Record Match' : 'No supporting evidence found in student repository',
      answer: record.answer,
      highlightQuote: record.highlightQuote,
      confidence: record.confidence,
      suggestedActions: record.found ? ['Export Citation to PDF', 'View Felicitation Protocol'] : ['Refine Inquiry', 'Log Null Finding'],
      timestamp: record.timestamp,
      verificationHash: record.verificationHash,
      modelName: 'EduCite Model v4.2',
      language: record.language || 'en',
      hasSensitiveData: record.hasSensitiveData,
    });
    setActiveTab('case-review');
  };

  const handleAddCustomDocument = (newDoc: DocumentModel) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocument(newDoc);
    handleRunAnalysis('What are the key details in this student record?', newDoc, selectedLanguage);
  };

  const handleViewRelatedSection = (sectionName: string) => {
    setTargetSectionToView(sectionName);
  };

  const handleLogNullFinding = () => {
    if (analysisResult && !analysisResult.found) {
      const newRecord: VerifiedRecord = {
        id: `rec-null-${Date.now()}`,
        query: analysisResult.query,
        documentId: activeDocument.id,
        documentTitle: activeDocument.shortTitle,
        sourceBadge: activeDocument.sourceBadge,
        found: false,
        answer: analysisResult.answer,
        timestamp: new Date().toISOString(),
        confidence: analysisResult.confidence,
        verificationHash: analysisResult.verificationHash,
        language: selectedLanguage,
      };
      setVerifiedRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={(q) => handleRunAnalysis(q)}
        onExportPDF={handleExportPDF}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        latestResult={analysisResult}
        verifiedCount={verifiedRecords.length}
        currentLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'case-review' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
            {/* Left Pane: Document Reader */}
            <div className="w-full md:w-3/5 h-1/2 md:h-full overflow-hidden bg-slate-100 flex flex-col">
              <DocumentViewer
                document={activeDocument}
                documents={documents}
                onSelectDocument={handleSelectDocument}
                analysisResult={analysisResult}
                targetSectionToView={targetSectionToView}
                onClearTargetSection={() => setTargetSectionToView(null)}
              />
            </div>

            {/* Right Pane: AI Analysis & Evidence Proof */}
            <div className="w-full md:w-2/5 h-1/2 md:h-full overflow-hidden border-t md:border-t-0 md:border-l border-slate-200 bg-white flex flex-col">
              <AIAnalysisPanel
                currentQuery={currentQuery}
                result={analysisResult}
                isLoading={isLoading}
                onAskQuestion={(q) => handleRunAnalysis(q)}
                onExportPDF={handleExportPDF}
                onOpenStepsModal={() => setIsStepsModalOpen(true)}
                onViewRelatedSection={handleViewRelatedSection}
                onLogNullFinding={handleLogNullFinding}
                currentLanguage={selectedLanguage}
                onSelectLanguage={handleSelectLanguage}
              />
            </div>
          </div>
        ) : (
          <VerifiedRecordsView
            records={verifiedRecords}
            onSelectRecord={handleSelectRecordFromHistory}
            onClearRecords={() => setVerifiedRecords([])}
            onExportRecordPDF={handleExportRecordPDF}
          />
        )}
      </main>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDocument={handleAddCustomDocument}
      />

      <ApplicationStepsModal
        isOpen={isStepsModalOpen}
        onClose={() => setIsStepsModalOpen(false)}
      />

      {/* Admin Panel & Password Prompt Modals */}
      <AdminModal />
      <AdminPasswordPromptModal />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  );
}
