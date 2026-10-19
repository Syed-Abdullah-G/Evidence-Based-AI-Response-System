import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface SensitiveTextRendererProps {
  text: string;
  isGloballyUnmasked?: boolean;
  onToggleGlobalUnmask?: () => void;
  className?: string;
}

// Regex to capture sensitive student PII substrings (Aadhaar UID/VID, PAN, TAN, Bank A/C, Phone)
const SENSITIVE_REGEX = /(\b[A-Z]{5}[0-9]{4}[A-Z]\b|\b[A-Z]{4}[0-9]{5}[A-Z]\b|\b(?:UID|VID)-\d{4}-\d{4}-\d{4}\b|\b99283748201\b|\+91\s*[6-9]\d{4}\s*\d{5})/g;

export const SensitiveToken: React.FC<{
  value: string;
  isGloballyUnmasked?: boolean;
}> = ({ value, isGloballyUnmasked = false }) => {
  const { isAdminAuthenticated, requestAdminAuthorization } = useAdminAuth();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const isVisible = (isAdminAuthenticated && isGloballyUnmasked) || (isAdminAuthenticated && isRevealed);

  // Determine type of PII for badge
  let piiLabel = 'STUDENT PII';
  if (/^(?:UID|VID)-/i.test(value)) {
    piiLabel = 'AADHAAR UID';
  } else if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
    piiLabel = 'PAN CARD';
  } else if (/^[A-Z]{4}[0-9]{5}[A-Z]$/.test(value)) {
    piiLabel = 'TAX TAN';
  } else if (/^99283748201$/.test(value)) {
    piiLabel = 'BANK A/C';
  } else if (/^\+91/.test(value)) {
    piiLabel = 'MOBILE';
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVisible) {
      setIsRevealed(false);
    } else {
      if (!isAdminAuthenticated) {
        requestAdminAuthorization(`Unmask and view ${piiLabel} (${value.slice(0, 4)}••••)`, () => {
          setIsRevealed(true);
        });
      } else {
        setIsRevealed(true);
      }
    }
  };

  return (
    <span
      className="inline-flex items-center align-baseline mx-0.5 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        title={
          isVisible
            ? `Protected ${piiLabel}. Click to re-blur.`
            : `Confidential Student ${piiLabel} locked & blurred. Click to authenticate with Department Admin Password.`
        }
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-mono border transition-all duration-200 cursor-pointer select-text ${
          isVisible
            ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400/40 shadow-xs'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-200 shadow-xs'
        }`}
      >
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-0.5">
          {isVisible ? (
            <Unlock className="w-2.5 h-2.5 text-amber-700 inline" />
          ) : (
            <Lock className="w-2.5 h-2.5 text-slate-500 inline" />
          )}
          <span>{piiLabel}</span>
        </span>

        <span
          className={`font-semibold tracking-wider transition-all duration-300 ${
            isVisible
              ? 'blur-none text-slate-900 bg-amber-100/80 px-1 rounded'
              : 'filter blur-[5px] select-none text-slate-600'
          }`}
        >
          {value}
        </span>

        <span className="text-[10px] text-slate-400 group-hover:text-slate-700">
          {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </span>
      </button>

      {/* Floating tooltip on hover */}
      {isHovered && !isGloballyUnmasked && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-sans px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-md z-30 animate-in fade-in">
          {isVisible
            ? 'Click to re-blur PII'
            : isAdminAuthenticated
            ? 'Click to unmask student detail'
            : '🔒 Locked: Click to verify Admin Password'}
        </span>
      )}
    </span>
  );
};

export const SensitiveTextRenderer: React.FC<SensitiveTextRendererProps> = ({
  text,
  isGloballyUnmasked = false,
  className = '',
}) => {
  if (!text) return null;

  // Split by markdown bold markers first, then parse PII
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span className={className}>
      {boldParts.map((bPart, bIdx) => {
        const isBold = bPart.startsWith('**') && bPart.endsWith('**');
        const rawContent = isBold ? bPart.slice(2, -2) : bPart;

        // Split by sensitive PII tokens
        const piiParts = rawContent.split(SENSITIVE_REGEX);

        const renderedContent = piiParts.map((pPart, pIdx) => {
          if (
            /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pPart) ||
            /^[A-Z]{4}[0-9]{5}[A-Z]$/.test(pPart) ||
            /^(?:UID|VID)-\d{4}-\d{4}-\d{4}$/i.test(pPart) ||
            /^99283748201$/.test(pPart) ||
            /^\+91\s*[6-9]\d{4}\s*\d{5}$/.test(pPart)
          ) {
            return (
              <SensitiveToken
                key={pIdx}
                value={pPart}
                isGloballyUnmasked={isGloballyUnmasked}
              />
            );
          }
          return <React.Fragment key={pIdx}>{pPart}</React.Fragment>;
        });

        if (isBold) {
          return (
            <strong key={bIdx} className="font-semibold text-slate-900">
              {renderedContent}
            </strong>
          );
        }

        return <React.Fragment key={bIdx}>{renderedContent}</React.Fragment>;
      })}
    </span>
  );
};
