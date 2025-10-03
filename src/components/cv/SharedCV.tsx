import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shareService } from "@/lib/db/shareService";
import CVPreview from "./CVPreview";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SharedCV = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSharedCV = async () => {
      try {
        if (!shareId) throw new Error("No share ID provided");
        const data = await shareService.getSharedCV(shareId);
        setCvData(data);
      } catch (error: any) {
        setError(error.message || "Failed to load CV");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedCV();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <CVPreview data={cvData} />
      </div>
    </div>
  );
};

export default SharedCV;
