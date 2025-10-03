import { Pipeline } from '@xenova/transformers';
import { loadModel } from './modelCache';

// Configure for browser environment
env.useBrowserCache = true;
env.allowLocalModels = false;

export interface AnalysisSuggestion {
  type: 'improvement' | 'warning' | 'positive';
  message: string;
  section?: string;
}

export interface AnalysisResult {
  suggestions: AnalysisSuggestion[];
  detectedLanguage: string;
}

// Initialize the pipeline lazily
let classifier: Pipeline | null = null;
let sentimentAnalyzer: Pipeline | null = null;

const initializePipelines = async (onProgress?: (progress: number) => void) => {
  if (!classifier) {
    classifier = await loadModel(
      'text-classification',
      'Xenova/bert-base-multilingual-uncased',
      (progress) => onProgress?.(progress * 0.5)
    );
  }
  if (!sentimentAnalyzer) {
    sentimentAnalyzer = await loadModel(
      'sentiment-analysis',
      'Xenova/bert-base-multilingual-uncased',
      (progress) => onProgress?.(50 + progress * 0.5)
    );
  }
};

const analyzeText = async (
  text: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  await initializePipelines(onProgress);
  const suggestions: AnalysisSuggestion[] = [];

  // Detect language
  const languageResult = await classifier!(text, { topk: 1 });
  const detectedLanguage = (languageResult as any)[0].label;

  // Analyze content sections
  const sections = text.split('\n\n');
  for (const section of sections) {
    if (section.trim().length === 0) continue;

    // Analyze sentiment and impact
    const sentiment = await sentimentAnalyzer!(section);
    
    // Check for passive voice (simple regex-based check)
    if (/wurde|wurden|wird|werden/.test(section)) {
      suggestions.push({
        type: 'improvement',
        message: 'Verwenden Sie aktive Formulierungen statt passiver Sprache für mehr Wirkung.',
        section: section.substring(0, 100) + '...',
      });
    }

    // Check for weak words
    const weakWords = ['gut', 'schön', 'nett', 'vielleicht', 'eventuell'];
    for (const word of weakWords) {
      if (section.toLowerCase().includes(word)) {
        suggestions.push({
          type: 'improvement',
          message: `Ersetzen Sie "${word}" durch einen stärkeren, spezifischeren Ausdruck.`,
          section: section.substring(0, 100) + '...',
        });
      }
    }

    // Check for bullet points and structure
    if (section.length > 200 && !section.includes('•') && !section.includes('-')) {
      suggestions.push({
        type: 'warning',
        message: 'Lange Textabschnitte könnten durch Aufzählungspunkte übersichtlicher gestaltet werden.',
        section: section.substring(0, 100) + '...',
      });
    }

    // Check for numbers and metrics
    if (!/\d/.test(section) && section.length > 100) {
      suggestions.push({
        type: 'improvement',
        message: 'Fügen Sie wenn möglich konkrete Zahlen oder Metriken hinzu, um Ihre Erfolge zu quantifizieren.',
        section: section.substring(0, 100) + '...',
      });
    }
  }

  // Add positive feedback for good practices
  if (text.includes('verantwortlich für') || text.includes('erreicht') || text.includes('entwickelt')) {
    suggestions.push({
      type: 'positive',
      message: 'Gute Verwendung von aktiven, ergebnisorientierten Formulierungen.',
    });
  }

  return {
    suggestions,
    detectedLanguage,
  };
};

export const analyzeResume = async (
  sections: ResumeSection[],
  onProgress?: (progress: number) => void
): Promise<AnalysisResult> => {
  // Combine all sections into a single text for analysis
  const fullText = sections
    .map((section) => {
      const content = section.content;
      return Object.values(content).filter(Boolean).join('\n');
    })
    .join('\n\n');

  return analyzeText(fullText, onProgress);
}; 