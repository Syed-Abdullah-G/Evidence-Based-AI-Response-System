import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { DocumentModel } from '../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentModel) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setSource('Custom Document Upload');
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setSource('Custom Upload');
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Parse sections by double line breaks or numbered points
    const lines = content.split('\n\n');
    const sections = lines.map((paragraph, index) => ({
      id: `custom-sec-${index + 1}`,
      sectionNumber: `${index + 1}.`,
      title: paragraph.length > 30 ? paragraph.slice(0, 25) + '...' : paragraph,
      content: paragraph,
    }));

    const newDoc: DocumentModel = {
      id: `doc-${Date.now()}`,
      title: title.toUpperCase(),
      shortTitle: title.length > 25 ? title.slice(0, 22) + '...' : title,
      source: source || 'User Uploaded Source',
      sourceBadge: `Source: ${source || 'Custom Source'}`,
      date: new Date().getFullYear().toString(),
      category: 'Custom Uploaded Document',
      fullText: content,
      sections,
    };

    onAddDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">Upload / Import Document</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-slate-800 bg-slate-50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <label className="text-xs font-semibold text-slate-800 hover:underline cursor-pointer">
              <span>Click to select text or markdown file</span>
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">or drag and drop your file here</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. State Higher Education Grant Guidelines 2025"
              className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issuing Source / Authority
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Department of Higher Education"
              className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Content / Text Body
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the official clauses, rules, guidelines, or policy text..."
              className="w-full bg-slate-50 text-xs rounded-lg p-3 border border-slate-200 focus:outline-none focus:border-slate-500 font-serif leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
            >
              Load into Reader
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
