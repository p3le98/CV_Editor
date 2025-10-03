import React, { useState, useEffect } from "react";
import { cvService } from "@/lib/db/cvService";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { parsePDF } from "@/lib/pdfParser";
import CVEditor from "./cv/CVEditor";
import EntryOptions from "./cv/EntryOptions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Home = () => {
  // Clear data when component unmounts or window closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("cvData");
      localStorage.removeItem("editorState");
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const [cvData, setCvData] = useState<any>(null);
  const [savedCVs, setSavedCVs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const { toast } = useToast();

  // Temporary user ID for demo
  const userId = "demo-user";

  useEffect(() => {
    const loadSavedCVs = async () => {
      try {
        const cvs = await cvService.getCVs(userId);
        setSavedCVs(cvs);
      } catch (error) {
        console.error("Error loading CVs:", error);
        toast({
          title: "Error",
          description: "Failed to load saved CVs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedCVs();
  }, []);
  const [showEditor, setShowEditor] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const navigate = useNavigate();

  const handleCreateNew = () => {
    setShowEditor(true);
  };

  const handleUpload = () => {
    setShowUploadDialog(true);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold text-center">CV Creator</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {!showEditor ? (
          <div className="container mx-auto max-w-4xl h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : savedCVs.length > 0 ? (
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Your CVs</h2>
                  <Button onClick={handleCreateNew}>Create New CV</Button>
                </div>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="grid gap-4">
                    {savedCVs.map((cv) => (
                      <Card key={cv.id} className="relative group">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">
                                {cv.name || "Untitled CV"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(cv.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCVId(cv.id);
                                  setCvData(cv);
                                  setShowEditor(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await cvService.deleteCV(cv.id);
                                    setSavedCVs(
                                      savedCVs.filter((c) => c.id !== cv.id),
                                    );
                                    toast({
                                      title: "Success",
                                      description: "CV deleted successfully",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete CV",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <EntryOptions
                onCreateNew={handleCreateNew}
                onUpload={handleUpload}
              />
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-8rem)]">
            <CVEditor
              initialData={cvData}
              cvId={selectedCVId || undefined}
              userId={userId}
            />
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <input
              type="file"
              accept=".pdf"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  alert("Please select a file");
                  return;
                }
                if (file.type !== "application/pdf") {
                  alert("Please upload a PDF file");
                  return;
                }
                try {
                  console.log("Starting PDF parsing with file:", file);
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    try {
                      const parsedData = await parsePDF(file, userId);
                      // Set initial language based on CV content
                      if (parsedData.language) {
                        localStorage.setItem(
                          "preferredLanguage",
                          parsedData.language,
                        );
                      }
                      console.log("PDF parsed successfully:", parsedData);
                      setShowUploadDialog(false);
                      setShowEditor(true);
                      setCvData(parsedData);
                    } catch (parseError) {
                      console.error("Error in PDF parsing:", parseError);
                      alert("Error parsing PDF. Please try again.");
                    }
                  };
                  reader.onerror = (error) => {
                    console.error("FileReader error:", error);
                    alert("Error reading file. Please try again.");
                  };
                  reader.readAsArrayBuffer(file);
                } catch (error) {
                  console.error("Error in file handling:", error);
                  alert("Error handling file. Please try again.");
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Only PDF files are accepted
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
