// Regex patterns for Sensitive Student Identity & Financial PII
export const PII_PATTERNS = {
  // PAN: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F)
  PAN: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
  // TAN: 4 uppercase letters, 5 digits, 1 uppercase letter (e.g. CHEA01928B)
  TAN: /\b[A-Z]{4}[0-9]{5}[A-Z]\b/g,
  // Bank Account numbers: 9 to 18 digits (e.g. 99283748201)
  BANK_ACCOUNT: /\b(?:Account No\.?|A\/c No\.?|Acc No\.?|Disbursal Account No\.?|Account Number:?)\s*([0-9]{9,18})\b/gi,
  // Standalone long account numbers
  NUMERIC_ACCOUNT: /\b99283748201\b/g,
  // Aadhaar / UID / VID: UID-XXXX-XXXX-XXXX, VID-XXXX-XXXX-XXXX or XXXX-XXXX-XXXX
  AADHAAR_UID: /\b(?:UID|VID)-\d{4}-\d{4}-\d{4}\b/gi,
  // Phone numbers with country code: +91 98401 23456
  PHONE: /\+91\s*[6-9]\d{4}\s*\d{5}/g,
};

export interface DetectedPII {
  type: 'Aadhaar UID/VID' | 'PAN' | 'TAN' | 'Bank Account' | 'Phone Number';
  value: string;
  index: number;
}

export function detectSensitivePII(text: string): boolean {
  if (!text) return false;
  return (
    /(?:UID|VID)-\d{4}-\d{4}-\d{4}/i.test(text) ||
    /[A-Z]{5}[0-9]{4}[A-Z]/.test(text) ||
    /[A-Z]{4}[0-9]{5}[A-Z]/.test(text) ||
    /\b99283748201\b/.test(text) ||
    /\+91\s*[6-9]\d{4}\s*\d{5}/.test(text) ||
    /aadhaar|uidai|pan number|bank account|disbursal account|pii|identifiable/i.test(text)
  );
}
