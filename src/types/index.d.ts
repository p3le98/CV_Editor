/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

interface ResumeSectionContent {
  // Personal
  name?: string;
  email?: string;
  phone?: string;
  address?: string;

  // Work Experience
  position?: string;
  company?: string;
  period?: string;
  description?: string;

  // Education
  degree?: string;
  institution?: string;

  // Skills
  category?: string;
  skills?: string;
}

interface ResumeSection {
  id: string;
  type: 'persönlich' | 'berufserfahrung' | 'ausbildung' | 'fähigkeiten';
  content: ResumeSectionContent;
}

interface FileWithContent extends File {
  content?: string;
} 