import React from 'react';
import type { ResumeSection } from '../ResumeEditor';

interface TemplateProps {
  sections: ResumeSection[];
}

export const MinimalistTemplate: React.FC<TemplateProps> = ({ sections }) => {
  const personalSection = sections.find(s => s.type === 'persönlich');
  const experienceSections = sections.filter(s => s.type === 'berufserfahrung');
  const educationSections = sections.filter(s => s.type === 'ausbildung');
  const skillsSections = sections.filter(s => s.type === 'fähigkeiten');

  return (
    <div className="min-h-[297mm] bg-white text-gray-800 p-16 max-w-4xl mx-auto">
      {/* Header */}
      {personalSection && (
        <header className="mb-16">
          <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-6">
            {personalSection.content.name}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500 text-sm">
            {personalSection.content.email && (
              <span>{personalSection.content.email}</span>
            )}
            {personalSection.content.phone && (
              <span>{personalSection.content.phone}</span>
            )}
            {personalSection.content.address && (
              <span>{personalSection.content.address}</span>
            )}
          </div>
        </header>
      )}

      {/* Skills Section */}
      {skillsSections.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6">
            Fähigkeiten
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {skillsSections.map((section, index) => (
              <div key={index}>
                {section.content.category && (
                  <h3 className="font-medium text-gray-700 mb-3">
                    {section.content.category}
                  </h3>
                )}
                {section.content.skills && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.content.skills}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experienceSections.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6">
            Berufserfahrung
          </h2>
          <div className="space-y-12">
            {experienceSections.map((section, index) => (
              <div key={index}>
                <div className="grid grid-cols-[1fr,2fr] gap-8">
                  <div>
                    <span className="text-sm text-gray-400">
                      {section.content.period}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {section.content.position}
                    </h3>
                    <p className="text-gray-600 mb-4">{section.content.company}</p>
                    {section.content.description && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {section.content.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {educationSections.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-6">
            Ausbildung
          </h2>
          <div className="space-y-12">
            {educationSections.map((section, index) => (
              <div key={index}>
                <div className="grid grid-cols-[1fr,2fr] gap-8">
                  <div>
                    <span className="text-sm text-gray-400">
                      {section.content.period}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {section.content.degree}
                    </h3>
                    <p className="text-gray-600 mb-4">{section.content.institution}</p>
                    {section.content.description && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {section.content.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalistTemplate; 