import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, FilePlus } from "lucide-react";

interface EntryOptionsProps {
  onCreateNew?: () => void;
  onUpload?: () => void;
}

const EntryOptions = ({
  onCreateNew = () => {},
  onUpload = () => {},
}: EntryOptionsProps) => {
  return (
    <div className="w-full h-full min-h-[200px] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Create Your CV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="default"
            size="lg"
            className="w-full flex items-center gap-2"
            onClick={onCreateNew}
          >
            <FilePlus className="w-5 h-5" />
            Create New CV
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center gap-2"
            onClick={onUpload}
          >
            <FileUp className="w-5 h-5" />
            Upload Existing CV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntryOptions;
