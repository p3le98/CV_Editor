import React from 'react';
import { Button } from '../../ui/button';
import { ResumeSection } from '../ResumeEditor';
import { exportToPDF } from '../../../utils/pdfExport';

interface BasicTemplateProps {
  sections: ResumeSection[];
}

export const BasicTemplate: React.FC<BasicTemplateProps> = ({ sections }) => {
  const personalSection = sections.find((s) => s.type === 'persönlich');
  const experienceSections = sections.filter((s) => s.type === 'berufserfahrung');
  const educationSections = sections.filter((s) => s.type === 'ausbildung');
  const skillsSections = sections.filter((s) => s.type === 'fähigkeiten');

  const handleExport = async () => {
    try {
      await exportToPDF('resume-template');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleExport} className="mb-4">
        Als PDF exportieren
      </Button>
      
      <div id="resume-template" className="mx-auto max-w-[210mm] bg-white p-8 shadow-lg">
        {/* Header / Personal Information */}
        {personalSection && (
          <header className="border-b border-gray-300 pb-6">
            <h1 className="mb-2 text-3xl font-bold">{personalSection.content.name}</h1>
            <div className="text-gray-600">
              <p>{personalSection.content.email}</p>
              <p>{personalSection.content.phone}</p>
              <p>{personalSection.content.address}</p>
            </div>
          </header>
        )}

        {/* Work Experience */}
        {experienceSections.length > 0 && (
          <section className="mt-6 border-b border-gray-300 pb-6">
            <h2 className="mb-4 text-2xl font-semibold">Berufserfahrung</h2>
            {experienceSections.map((section) => (
              <div key={section.id} className="mb-4">
                <h3 className="font-semibold">{section.content.position}</h3>
                <p className="text-gray-600">
                  {section.content.company} | {section.content.period}
                </p>
                <p className="mt-2">{section.content.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {educationSections.length > 0 && (
          <section className="mt-6 border-b border-gray-300 pb-6">
            <h2 className="mb-4 text-2xl font-semibold">Ausbildung</h2>
            {educationSections.map((section) => (
              <div key={section.id} className="mb-4">
                <h3 className="font-semibold">{section.content.degree}</h3>
                <p className="text-gray-600">
                  {section.content.institution} | {section.content.period}
                </p>
                <p className="mt-2">{section.content.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skillsSections.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-4 text-2xl font-semibold">Fähigkeiten</h2>
            {skillsSections.map((section) => (
              <div key={section.id} className="mb-4">
                <h3 className="font-semibold">{section.content.category}</h3>
                <p className="mt-2">{section.content.skills}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}; 