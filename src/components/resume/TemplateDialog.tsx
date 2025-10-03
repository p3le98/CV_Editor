import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Layout } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: 'basic',
    name: 'Standard',
    description: 'Klassisches Layout mit klarer Struktur',
    preview: '/templates/basic-preview.png',
    accent: 'bg-blue-500'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Minimalistisches Design mit Seitenleiste',
    preview: '/templates/modern-preview.png',
    accent: 'bg-emerald-500'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Elegantes Design mit Header und zweispaltigem Layout',
    preview: '/templates/professional-preview.png',
    accent: 'bg-purple-500'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Kreatives Design mit Timeline und modernen Elementen',
    preview: '/templates/creative-preview.png',
    accent: 'bg-indigo-500'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Reduziertes Design mit viel Weißraum',
    preview: '/templates/minimalist-preview.png',
    accent: 'bg-gray-500'
  }
];

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layout className="h-5 w-5" />
            Vorlage auswählen
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="grid grid-cols-2 gap-6 py-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`relative p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-gray-200'
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="aspect-[210/297] mb-4 bg-gray-50 rounded-lg overflow-hidden group relative">
                  {/* Template Preview */}
                  <div className={`absolute inset-0 opacity-10 ${template.accent}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-white rounded shadow-sm p-4">
                      {/* Header Preview */}
                      <div className={`h-2 w-24 mb-4 rounded ${template.accent}`} />
                      <div className="space-y-2">
                        <div className="h-1.5 w-32 bg-gray-200 rounded" />
                        <div className="h-1.5 w-48 bg-gray-200 rounded" />
                      </div>
                      {/* Content Preview */}
                      <div className="mt-6 space-y-4">
                        <div className="h-1.5 w-full bg-gray-100 rounded" />
                        <div className="h-1.5 w-5/6 bg-gray-100 rounded" />
                        <div className="h-1.5 w-4/6 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2">
                        <Button size="sm" variant="secondary">
                          Ausgewählt
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog; 