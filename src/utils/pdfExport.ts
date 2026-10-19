import { jsPDF } from 'jspdf';
import { AnalysisResult, DocumentModel } from '../types';

export function exportAnalysisToPDF(result: AnalysisResult, document?: DocumentModel) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('EduCite | Department Verified Student Citation Dossier', 16, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Alumni Success Meet Record ID: ${result.verificationHash}   •   Generated: ${new Date().toLocaleString()}`, 16, 21);

  yPos = 36;

  // Query Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('FACULTY VERIFICATION QUERY:', 16, yPos);
  yPos += 5.5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const splitQuery = doc.splitTextToSize(`"${result.query}"`, pageWidth - 32);
  doc.text(splitQuery, 16, yPos);
  yPos += splitQuery.length * 4.8 + 4;

  // Status Badge
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(result.found ? 238 : 254, result.found ? 242 : 242, result.found ? 255 : 242);
  doc.roundedRect(16, yPos, pageWidth - 32, 9.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  if (result.found) {
    doc.setTextColor(30, 64, 175);
    doc.text(`STATUS: VERIFIED ACADEMIC RECORD MATCH  |  CONFIDENCE: ${result.confidence}  |  ENGINE: ${result.modelName}`, 20, yPos + 6);
  } else {
    doc.setTextColor(185, 28, 28);
    doc.text(`STATUS: NO SUPPORTING EVIDENCE FOUND IN REPOSITORY  |  ENGINE: ${result.modelName}`, 20, yPos + 6);
  }
  yPos += 14;

  // Document Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(16, yPos, pageWidth - 32, 17, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SOURCE RECORD:', 20, yPos + 5.5);
  doc.text('DEPARTMENT REPOSITORY:', 20, yPos + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(result.documentTitle || (document?.title ?? 'Student Academic Dossier'), 65, yPos + 5.5);
  doc.text(result.sourceBadge || (document?.source ?? 'CSE Department Records'), 65, yPos + 11.5);
  yPos += 23;

  if (result.hasSensitiveData) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(16, yPos, pageWidth - 32, 9.5, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text('CONFIDENTIAL STUDENT IDENTIFIER: Aadhaar UID & Bank Ledger Access Logged under Admin Authorization', 20, yPos + 6);
    yPos += 13;
  }

  // AI Finding / Synthesis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED CITATION FINDINGS & SUMMARY:', 16, yPos);
  yPos += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  // Clean markdown asterisks for plain pdf text
  const cleanAnswer = result.answer.replace(/\*\*/g, '');
  const splitAnswer = doc.splitTextToSize(cleanAnswer, pageWidth - 32);
  doc.text(splitAnswer, 16, yPos);
  yPos += splitAnswer.length * 4.6 + 6;

  // Grounded Citation / Proof Quote
  if (result.found && result.highlightQuote) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('GROUNDED PASSAGE PROOF (VERBATIM FROM OFFICIAL RECORD):', 16, yPos);
    yPos += 4.5;

    doc.setFillColor(254, 249, 195); // yellow-100
    doc.setDrawColor(253, 224, 71);
    
    const splitQuote = doc.splitTextToSize(`"${result.highlightQuote}"`, pageWidth - 40);
    const boxHeight = splitQuote.length * 4.4 + 5;
    doc.roundedRect(16, yPos, pageWidth - 32, boxHeight, 2, 2, 'FD');

    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(69, 26, 3);
    doc.text(splitQuote, 20, yPos + 4.5);
    yPos += boxHeight + 6;
  } else if (result.relatedContext) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('RELATED DEPARTMENT CONTEXT:', 16, yPos);
    yPos += 4.5;

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    const splitContext = doc.splitTextToSize(result.relatedContext, pageWidth - 40);
    const boxHeight = splitContext.length * 4.4 + 5;
    doc.roundedRect(16, yPos, pageWidth - 32, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(splitContext, 20, yPos + 4.5);
    yPos += boxHeight + 6;
  }

  // Footer / Cryptographic stamp
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(16, footerY - 3, pageWidth - 16, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('EduCite Student Verification Engine • Strictly grounded in official department transcripts & dossiers', 16, footerY);
  doc.text(`Hash: ${result.verificationHash}`, pageWidth - 16, footerY, { align: 'right' });

  // Save the PDF
  const filename = `EduCite_Ramesh_Citation_${result.verificationHash}_${Date.now()}.pdf`;
  doc.save(filename);
}
