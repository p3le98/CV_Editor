import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { handleError, ValidationError } from "@/lib/errors";
import { handlePrompt } from "@/lib/promptHandler";
import { cvService } from "@/lib/db/cvService";
import { shareService } from "@/lib/db/shareService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Download,
  Share2,
  Undo2,
  Redo2,
  Languages,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import EditorControls from "./EditorControls";
import CVPreview from "./CVPreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CVEditorProps {
  initialData?: any;
  cvId?: string;
  userId: string;
  onSave?: (data: any) => void;
}

const CVEditor: React.FC<CVEditorProps> = ({
  initialData = null,
  cvId,
  userId,
  onSave = () => {},
}) => {
  const [language, setLanguage] = useState<"en" | "de">(
    initialData?.language ||
      (localStorage.getItem("preferredLanguage") as "en" | "de") ||
      "en",
  );

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const getDefaultData = (lang: "en" | "de") => ({
    name: "",
    title: "",
    contact: {
      email: "",
      phone: "",
      location: "",
    },
    sections: [
      { title: lang === "en" ? "Experience" : "Berufserfahrung", content: [] },
      { title: lang === "en" ? "Education" : "Ausbildung", content: [] },
      { title: lang === "en" ? "Skills" : "Kenntnisse", content: [] },
    ],
    language: lang,
  });

  const [cvData, setCVData] = useState(initialData || getDefaultData(language));
  const [template, setTemplate] = useState("modern");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [history, setHistory] = useState<any[]>([getDefaultData(language)]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setCVData(initialData);
      setHistory([initialData]);
      setCurrentIndex(0);
      if (initialData.language) {
        setLanguage(initialData.language);
      }
    }
  }, [initialData]);

  // Update history when CV data changes (except during undo/redo)
  useEffect(() => {
    if (
      !isUndoRedo &&
      JSON.stringify(cvData) !== JSON.stringify(history[currentIndex])
    ) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(cvData)));
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
    setIsUndoRedo(false);
  }, [cvData]);

  const validateCV = (data: any) => {
    if (!data.name?.trim()) {
      throw new ValidationError("Name is required");
    }
    if (!data.sections?.length) {
      throw new ValidationError("At least one section is required");
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      validateCV(cvData);
      if (cvId) {
        await cvService.updateCV(cvId, {
          ...cvData,
          user_id: userId,
        });
      } else {
        await cvService.saveCV({
          ...cvData,
          user_id: userId,
        });
      }
      toast({
        title: "Success",
        description: "CV saved successfully",
      });
      onSave(cvData);
    } catch (error) {
      const cvError = handleError(error);
      console.error("Error saving CV:", cvError);
      toast({
        title: "Error",
        description: "Failed to save CV",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById("cv-preview");
      if (!element) {
        throw new Error("Preview element not found");
      }

      const opt = {
        margin: 10,
        filename: `${cvData.name || "CV"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();

      toast({
        title: "Success",
        description: "CV exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export CV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!cvId) {
        toast({
          title: "Error",
          description: "Please save your CV first",
          variant: "destructive",
        });
        return;
      }

      setIsSharing(true);
      const shareData = await shareService.createShareLink(cvId);
      const shareUrl = `${window.location.origin}/cv/share/${shareData.share_id}`;
      setShareUrl(shareUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handlePromptSubmit = async (prompt: string) => {
    try {
      const response = await handlePrompt(prompt, cvData);

      if (response.action === "add") {
        setCVData((prev) => {
          const newData = { ...prev };
          if (response.section === "basic") {
            return { ...newData, ...response.content };
          } else if (response.section === "contact") {
            return {
              ...newData,
              contact: { ...newData.contact, ...response.content },
            };
          } else {
            const sectionIndex = newData.sections.findIndex(
              (s) => s.title.toLowerCase() === response.section.toLowerCase(),
            );
            if (sectionIndex >= 0) {
              const content = Array.isArray(response.content)
                ? response.content
                : [response.content];
              if (response.position === "start") {
                newData.sections[sectionIndex].content.unshift(...content);
              } else if (response.position === "end" || !response.position) {
                newData.sections[sectionIndex].content.push(...content);
              } else {
                newData.sections[sectionIndex].content.splice(
                  response.position,
                  0,
                  ...content,
                );
              }
            }
          }
          return newData;
        });
      } else if (response.action === "update") {
        setCVData((prev) => {
          const newData = { ...prev };
          if (response.section === "basic") {
            return { ...newData, ...response.content };
          } else if (response.section === "contact") {
            return {
              ...newData,
              contact: { ...newData.contact, ...response.content },
            };
          } else {
            const sectionIndex = newData.sections.findIndex(
              (s) => s.title.toLowerCase() === response.section.toLowerCase(),
            );
            if (sectionIndex >= 0) {
              newData.sections[sectionIndex].content = Array.isArray(
                response.content,
              )
                ? response.content
                : [response.content];
            }
          }
          return newData;
        });
      } else if (response.action === "remove") {
        setCVData((prev) => {
          const newData = { ...prev };
          if (response.section === "basic") {
            const keys = Object.keys(response.content);
            keys.forEach((key) => (newData[key] = ""));
          } else if (response.section === "contact") {
            const keys = Object.keys(response.content);
            keys.forEach((key) => (newData.contact[key] = ""));
          } else {
            const sectionIndex = newData.sections.findIndex(
              (s) => s.title.toLowerCase() === response.section.toLowerCase(),
            );
            if (sectionIndex >= 0) {
              if (Array.isArray(response.content)) {
                newData.sections[sectionIndex].content = newData.sections[
                  sectionIndex
                ].content.filter((item) => !response.content.includes(item));
              } else {
                newData.sections[sectionIndex].content = newData.sections[
                  sectionIndex
                ].content.filter((item) => item !== response.content);
              }
            }
          }
          return newData;
        });
      }
    } catch (error) {
      console.error("Error handling prompt:", error);
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
    }
  };

  const handleSectionUpdate = (section: string, content: any) => {
    setCVData((prev) => ({
      ...prev,
      sections: prev.sections.map((s: any) =>
        s.title.toLowerCase() === section.toLowerCase()
          ? { ...s, content: [content] }
          : s,
      ),
    }));
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
  };

  const handleLanguageChange = () => {
    const newLanguage = language === "en" ? "de" : "en";
    setLanguage(newLanguage);

    // Update section titles based on new language
    setCVData((prev) => ({
      ...prev,
      language: newLanguage,
      sections: prev.sections.map((section) => ({
        ...section,
        title:
          {
            Experience: "Berufserfahrung",
            Berufserfahrung: "Experience",
            Education: "Ausbildung",
            Ausbildung: "Education",
            Skills: "Kenntnisse",
            Kenntnisse: "Skills",
          }[section.title] || section.title,
      })),
    }));
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full bg-background flex flex-col">
        <div className="p-4 border-b flex justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (currentIndex > 0) {
                  setIsUndoRedo(true);
                  setCurrentIndex(currentIndex - 1);
                  setCVData(
                    JSON.parse(JSON.stringify(history[currentIndex - 1])),
                  );
                }
              }}
              disabled={currentIndex <= 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (currentIndex < history.length - 1) {
                  setIsUndoRedo(true);
                  setCurrentIndex(currentIndex + 1);
                  setCVData(
                    JSON.parse(JSON.stringify(history[currentIndex + 1])),
                  );
                }
              }}
              disabled={currentIndex >= history.length - 1}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleLanguageChange}
              title={`Switch to ${language === "en" ? "German" : "English"}`}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isSharing || !cvId}
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save CV"
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="w-1/2 h-full border-r">
            <EditorControls
              onPromptSubmit={handlePromptSubmit}
              onSectionUpdate={handleSectionUpdate}
              onTemplateChange={handleTemplateChange}
              language={language}
            />
          </div>
          <div className="w-1/2 h-full">
            <CVPreview
              data={cvData}
              template={template as "modern" | "classic" | "minimal"}
            />
          </div>
        </div>

        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share your CV</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view your CV:
              </p>
              <div className="flex gap-2">
                <Input readOnly value={shareUrl} className="flex-1" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Success",
                      description: "Link copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default CVEditor;
