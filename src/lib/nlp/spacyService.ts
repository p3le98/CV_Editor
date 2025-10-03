import { APIError } from "@/lib/errors";

const SPACY_API_URL = "http://localhost:8000";

export interface SpacyEntity {
  text: string;
  label: string;
  start: number;
  end: number;
}

export interface SpacyAnalysis {
  entities: SpacyEntity[];
  language: string;
  tokens: string[];
  noun_chunks: string[];
}

export const spacyService = {
  async analyzeText(text: string): Promise<SpacyAnalysis> {
    try {
      const response = await fetch(`${SPACY_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in spaCy analysis:", error);
      throw new APIError("Failed to analyze text with spaCy");
    }
  },

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${SPACY_API_URL}/detect-language`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const { language } = await response.json();
      return language;
    } catch (error) {
      console.error("Error in language detection:", error);
      throw new APIError("Failed to detect language");
    }
  },
};
