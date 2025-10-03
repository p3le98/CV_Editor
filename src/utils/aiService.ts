import { pipeline, env } from '@xenova/transformers';

// Configure Xenova to use WASM
env.useBrowserCache = true;
env.allowLocalModels = false;

// Cache for the model to avoid reloading
let modelCache: any = null;
let modelLoadPromise: Promise<any> | null = null;

interface AiSuggestionConfig {
  fieldType: string;
  currentValue: string;
  language?: 'de' | 'en';
}

const FIELD_PROMPTS: Record<string, string> = {
  'persönlich-name': 'Formatiere den Namen professionell:',
  'persönlich-email': 'Überprüfe die E-Mail-Adresse auf Professionalität:',
  'persönlich-phone': 'Formatiere die Telefonnummer standardmäßig:',
  'persönlich-address': 'Formatiere die Adresse klar und übersichtlich:',
  'berufserfahrung-position': 'Optimiere den Stellentitel für bessere Wirkung:',
  'berufserfahrung-company': 'Formatiere den Firmennamen korrekt:',
  'berufserfahrung-period': 'Formatiere den Zeitraum einheitlich:',
  'berufserfahrung-description': 'Verbessere die Beschreibung mit aktiven Verben und messbaren Erfolgen:',
  'ausbildung-degree': 'Formatiere den Abschluss standardmäßig:',
  'ausbildung-institution': 'Formatiere den Namen der Institution:',
  'ausbildung-period': 'Formatiere den Zeitraum einheitlich:',
  'ausbildung-description': 'Optimiere die Beschreibung der Ausbildung:',
  'fähigkeiten-category': 'Optimiere die Kategorie-Bezeichnung:',
  'fähigkeiten-skills': 'Formatiere und priorisiere die Fähigkeiten:'
};

async function loadModel() {
  if (modelCache) return modelCache;
  if (modelLoadPromise) return modelLoadPromise;

  modelLoadPromise = pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
  modelCache = await modelLoadPromise;
  return modelCache;
}

export async function generateAiSuggestion({ fieldType, currentValue, language = 'de' }: AiSuggestionConfig): Promise<string> {
  try {
    const model = await loadModel();
    
    // Get the appropriate prompt for the field
    const basePrompt = FIELD_PROMPTS[fieldType] || 'Verbessere den folgenden Text:';
    const prompt = `${basePrompt}\n${currentValue}`;

    // Generate suggestion
    const result = await model(prompt, {
      max_new_tokens: 100,
      temperature: 0.7,
      repetition_penalty: 1.2,
      do_sample: true
    });

    // Clean up and return the suggestion
    const suggestion = result[0].generated_text.trim();
    return suggestion || currentValue;
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    throw error;
  }
}

// Clean up cache when needed
export function clearModelCache() {
  modelCache = null;
  modelLoadPromise = null;
} 