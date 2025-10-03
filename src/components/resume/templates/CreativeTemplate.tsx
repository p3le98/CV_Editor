import React from 'react';
import type { ResumeSection } from '../ResumeEditor';

interface TemplateProps {
  sections: ResumeSection[];
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ sections }) => {
  const personalSection = sections.find(s => s.type === 'persönlich');
  const experienceSections = sections.filter(s => s.type === 'berufserfahrung');
  const educationSections = sections.filter(s => s.type === 'ausbildung');
  const skillsSections = sections.filter(s => s.type === 'fähigkeiten');

  return (
    <div className="min-h-[297mm] bg-gradient-to-br from-indigo-50 to-white text-gray-800">
      {/* Header with Accent Bar */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
        <div className="pl-8 pt-12 pr-12">
          {personalSection && (
            <div>
              <h1 className="text-4xl font-bold text-indigo-900 mb-4">
                {personalSection.content.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-indigo-600">
                {personalSection.content.email && (
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                    {personalSection.content.email}
                  </div>
                )}
                {personalSection.content.phone && (
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                    {personalSection.content.phone}
                  </div>
                )}
                {personalSection.content.address && (
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2" />
                    {personalSection.content.address}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Timeline */}
      <div className="grid grid-cols-12 gap-8 px-12 py-8">
        {/* Left Column: Experience & Education */}
        <div className="col-span-8">
          {/* Experience Timeline */}
          {experienceSections.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                Berufserfahrung
              </h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-0 top-0 h-full w-px bg-indigo-200" />
                
                {experienceSections.map((section, index) => (
                  <div key={index} className="relative pl-8 pb-8">
                    {/* Timeline Dot */}
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-indigo-500 font-medium mb-2">
                        {section.content.period}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {section.content.position}
                      </h3>
                      <div className="text-indigo-600 mb-3">{section.content.company}</div>
                      {section.content.description && (
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {section.content.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Timeline */}
          {educationSections.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                Ausbildung
              </h2>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-0 top-0 h-full w-px bg-indigo-200" />
                
                {educationSections.map((section, index) => (
                  <div key={index} className="relative pl-8 pb-8">
                    {/* Timeline Dot */}
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-indigo-500 font-medium mb-2">
                        {section.content.period}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {section.content.degree}
                      </h3>
                      <div className="text-indigo-600 mb-3">{section.content.institution}</div>
                      {section.content.description && (
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {section.content.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Skills */}
        <div className="col-span-4">
          {skillsSections.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">
                Fähigkeiten
              </h2>
              {skillsSections.map((section, index) => (
                <div key={index} className="mb-6">
                  {section.content.category && (
                    <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                      {section.content.category}
                    </h3>
                  )}
                  {section.content.skills && (
                    <div className="flex flex-wrap gap-2">
                      {section.content.skills.split(',').map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate; 