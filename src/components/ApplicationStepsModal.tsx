import React from 'react';
import { X, Award, CheckCircle2, GraduationCap, FileCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface ApplicationStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationStepsModal: React.FC<ApplicationStepsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Academic Grade Audit (8 Semesters)',
      desc: 'Verify all 8 semester marksheets and cumulative GPA (CGPA 9.43). Ensure all 185 credits were cleared in the first attempt with zero academic arrears.',
    },
    {
      step: '02',
      title: 'B.E. Capstone Project & IP Fact-Check',
      desc: 'Confirm Capstone Project evaluation (100/100 Grade O) with Project Guide / HOD Prof. Dr. S. Ramanathan, along with IEEE conference citation and patent filing.',
    },
    {
      step: '03',
      title: 'Hackathon & Leadership Proof Validation',
      desc: 'Validate Smart India Hackathon (SIH 2021) 1st Place National winner credential (INR 1,00,000 cash award) and ACM/IEEE Student Chapter presidency tenure.',
    },
    {
      step: '04',
      title: 'Department Admin Aadhaar & KYC Verification',
      desc: 'Authenticate with Department Admin Password to unmask and audit student Aadhaar UID and linked State Bank account for official honorarium and travel clearance.',
    },
    {
      step: '05',
      title: 'Alumni Felicitation Plaque & Citation Release',
      desc: 'Generate the official verified citation dossier, print the Department Gold Medalist plaque, and schedule the keynote speech for the Alumni Success Meet.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Alumni Success Meet Felicitation Protocol
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Dept. CSE • College of Engineering & Technology
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            Close Protocol Guide
          </button>
        </div>
      </div>
    </div>
  );
};
