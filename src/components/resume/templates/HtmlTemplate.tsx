import React, { useEffect, useState } from 'react';
import type { ResumeSection } from '../ResumeEditor';
import { loadHtmlTemplate, renderHtmlTemplate } from '../../../utils/htmlTemplateService';

interface HtmlTemplateProps {
  sections: ResumeSection[];
  templateId: string;
}

export const HtmlTemplate: React.FC<HtmlTemplateProps> = ({ sections, templateId }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templateHtml = await loadHtmlTemplate(templateId);
        const renderedHtml = renderHtmlTemplate(templateHtml, sections);
        setHtml(renderedHtml);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    };

    loadTemplate();
  }, [sections, templateId]);

  return (
    <div 
      className="html-template"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default HtmlTemplate; 