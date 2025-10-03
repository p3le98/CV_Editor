import React from 'react';
import type { ResumeSection } from '../ResumeEditor';

interface TemplateProps {
  sections: ResumeSection[];
}

export const ModernTemplate: React.FC<TemplateProps> = ({ sections }) => {
  const personalSection = sections.find(s => s.type === 'persönlich');
  const experienceSections = sections.filter(s => s.type === 'berufserfahrung');
  const educationSections = sections.filter(s => s.type === 'ausbildung');
  const skillsSections = sections.filter(s => s.type === 'fähigkeiten');

  return (
    <div className="flex min-h-[297mm] bg-white text-gray-800">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-8 flex flex-col space-y-6">
        {personalSection && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {personalSection.content.name}
            </h1>
            <div className="space-y-2 text-sm">
              {personalSection.content.email && (
                <p>{personalSection.content.email}</p>
              )}
              {personalSection.content.phone && (
                <p>{personalSection.content.phone}</p>
              )}
              {personalSection.content.address && (
                <p className="whitespace-pre-wrap">{personalSection.content.address}</p>
              )}
            </div>
          </div>
        )}

        {skillsSections.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
              Fähigkeiten
            </h2>
            {skillsSections.map((section, index) => (
              <div key={index} className="mb-4">
                {section.content.category && (
                  <h3 className="font-medium mb-2">{section.content.category}</h3>
                )}
                {section.content.skills && (
                  <p className="text-sm">{section.content.skills}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 flex flex-col space-y-8">
        {experienceSections.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
              Berufserfahrung
            </h2>
            {experienceSections.map((section, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{section.content.position}</h3>
                    <p className="text-gray-600">{section.content.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">{section.content.period}</span>
                </div>
                {section.content.description && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {section.content.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {educationSections.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
              Ausbildung
            </h2>
            {educationSections.map((section, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{section.content.degree}</h3>
                    <p className="text-gray-600">{section.content.institution}</p>
                  </div>
                  <span className="text-sm text-gray-500">{section.content.period}</span>
                </div>
                {section.content.description && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {section.content.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate; 