import * as pdfjs from 'pdfjs-dist';
import { ResumeSection } from '../components/resume/ResumeEditor';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function processFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return await processPDF(file);
  } else if (file.type === 'text/plain') {
    return await processTXT(file);
  }
  throw new Error('Unsupported file type');
}

async function processPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function processTXT(file: File): Promise<string> {
  const text = await file.text();
  return text;
}

export function parseResumeText(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  
  // Try to identify personal information
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  
  if (emailMatch || phoneMatch) {
    sections.push({
      id: Date.now().toString(),
      type: 'persönlich',
      content: {
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
      }
    });
  }

  // Try to identify work experience
  const experienceMatches = text.match(/(?:BERUFSERFAHRUNG|WORK EXPERIENCE|EXPERIENCE)(.*?)(?=EDUCATION|AUSBILDUNG|$)/si);
  if (experienceMatches) {
    sections.push({
      id: (Date.now() + 1).toString(),
      type: 'berufserfahrung',
      content: {
        description: experienceMatches[1].trim()
      }
    });
  }

  // Try to identify education
  const educationMatches = text.match(/(?:EDUCATION|AUSBILDUNG)(.*?)(?=SKILLS|FÄHIGKEITEN|$)/si);
  if (educationMatches) {
    sections.push({
      id: (Date.now() + 2).toString(),
      type: 'ausbildung',
      content: {
        description: educationMatches[1].trim()
      }
    });
  }

  // Try to identify skills
  const skillsMatches = text.match(/(?:SKILLS|FÄHIGKEITEN|KENNTNISSE)(.*?)(?=$)/si);
  if (skillsMatches) {
    sections.push({
      id: (Date.now() + 3).toString(),
      type: 'fähigkeiten',
      content: {
        skills: skillsMatches[1].trim()
      }
    });
  }

  return sections;
} 