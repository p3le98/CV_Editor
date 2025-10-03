import { ResumeData } from '../types/resume';
import { preprocessTemplate } from '../utils/templateProcessor';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  path?: string;
}

export const templates: Template[] = [
  {
    id: 'julie',
    name: 'Julie',
    description: 'Professional template with a modern touch',
    path: '/templates/html/resume-template-julie.html',
    thumbnail: '/templates/thumbnails/julie.png'
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    description: 'Elegant and sophisticated design',
    path: '/templates/html/resume-template-alexandria.html',
    thumbnail: '/templates/thumbnails/alexandria.png'
  },
  {
    id: 'cv86',
    name: 'CV86',
    description: 'Clean and minimalist layout',
    path: '/templates/html/cv86-edc-en.html',
    thumbnail: '/templates/thumbnails/cv86.png'
  },
  {
    id: 'cv41',
    name: 'CV41',
    description: 'Traditional resume with a contemporary feel',
    path: '/templates/html/cv41-edc-en.html',
    thumbnail: '/templates/thumbnails/cv41.png'
  },
  {
    id: 'cv87',
    name: 'CV87',
    description: 'Modern professional design',
    path: '/templates/html/cv87-edc-en.html',
    thumbnail: '/templates/thumbnails/cv87.png'
  },
  {
    id: 'cv88',
    name: 'CV88',
    description: 'Sleek and professional layout',
    path: '/templates/html/cv88-edc-en.html',
    thumbnail: '/templates/thumbnails/cv88.png'
  },
  {
    id: 'cv57',
    name: 'CV57',
    description: 'Classic resume with a modern twist',
    path: '/templates/html/cv57-edc-en.html',
    thumbnail: '/templates/thumbnails/cv57.png'
  },
  {
    id: 'cv60',
    name: 'CV60',
    description: 'Contemporary professional design',
    path: '/templates/html/cv60-edc-en.html',
    thumbnail: '/templates/thumbnails/cv60.png'
  }
];

export class TemplateService {
  private static processedTemplates: Map<string, string> = new Map();

  static getTemplates(): Template[] {
    return templates;
  }

  static getTemplate(id: string): Template | undefined {
    return templates.find(template => template.id === id);
  }

  static async loadAndProcessTemplate(templatePath: string): Promise<string> {
    // Check if we've already processed this template
    const cached = this.processedTemplates.get(templatePath);
    if (cached) {
      return cached;
    }

    // Process the template and cache it
    const processed = await preprocessTemplate(templatePath);
    this.processedTemplates.set(templatePath, processed);
    return processed;
  }

  static async renderTemplate(templateId: string, data: ResumeData): Promise<string> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      if (template.path) {
        // Load and process the template
        let templateHtml = await this.loadAndProcessTemplate(template.path);
        
        // Replace placeholders with actual data
        templateHtml = templateHtml.replace(/{{NAME}}/g, data.personalInfo?.name || '');
        templateHtml = templateHtml.replace(/{{EMAIL}}/g, data.personalInfo?.email || '');
        templateHtml = templateHtml.replace(/{{PHONE}}/g, data.personalInfo?.phone || '');
        templateHtml = templateHtml.replace(/{{ADDRESS}}/g, data.personalInfo?.address || '');
        templateHtml = templateHtml.replace(/{{WEBSITE}}/g, data.personalInfo?.website || '');
        templateHtml = templateHtml.replace(/{{LINKEDIN}}/g, data.personalInfo?.linkedin || '');
        templateHtml = templateHtml.replace(/{{SUMMARY}}/g, data.summary || '');

        // Handle experience section
        let experienceHtml = '';
        if (data.experience?.length) {
          experienceHtml = data.experience.map(exp => `
            <div class="experience-item">
              <h3>${exp.title} at ${exp.company}</h3>
              <p class="date">${exp.startDate} - ${exp.endDate}</p>
              ${exp.location ? `<p class="location">${exp.location}</p>` : ''}
              <p class="description">${exp.description}</p>
            </div>
          `).join('');
        }
        templateHtml = templateHtml.replace(/{{EXPERIENCE}}/g, experienceHtml);

        // Handle education section
        let educationHtml = '';
        if (data.education?.length) {
          educationHtml = data.education.map(edu => `
            <div class="education-item">
              <h3>${edu.degree} - ${edu.institution}</h3>
              <p class="date">${edu.startDate} - ${edu.endDate}</p>
              ${edu.location ? `<p class="location">${edu.location}</p>` : ''}
              ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
              ${edu.gpa ? `<p class="gpa">GPA: ${edu.gpa}</p>` : ''}
            </div>
          `).join('');
        }
        templateHtml = templateHtml.replace(/{{EDUCATION}}/g, educationHtml);

        // Handle skills section
        let skillsHtml = '';
        if (data.skills?.length) {
          skillsHtml = `<ul class="skills-list">${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>`;
        }
        templateHtml = templateHtml.replace(/{{SKILLS}}/g, skillsHtml);

        // Handle languages section
        let languagesHtml = '';
        if (data.languages?.length) {
          languagesHtml = `<ul class="skills-list">${data.languages.map(lang => `<li>${lang}</li>`).join('')}</ul>`;
        }
        templateHtml = templateHtml.replace(/{{LANGUAGES}}/g, languagesHtml);

        // Handle certifications section
        let certificationsHtml = '';
        if (data.certifications?.length) {
          certificationsHtml = `<ul>${data.certifications.map(cert => `<li>${cert}</li>`).join('')}</ul>`;
        }
        templateHtml = templateHtml.replace(/{{CERTIFICATIONS}}/g, certificationsHtml);

        // Handle projects section
        let projectsHtml = '';
        if (data.projects?.length) {
          projectsHtml = data.projects.map(project => `
            <div class="project-item">
              <h3>${project.name}</h3>
              <p class="description">${project.description}</p>
              ${project.technologies?.length ? 
                `<p class="technologies">Technologies: ${project.technologies.join(', ')}</p>` : ''}
              ${project.link ? `<p class="link"><a href="${project.link}" target="_blank">Project Link</a></p>` : ''}
            </div>
          `).join('');
        }
        templateHtml = templateHtml.replace(/{{PROJECTS}}/g, projectsHtml);

        return templateHtml;
      }

      // Fallback to basic template if no path is specified
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.personalInfo?.name || 'Resume'}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                border-bottom: 2px solid #333;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="resume">
              <header>
                <h1>${data.personalInfo?.name || ''}</h1>
                <p>${data.personalInfo?.email || ''}</p>
                <p>${data.personalInfo?.phone || ''}</p>
              </header>
              
              ${data.summary ? `
                <section class="section">
                  <h2 class="section-title">Summary</h2>
                  <p>${data.summary}</p>
                </section>
              ` : ''}

              ${data.experience?.length ? `
                <section class="section">
                  <h2 class="section-title">Experience</h2>
                  ${data.experience.map(exp => `
                    <div class="experience-item">
                      <h3>${exp.title} at ${exp.company}</h3>
                      <p>${exp.startDate} - ${exp.endDate}</p>
                      <p>${exp.description}</p>
                    </div>
                  `).join('')}
                </section>
              ` : ''}

              ${data.education?.length ? `
                <section class="section">
                  <h2 class="section-title">Education</h2>
                  ${data.education.map(edu => `
                    <div class="education-item">
                      <h3>${edu.degree} - ${edu.institution}</h3>
                      <p>${edu.startDate} - ${edu.endDate}</p>
                      <p>${edu.description || ''}</p>
                    </div>
                  `).join('')}
                </section>
              ` : ''}

              ${data.skills?.length ? `
                <section class="section">
                  <h2 class="section-title">Skills</h2>
                  <ul class="skills-list">
                    ${data.skills.map(skill => `<li>${skill}</li>`).join('')}
                  </ul>
                </section>
              ` : ''}
            </div>
          </body>
        </html>
      `;
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  }
} 