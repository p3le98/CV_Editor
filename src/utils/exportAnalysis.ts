import { AnalysisResult } from './resumeAnalyzer';

interface ExportOptions {
  format: 'pdf' | 'txt' | 'json';
  filename?: string;
}

export const exportAnalysis = async (
  analysis: AnalysisResult,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> => {
  const filename = options.filename || `resume-analysis-${new Date().toISOString().split('T')[0]}`;

  switch (options.format) {
    case 'pdf':
      await exportToPDF(analysis, filename);
      break;
    case 'txt':
      exportToTXT(analysis, filename);
      break;
    case 'json':
      exportToJSON(analysis, filename);
      break;
  }
};

const exportToPDF = async (
  analysis: AnalysisResult,
  filename: string
): Promise<void> => {
  const { default: html2pdf } = await import('html2pdf.js');
  
  // Create a temporary element to render the analysis
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #2563eb;">Lebenslauf-Analyse</h1>
      <p><strong>Erkannte Sprache:</strong> ${analysis.detectedLanguage}</p>
      
      <h2 style="color: #374151; margin-top: 20px;">Vorschläge</h2>
      ${analysis.suggestions
        .map(
          (suggestion) => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px;">
          <p style="color: ${
            suggestion.type === 'positive'
              ? '#059669'
              : suggestion.type === 'warning'
              ? '#d97706'
              : '#dc2626'
          }; font-weight: bold;">
            ${
              suggestion.type === 'positive'
                ? '✓ Gut gemacht!'
                : suggestion.type === 'warning'
                ? '⚠ Hinweis'
                : '↗ Verbesserungspotenzial'
            }
          </p>
          <p>${suggestion.message}</p>
          ${
            suggestion.section
              ? `<p style="background: #f3f4f6; padding: 8px; margin-top: 8px; font-size: 0.9em;">
                   <strong>Betroffener Text:</strong> ${suggestion.section}
                 </p>`
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const options = {
    margin: 10,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(options).from(element).save();
};

const exportToTXT = (analysis: AnalysisResult, filename: string): void => {
  let content = `Lebenslauf-Analyse\n`;
  content += `=================\n\n`;
  content += `Erkannte Sprache: ${analysis.detectedLanguage}\n\n`;
  content += `Vorschläge:\n`;
  content += `----------\n\n`;

  analysis.suggestions.forEach((suggestion) => {
    content += `${
      suggestion.type === 'positive'
        ? '[✓]'
        : suggestion.type === 'warning'
        ? '[!]'
        : '[↗]'
    } ${suggestion.message}\n`;
    if (suggestion.section) {
      content += `    Text: ${suggestion.section}\n`;
    }
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadFile(blob, `${filename}.txt`);
};

const exportToJSON = (analysis: AnalysisResult, filename: string): void => {
  const blob = new Blob([JSON.stringify(analysis, null, 2)], {
    type: 'application/json',
  });
  downloadFile(blob, `${filename}.json`);
};

const downloadFile = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}; 