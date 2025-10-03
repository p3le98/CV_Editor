import React from 'react';
import type { ResumeSection } from '../ResumeEditor';

interface TemplateProps {
  sections: ResumeSection[];
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ sections }) => {
  const personalSection = sections.find(s => s.type === 'persönlich');
  const experienceSections = sections.filter(s => s.type === 'berufserfahrung');
  const educationSections = sections.filter(s => s.type === 'ausbildung');
  const skillsSections = sections.filter(s => s.type === 'fähigkeiten');

  return (
    <div className="min-h-[297mm] bg-white text-gray-800 p-12">
      {/* Header */}
      {personalSection && (
        <header className="text-center border-b-2 border-gray-300 pb-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {personalSection.content.name}
          </h1>
          <div className="flex justify-center items-center space-x-4 text-gray-600">
            {personalSection.content.email && (
              <span>{personalSection.content.email}</span>
            )}
            {personalSection.content.phone && (
              <>
                <span className="text-gray-300">•</span>
                <span>{personalSection.content.phone}</span>
              </>
            )}
            {personalSection.content.address && (
              <>
                <span className="text-gray-300">•</span>
                <span>{personalSection.content.address}</span>
              </>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Experience and Education (2/3 width) */}
        <div className="col-span-2 space-y-8">
          {experienceSections.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="border-b-2 border-blue-500 pb-1">Berufserfahrung</span>
              </h2>
              {experienceSections.map((section, index) => (
                <div key={index} className="mb-8">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-sm text-gray-500">
                      {section.content.period}
                    </div>
                    <div className="col-span-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {section.content.position}
                      </h3>
                      <p className="text-gray-600 mb-2">{section.content.company}</p>
                      {section.content.description && (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {section.content.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {educationSections.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="border-b-2 border-blue-500 pb-1">Ausbildung</span>
              </h2>
              {educationSections.map((section, index) => (
                <div key={index} className="mb-8">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-sm text-gray-500">
                      {section.content.period}
                    </div>
                    <div className="col-span-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {section.content.degree}
                      </h3>
                      <p className="text-gray-600 mb-2">{section.content.institution}</p>
                      {section.content.description && (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {section.content.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Skills (1/3 width) */}
        <div>
          {skillsSections.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="border-b-2 border-blue-500 pb-1">Fähigkeiten</span>
              </h2>
              {skillsSections.map((section, index) => (
                <div key={index} className="mb-6">
                  {section.content.category && (
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {section.content.category}
                    </h3>
                  )}
                  {section.content.skills && (
                    <div className="flex flex-wrap gap-2">
                      {section.content.skills.split(',').map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate; 