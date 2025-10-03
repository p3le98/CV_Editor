import React from 'react';
import { Template, templates } from '../services/TemplateService';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
}) => {
  return (
    <div className="template-selector">
      <h2>Choose a Template</h2>
      <div className="template-grid">
        {templates.map((template: Template) => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <div className="template-preview">
              <img 
                src={template.thumbnail} 
                alt={`${template.name} template preview`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/templates/thumbnails/placeholder.png';
                }}
              />
            </div>
            <div className="template-info">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className="selected-badge">
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .template-selector {
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .template-selector h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.5em;
        }
        
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }
        
        .template-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          background: #fff;
        }
        
        .template-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          border-color: #b0b0b0;
        }
        
        .template-card.selected {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        }
        
        .template-preview {
          position: relative;
          padding-top: 141.4%; /* A4 aspect ratio */
          background: #f8f9fa;
          overflow: hidden;
        }
        
        .template-preview img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .template-card:hover .template-preview img {
          transform: scale(1.05);
        }
        
        .template-info {
          padding: 16px;
          background: #fff;
        }
        
        .template-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.1em;
          color: #333;
        }
        
        .template-info p {
          margin: 0;
          color: #666;
          font-size: 0.9em;
          line-height: 1.4;
        }
        
        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #007bff;
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.8em;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
          .template-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }
          
          .template-info {
            padding: 12px;
          }
          
          .template-info h3 {
            font-size: 1em;
          }
          
          .template-info p {
            font-size: 0.85em;
          }
        }
      `}</style>
    </div>
  );
}; 