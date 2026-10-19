import React, { useState } from 'react';
import { 
  CheckCircle2, 
  FileSearch, 
  Download, 
  ExternalLink, 
  Trash2, 
  Search, 
  Filter,
  ShieldCheck,
  Calendar,
  FileText,
  Lock,
  GraduationCap
} from 'lucide-react';
import { VerifiedRecord } from '../types';
import { SensitiveTextRenderer } from './SensitiveTextRenderer';

interface VerifiedRecordsViewProps {
  records: VerifiedRecord[];
  onSelectRecord: (record: VerifiedRecord) => void;
  onClearRecords: () => void;
  onExportRecordPDF: (record: VerifiedRecord) => void;
}

export const VerifiedRecordsView: React.FC<VerifiedRecordsViewProps> = ({
  records,
  onSelectRecord,
  onClearRecords,
  onExportRecordPDF,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'null'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = records.filter((r) => {
    const matchesFilter =
      filterType === 'all' ? true : filterType === 'verified' ? r.found : !r.found;
    const matchesSearch =
      r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-50/50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-slate-800" />
              <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
                Verified Student Citations & Audit Ledger
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Official faculty registry of verified student records, semester grades, project citations, and Alumni Success Meet dossiers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {records.length > 0 && (
              <button
                onClick={onClearRecords}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 px-3 py-2 rounded border border-rose-200 bg-rose-50/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Audit Ledger</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Citations ({records.length})
            </button>
            <button
              onClick={() => setFilterType('verified')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'verified'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Verified Proofs ({records.filter((r) => r.found).length})
            </button>
            <button
              onClick={() => setFilterType('null')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'null'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Null Findings ({records.filter((r) => !r.found).length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty audit log..."
              className="w-full bg-slate-50 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Records Table / Cards */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No student audit records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Inquire into student academic records in Case Review to generate and log verified citations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    {record.found ? (
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED RECORD</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <FileSearch className="w-3 h-3" />
                        <span>NO RECORD FOUND</span>
                      </span>
                    )}

                    {record.hasSensitiveData && (
                      <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-medium">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Aadhaar Shielded</span>
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {record.verificationHash}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(record.timestamp).toLocaleString()}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    "{record.query}"
                  </h3>

                  <div className="text-xs text-slate-600 font-sans line-clamp-2">
                    <SensitiveTextRenderer text={record.answer} />
                  </div>

                  {record.highlightQuote && (
                    <div className="text-[11.5px] bg-amber-50/80 border border-amber-200/80 rounded px-2.5 py-1 text-slate-800 font-serif italic line-clamp-1">
                      Proof Citation: "<SensitiveTextRenderer text={record.highlightQuote} />"
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 font-mono">
                    Target: {record.documentTitle} • {record.sourceBadge}
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:flex-col md:space-x-0 md:space-y-2 flex-shrink-0">
                  <button
                    onClick={() => onSelectRecord(record)}
                    className="flex-1 md:w-36 flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View in Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onExportRecordPDF(record)}
                    className="flex-1 md:w-36 flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
