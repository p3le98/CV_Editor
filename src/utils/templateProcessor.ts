/**
 * Utility to process PDF-converted HTML templates and make them work with our placeholder system
 */

interface TemplateRegion {
  id: string;
  selector: string;
  placeholder: string;
}

const templateRegions: TemplateRegion[] = [
  { id: 'name', selector: '.name, .full-name, h1', placeholder: '{{NAME}}' },
  { id: 'email', selector: '.email, .contact-email', placeholder: '{{EMAIL}}' },
  { id: 'phone', selector: '.phone, .contact-phone', placeholder: '{{PHONE}}' },
  { id: 'address', selector: '.address, .contact-address', placeholder: '{{ADDRESS}}' },
  { id: 'summary', selector: '.summary, .professional-summary', placeholder: '{{SUMMARY}}' },
  { id: 'experience', selector: '.experience, .work-experience', placeholder: '{{EXPERIENCE}}' },
  { id: 'education', selector: '.education, .academic-background', placeholder: '{{EDUCATION}}' },
  { id: 'skills', selector: '.skills, .technical-skills', placeholder: '{{SKILLS}}' },
  { id: 'languages', selector: '.languages, .language-skills', placeholder: '{{LANGUAGES}}' },
  { id: 'certifications', selector: '.certifications, .certificates', placeholder: '{{CERTIFICATIONS}}' },
  { id: 'projects', selector: '.projects, .portfolio', placeholder: '{{PROJECTS}}' }
];

export function processTemplate(html: string): string {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Process each region
  templateRegions.forEach(region => {
    const elements = doc.querySelectorAll(region.selector);
    elements.forEach(element => {
      // Replace the element's content with the placeholder
      element.innerHTML = region.placeholder;
    });
  });

  // Add our custom styles
  const styleElement = doc.createElement('style');
  styleElement.textContent = `
    /* Custom styles for dynamic content */
    .experience-item, .education-item, .project-item {
      margin-bottom: 1.5em;
    }
    .date {
      color: #666;
      font-size: 0.9em;
    }
    .location {
      color: #666;
      font-style: italic;
    }
    .description {
      margin-top: 0.5em;
    }
    .technologies {
      color: #444;
      font-size: 0.9em;
    }
    ul.skills-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
    }
    ul.skills-list li {
      background: #f5f5f5;
      padding: 0.3em 0.8em;
      border-radius: 3px;
      font-size: 0.9em;
    }
  `;
  doc.head.appendChild(styleElement);

  // Return the processed HTML
  return doc.documentElement.outerHTML;
}

export function injectPlaceholders(html: string): string {
  let processedHtml = html;

  // Add meta viewport tag for responsiveness if not present
  if (!processedHtml.includes('viewport')) {
    processedHtml = processedHtml.replace('</head>',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0"></head>'
    );
  }

  // Replace content with placeholders
  templateRegions.forEach(region => {
    const regex = new RegExp(`(?<=<${region.selector}>).*?(?=</${region.selector}>)`, 'gs');
    processedHtml = processedHtml.replace(regex, region.placeholder);
  });

  return processedHtml;
}

export async function preprocessTemplate(templatePath: string): Promise<string> {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    const html = await response.text();
    
    // Process the template
    const processedHtml = processTemplate(html);
    
    // Inject placeholders
    return injectPlaceholders(processedHtml);
  } catch (error) {
    console.error('Error preprocessing template:', error);
    throw error;
  }
} 