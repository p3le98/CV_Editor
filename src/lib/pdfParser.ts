// pdfparser.ts
import { type PDFDocumentProxy } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import { preprocessWithLLM } from "./llmPreprocessor";
import { spacyService } from "./nlp/spacyService";
import { parsedCVService } from "./db/parsedCVService";

// Helper function to calculate confidence score
function calculateConfidenceScore(data: any): number {
  let score = 0;
  const weights = {
    name: 0.3,
    title: 0.2,
    contact: 0.2,
    sections: 0.3,
  };

  // Check name and title
  if (data.name) score += weights.name;
  if (data.title) score += weights.title;

  // Check contact information
  const contactScore = Object.values(data.contact).filter(Boolean).length / 3;
  score += contactScore * weights.contact;

  // Check sections
  const sectionScore =
    data.sections.reduce((acc: number, section: any) => {
      return acc + (section.content.length > 0 ? 1 : 0);
    }, 0) / data.sections.length;
  score += sectionScore * weights.sections;

  return Number(score.toFixed(2));
}

type Language = "en" | "de";

const sectionHeadersByLanguage = {
  en: [
    { regex: /EXPERIENCE|WORK|EMPLOYMENT/i, title: "Experience" },
    { regex: /EDUCATION|ACADEMIC/i, title: "Education" },
    { regex: /SKILLS|TECHNOLOGIES|COMPETENCIES/i, title: "Skills" },
  ],
  de: [
    {
      regex: /BERUFSERFAHRUNG|ARBEITSERFAHRUNG|BERUFLICHER WERDEGANG/i,
      title: "Berufserfahrung",
    },
    {
      regex: /AUSBILDUNG|BILDUNG|AKADEMISCHER WERDEGANG/i,
      title: "Ausbildung",
    },
    { regex: /KENNTNISSE|FÄHIGKEITEN|KOMPETENZEN/i, title: "Kenntnisse" },
  ],
};

const defaultSectionTitlesByLanguage = {
  en: {
    experience: "Experience",
    education: "Education",
    skills: "Skills",
  },
  de: {
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse",
  },
};

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  const workerUrl = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url,
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.toString();
}

interface CVData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  sections: Array<{
    title: string;
    content: string[];
  }>;
}

// Helper function to extract text from PDF
async function extractTextFromPDF(
  file: File,
): Promise<{ text: string; method: string }> {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided");
  }
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/extract-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`PDF extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PDF extraction result:", data);

    if (!data.text) {
      throw new Error("No text extracted from PDF");
    }

    return { text: data.text, method: data.method_used };
  } catch (error) {
    console.error("Error in extractTextFromPDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Helper function to extract entities using LLM
async function extractEntities(
  text: string,
  language: Language,
): Promise<{ name: string; title: string }> {
  const llmData = await preprocessWithLLM(text, "categorization");
  return {
    name: llmData.personalData[0]?.name || "",
    title: llmData.personalData[0]?.title || "",
  };
}

// Helper function to extract contact information
function extractContactInfo(text: string): {
  email: string;
  phone: string;
  location: string;
} {
  const emailRegex = /[\w.-]+@[\w.-]+\.[\w]{2,}/;
  const phoneRegex = /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;
  const locationRegex = /(?:Location|Address):?\s*([\w\s,-]+)/i;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const locationMatch = text.match(locationRegex);

  return {
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    location: locationMatch ? locationMatch[1].trim() : "",
  };
}

// Helper function to extract sections
function extractSections(
  text: string,
  language: Language,
): Array<{ title: string; content: string[] }> {
  const sectionHeaders = sectionHeadersByLanguage[language];

  const sections: Array<{ title: string; content: string[] }> = [];
  let currentSection: { title: string; content: string[] } | null = null;

  text.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const matchedHeader = sectionHeaders.find((header) =>
      header.regex.test(trimmedLine),
    );
    if (matchedHeader) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: matchedHeader.title, content: [] };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    }
  });

  if (currentSection) sections.push(currentSection);
  return sections;
}

// Main function to parse PDF
export async function parsePDF(
  file: File,
  userId: string,
): Promise<CVData & { language: Language }> {
  console.log("Starting PDF parsing with file:", file);
  try {
    // Extract text from PDF
    const { text: fullText, method } = await extractTextFromPDF(file);
    console.log(`PDF extracted using ${method}`);
    console.log("Extracted text:", fullText);

    // Detect language using DeepSeek R1
    const detectedLanguage = (await preprocessWithLLM(
      fullText,
      "languageDetection",
    )) as Language;
    console.log("Detected language with DeepSeek:", detectedLanguage);
    console.log("Detected language:", detectedLanguage);

    // Use spaCy for entity extraction
    const analysis = await spacyService.analyzeText(fullText);

    // Extract name and title from spaCy entities
    const nameEntity = analysis.entities.find((e) => e.label === "PERSON");
    const orgEntity = analysis.entities.find((e) => e.label === "ORG");

    const name = nameEntity?.text || "";
    const title = orgEntity?.text || "";
    console.log("Extracted entities:", { name, title });

    // Extract contact information
    const contact = extractContactInfo(fullText);
    console.log("Extracted contact info:", contact);

    // Extract sections
    const sections = extractSections(fullText, detectedLanguage);
    console.log("Extracted sections:", sections);

    const defaultTitles = defaultSectionTitlesByLanguage[detectedLanguage];
    // Calculate confidence score based on completeness
    const confidenceScore = calculateConfidenceScore({
      name,
      title,
      contact,
      sections,
    });

    // Save parsed data to database
    await parsedCVService.saveParsedCV({
      user_id: userId,
      original_text: fullText,
      parsed_data: { name, title, contact, sections },
      language: detectedLanguage,
      confidence_score: confidenceScore,
    });

    return {
      name,
      title,
      contact,
      language: detectedLanguage,
      sections:
        sections.length > 0
          ? sections
          : [
              { title: defaultTitles.experience, content: [] },
              { title: defaultTitles.education, content: [] },
              { title: defaultTitles.skills, content: [] },
            ],
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF. Please try again.");
  }
}
