import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, type ButtonProps } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BasicTemplate } from './templates/BasicTemplate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Upload, Save, Download, Layout, Wand2, MessageSquare, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { processFile, parseResumeText } from '../../utils/fileProcessor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { exportToPDF } from '../../utils/pdfExporter';
import { generateAiSuggestion } from '../../utils/aiService';
import { toast } from '../ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Plus } from 'lucide-react';
import { DragDropContext, Draggable, Droppable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { ModernTemplate } from './templates/ModernTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { TemplateDialog } from './TemplateDialog';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';

type ContentKey = 'name' | 'email' | 'phone' | 'address' | 'position' | 
                 'company' | 'period' | 'description' | 'degree' | 
                 'institution' | 'category' | 'skills';

export interface ResumeSection {
  id: string;
  type: 'persönlich' | 'berufserfahrung' | 'ausbildung' | 'fähigkeiten';
  content: {
    [K in ContentKey]?: string;
  };
}

interface AiSuggestions {
  [key: string]: string;
}

// Add button variant types
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Update button props where variants are used
const ButtonWithVariant: React.FC<ButtonProps & { variant?: ButtonVariant; size?: ButtonSize }> = Button;

export const ResumeEditor: React.FC = () => {
  const location = useLocation();
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [activeTab, setActiveTab] = useState('edit');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    // Check if we should show the upload dialog
    if (location.state?.action === 'upload') {
      setShowUploadDialog(true);
    }
  }, [location]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await processFile(file);
      const parsedSections = parseResumeText(text);
      setSections(parsedSections);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error processing file:', error);
      // TODO: Show error toast to user
    }
  };

  const addSection = (type: ResumeSection['type']) => {
    const newSection: ResumeSection = {
      id: Date.now().toString(),
      type,
      content: {},
    };
    setSections([...sections, newSection]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (!previewRef.current) {
        throw new Error('Preview element not found');
      }
      await exportToPDF(previewRef.current, sections);
      toast({
        title: 'PDF erfolgreich erstellt',
        description: 'Ihr Lebenslauf wurde als PDF exportiert.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Fehler beim PDF-Export',
        description: 'Bitte versuchen Sie es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // TODO: Implement AI optimization
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing
    } finally {
      setIsOptimizing(false);
    }
  };

  const requestAiSuggestion = async (fieldType: string, currentValue: string) => {
    setIsOptimizing(true);
    try {
      const suggestion = await generateAiSuggestion({
        fieldType,
        currentValue,
        language: 'de'
      });
      setAiSuggestions({ ...aiSuggestions, [fieldType]: suggestion });
      toast({
        title: 'KI-Vorschlag generiert',
        description: 'Ein neuer Verbesserungsvorschlag ist verfügbar.',
      });
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({
        title: 'Fehler bei der KI-Generierung',
        description: 'Bitte versuchen Sie es später erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    toast({
      title: 'Abschnitt gelöscht',
      description: 'Der Abschnitt wurde erfolgreich entfernt.',
    });
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate sections={sections} />;
      case 'professional':
        return <ProfessionalTemplate sections={sections} />;
      case 'creative':
        return <CreativeTemplate sections={sections} />;
      case 'minimalist':
        return <MinimalistTemplate sections={sections} />;
      default:
        return <BasicTemplate sections={sections} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ButtonWithVariant
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
            className="w-[200px]"
          >
            <Layout className="mr-2 h-4 w-4" />
            Vorlage wählen
          </ButtonWithVariant>
        </div>
        
        <div className="flex items-center space-x-2">
          <ButtonWithVariant
            variant="outline"
            onClick={handleOptimize}
            disabled={isOptimizing}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isOptimizing ? 'Optimiere...' : 'Mit KI optimieren'}
          </ButtonWithVariant>
          <ButtonWithVariant
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportiere...' : 'Als PDF exportieren'}
          </ButtonWithVariant>
          <ButtonWithVariant onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Speichere...' : 'Speichern'}
          </ButtonWithVariant>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        {/* Fixed Editor Panel */}
        <div className="overflow-hidden flex flex-col">
          <Card className="p-4 h-full">
            <div className="space-y-4 h-full flex flex-col">
              {/* Section Management */}
              <div className="flex flex-wrap gap-2">
                {!sections.some(s => s.type === 'persönlich') && (
                  <ButtonWithVariant 
                    variant="outline" 
                    size="sm"
                    onClick={() => addSection('persönlich')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Persönliche Daten
                  </ButtonWithVariant>
                )}
                <ButtonWithVariant 
                  variant="outline" 
                  size="sm"
                  onClick={() => addSection('berufserfahrung')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Berufserfahrung
                </ButtonWithVariant>
                <ButtonWithVariant 
                  variant="outline" 
                  size="sm"
                  onClick={() => addSection('ausbildung')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ausbildung
                </ButtonWithVariant>
                <ButtonWithVariant 
                  variant="outline" 
                  size="sm"
                  onClick={() => addSection('fähigkeiten')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Fähigkeiten
                </ButtonWithVariant>
              </div>

              {/* Sections Accordion */}
              <ScrollArea className="flex-grow">
                <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                  <Droppable droppableId="sections">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        <Accordion
                          type="single"
                          collapsible
                          value={activeSection}
                          onValueChange={setActiveSection}
                          className="space-y-4"
                        >
                          {sections.map((section: ResumeSection, index: number) => (
                            <Draggable key={section.id} draggableId={section.id} index={index}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`rounded-lg border ${
                                    snapshot.isDragging ? 'border-blue-500 shadow-lg' : ''
                                  }`}
                                >
                                  <AccordionItem value={section.id} className="border-none">
                                    <div className="flex items-center">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="px-2 py-4 cursor-grab hover:text-blue-500"
                                      >
                                        <GripVertical className="h-5 w-5" />
                                      </div>
                                      <AccordionTrigger className="flex-1 px-4 hover:no-underline">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg font-semibold">
                                            {section.type === 'persönlich' && 'Persönliche Daten'}
                                            {section.type === 'berufserfahrung' && 'Berufserfahrung'}
                                            {section.type === 'ausbildung' && 'Ausbildung'}
                                            {section.type === 'fähigkeiten' && 'Fähigkeiten'}
                                          </span>
                                          {Object.keys(section.content).length === 0 && (
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                          )}
                                        </div>
                                      </AccordionTrigger>
                                      <ButtonWithVariant
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSection(section.id);
                                        }}
                                        className="mr-2 hover:text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </ButtonWithVariant>
                                    </div>
                                    <AccordionContent className="px-4 pt-2">
                                      <SectionEditor
                                        section={section}
                                        onUpdate={(updatedSection: ResumeSection) => {
                                          setSections(
                                            sections.map((s: ResumeSection) =>
                                              s.id === updatedSection.id ? updatedSection : s
                                            )
                                          );
                                        }}
                                        onRequestAiSuggestion={requestAiSuggestion}
                                        aiSuggestions={aiSuggestions}
                                      />
                                    </AccordionContent>
                                  </AccordionItem>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Accordion>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </ScrollArea>
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className={`overflow-hidden transition-opacity duration-200 ${isDragging ? 'opacity-50' : ''}`}>
          <Card className="p-4 h-full">
            <ScrollArea className="h-full">
              <div ref={previewRef}>
                {renderTemplate()}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lebenslauf hochladen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klicken</span> oder Datei hierher ziehen
                  </p>
                  <p className="text-xs text-gray-500">PDF oder TXT (max. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={(template) => {
          setSelectedTemplate(template);
          setShowTemplateDialog(false);
          toast({
            title: 'Vorlage geändert',
            description: 'Die neue Vorlage wurde erfolgreich angewendet.',
          });
        }}
      />
    </div>
  );
};

interface SectionEditorProps {
  section: ResumeSection;
  onUpdate: (section: ResumeSection) => void;
  onRequestAiSuggestion: (fieldType: string, currentValue: string) => void;
  aiSuggestions: AiSuggestions;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdate,
  onRequestAiSuggestion,
  aiSuggestions
}: SectionEditorProps) => {
  const updateContent = (key: ContentKey, value: string) => {
    onUpdate({
      ...section,
      content: { ...section.content, [key]: value },
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: ContentKey) => {
    updateContent(key, e.target.value);
  };

  const renderInputWithSuggestion = (
    key: ContentKey,
    placeholder: string,
    type: string = 'text',
    isTextarea: boolean = false
  ) => {
    const InputComponent = isTextarea ? Textarea : Input;
    const suggestionKey = `${section.type}-${key}`;
    const hasSuggestion = aiSuggestions[suggestionKey];

    return (
      <div className="relative">
        <div className="flex space-x-2">
          <InputComponent
            placeholder={placeholder}
            type={type}
            value={section.content[key] || ''}
            onChange={(e) => handleInputChange(e, key)}
            className={`flex-1 ${hasSuggestion ? 'border-blue-500' : ''}`}
          />
          <ButtonWithVariant
            size="icon"
            variant="ghost"
            onClick={() => onRequestAiSuggestion(suggestionKey, section.content[key] || '')}
            className="flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
          </ButtonWithVariant>
        </div>
        {hasSuggestion && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="text-sm text-blue-500 cursor-pointer mt-1">
                AI Vorschlag verfügbar
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>KI-Verbesserungsvorschlag</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>{aiSuggestions[suggestionKey]}</p>
                <ButtonWithVariant
                  className="mt-4"
                  onClick={() => updateContent(key, aiSuggestions[suggestionKey])}
                >
                  Vorschlag übernehmen
                </ButtonWithVariant>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {section.type === 'persönlich' && (
        <div className="space-y-4">
          {renderInputWithSuggestion('name', 'Vollständiger Name')}
          {renderInputWithSuggestion('email', 'E-Mail', 'email')}
          {renderInputWithSuggestion('phone', 'Telefon')}
          {renderInputWithSuggestion('address', 'Adresse', 'text', true)}
        </div>
      )}
      {section.type === 'berufserfahrung' && (
        <div className="space-y-4">
          {renderInputWithSuggestion('position', 'Position')}
          {renderInputWithSuggestion('company', 'Unternehmen')}
          {renderInputWithSuggestion('period', 'Zeitraum (z.B. Jan 2020 - Present)')}
          {renderInputWithSuggestion('description', 'Beschreibung', 'text', true)}
        </div>
      )}
      {section.type === 'ausbildung' && (
        <div className="space-y-4">
          {renderInputWithSuggestion('degree', 'Abschluss')}
          {renderInputWithSuggestion('institution', 'Institution')}
          {renderInputWithSuggestion('period', 'Zeitraum')}
          {renderInputWithSuggestion('description', 'Beschreibung', 'text', true)}
        </div>
      )}
      {section.type === 'fähigkeiten' && (
        <div className="space-y-4">
          {renderInputWithSuggestion('category', 'Kategorie (z.B. Programmiersprachen)')}
          {renderInputWithSuggestion('skills', 'Fähigkeiten (durch Kommas getrennt)', 'text', true)}
        </div>
      )}
    </div>
  );
};

export default ResumeEditor; 