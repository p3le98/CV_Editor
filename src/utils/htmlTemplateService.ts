import type { ResumeSection } from '../components/resume/ResumeEditor';

interface HtmlTemplate {
  id: string;
  name: string;
  path: string;
}

export const htmlTemplates: HtmlTemplate[] = [
  // Add your HTML templates here
  // Example:
  // {
  //   id: 'template1',
  //   name: 'Template 1',
  //   path: '/templates/html/template1.html'
  // }
];

export async function loadHtmlTemplate(templateId: string): Promise<string> {
  const template = htmlTemplates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const response = await fetch(template.path);
  if (!response.ok) {
    throw new Error(`Failed to load template ${templateId}`);
  }

  return response.text();
}

export function renderHtmlTemplate(template: string, sections: ResumeSection[]): string {
  let html = template;

  // Get personal section
  const personalSection = sections.find(s => s.type === 'persönlich');
  const experienceSections = sections.filter(s => s.type === 'berufserfahrung');
  const educationSections = sections.filter(s => s.type === 'ausbildung');
  const skillsSections = sections.filter(s => s.type === 'fähigkeiten');

  // Replace personal information placeholders
  if (personalSection) {
    html = html.replace('{{name}}', personalSection.content.name || '')
               .replace('{{email}}', personalSection.content.email || '')
               .replace('{{phone}}', personalSection.content.phone || '')
               .replace('{{address}}', personalSection.content.address || '');
  }

  // Replace experience sections
  let experienceHtml = '';
  experienceSections.forEach(section => {
    experienceHtml += `
      <div class="experience-item">
        <h3>${section.content.position || ''}</h3>
        <div class="company">${section.content.company || ''}</div>
        <div class="period">${section.content.period || ''}</div>
        <div class="description">${section.content.description || ''}</div>
      </div>
    `;
  });
  html = html.replace('{{experience}}', experienceHtml);

  // Replace education sections
  let educationHtml = '';
  educationSections.forEach(section => {
    educationHtml += `
      <div class="education-item">
        <h3>${section.content.degree || ''}</h3>
        <div class="institution">${section.content.institution || ''}</div>
        <div class="period">${section.content.period || ''}</div>
        <div class="description">${section.content.description || ''}</div>
      </div>
    `;
  });
  html = html.replace('{{education}}', educationHtml);

  // Replace skills sections
  let skillsHtml = '';
  skillsSections.forEach(section => {
    skillsHtml += `
      <div class="skills-item">
        <h3>${section.content.category || ''}</h3>
        <div class="skills">${section.content.skills || ''}</div>
      </div>
    `;
  });
  html = html.replace('{{skills}}', skillsHtml);

  return html;
} 