import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, FileText, Briefcase, GraduationCap, Award } from "lucide-react";

interface EditorControlsProps {
  onPromptSubmit?: (prompt: string) => void;
  onSectionUpdate?: (section: string, content: any) => void;
  onTemplateChange?: (template: string) => void;
  language?: "en" | "de";
}

const translations = {
  en: {
    aiAssistant: "AI Assistant",
    promptPlaceholder:
      "Enter your prompt (e.g., 'Add my volunteer experience')",
    submit: "Submit",
    cvSections: "CV Sections",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    awards: "Awards",
    workExperience: "Work Experience",
    workExperiencePlaceholder: "Enter your work experience",
    educationPlaceholder: "Enter your education details",
    skillsPlaceholder: "Enter your skills",
    awardsAchievements: "Awards & Achievements",
    awardsPlaceholder: "Enter your awards and achievements",
    template: "Template",
    selectTemplate: "Select a template",
  },
  de: {
    aiAssistant: "KI-Assistent",
    promptPlaceholder:
      "Geben Sie Ihre Anweisung ein (z.B. 'Fügen Sie meine ehrenamtliche Tätigkeit hinzu')",
    submit: "Absenden",
    cvSections: "Lebenslauf-Abschnitte",
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse",
    awards: "Auszeichnungen",
    workExperience: "Berufserfahrung",
    workExperiencePlaceholder: "Geben Sie Ihre Berufserfahrung ein",
    educationPlaceholder: "Geben Sie Ihre Ausbildung ein",
    skillsPlaceholder: "Geben Sie Ihre Kenntnisse ein",
    awardsAchievements: "Auszeichnungen & Erfolge",
    awardsPlaceholder: "Geben Sie Ihre Auszeichnungen und Erfolge ein",
    template: "Vorlage",
    selectTemplate: "Wählen Sie eine Vorlage",
  },
};

const EditorControls = ({
  onPromptSubmit = () => {},
  onSectionUpdate = () => {},
  onTemplateChange = () => {},
  language = "en",
}: EditorControlsProps) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const t = translations[language];

  const templates = [
    { id: "modern", name: "Modern" },
    { id: "classic", name: "Classic" },
    { id: "minimal", name: "Minimal" },
  ];

  return (
    <div className="h-full w-full bg-background border-r p-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            {t.aiAssistant}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={t.promptPlaceholder}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button onClick={() => onPromptSubmit(aiPrompt)}>{t.submit}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{t.cvSections}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="experience">{t.experience}</TabsTrigger>
              <TabsTrigger value="education">{t.education}</TabsTrigger>
              <TabsTrigger value="skills">{t.skills}</TabsTrigger>
              <TabsTrigger value="awards">{t.awards}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] w-full mt-4">
              <TabsContent value="experience">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">
                      {t.workExperience}
                    </h3>
                  </div>
                  <Textarea
                    placeholder={t.workExperiencePlaceholder}
                    className="min-h-[200px]"
                    onChange={(e) =>
                      onSectionUpdate("experience", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="education">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">{t.education}</h3>
                  </div>
                  <Textarea
                    placeholder={t.educationPlaceholder}
                    className="min-h-[200px]"
                    onChange={(e) =>
                      onSectionUpdate("education", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">{t.skills}</h3>
                  </div>
                  <Textarea
                    placeholder={t.skillsPlaceholder}
                    className="min-h-[200px]"
                    onChange={(e) => onSectionUpdate("skills", e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="awards">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">
                      {t.awardsAchievements}
                    </h3>
                  </div>
                  <Textarea
                    placeholder={t.awardsPlaceholder}
                    className="min-h-[200px]"
                    onChange={(e) => onSectionUpdate("awards", e.target.value)}
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.template}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={onTemplateChange} defaultValue="modern">
            <SelectTrigger>
              <SelectValue placeholder={t.selectTemplate} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorControls;
