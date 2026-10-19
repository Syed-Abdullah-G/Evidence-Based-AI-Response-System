export type SupportedLanguage = 'en' | 'ta' | 'te' | 'ml' | 'hi' | 'fr' | 'de' | 'ja';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export interface DocumentSection {
  id: string;
  sectionNumber?: string;
  title?: string;
  content: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  shortTitle: string;
  source: string;
  sourceBadge: string;
  date: string;
  category: string;
  fullText: string;
  sections: DocumentSection[];
}

export interface AnalysisResult {
  id: string;
  query: string;
  documentId: string;
  documentTitle: string;
  sourceBadge: string;
  found: boolean;
  matchTitle?: string;
  answer: string;
  highlightQuote?: string;
  highlightQuotes?: string[];
  confidence: 'High' | 'Medium' | 'Low';
  relatedContext?: string;
  suggestedActions: string[];
  timestamp: string;
  verificationHash: string;
  modelName: string;
  language?: SupportedLanguage;
  hasSensitiveData?: boolean;
  sensitiveDataTypes?: string[];
}

export interface VerifiedRecord {
  id: string;
  query: string;
  documentId: string;
  documentTitle: string;
  sourceBadge: string;
  found: boolean;
  answer: string;
  highlightQuote?: string;
  timestamp: string;
  confidence: 'High' | 'Medium' | 'Low';
  verificationHash: string;
  language?: SupportedLanguage;
  hasSensitiveData?: boolean;
  sensitiveDataTypes?: string[];
}

