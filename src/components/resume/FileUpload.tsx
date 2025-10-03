import React, { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import * as PDFJS from 'pdfjs-dist';

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

interface FileUploadProps {
  onProcessComplete: (text: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onProcessComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    try {
      setProcessing(true);
      setProgress(10);

      if (file.type === 'application/pdf') {
        // Process PDF
        const arrayBuffer = await file.arrayBuffer();
        setProgress(30);
        
        const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
        setProgress(50);

        const numPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';

          setProgress(50 + (40 * i) / numPages);
        }

        onProcessComplete(fullText);
      } else if (file.type === 'text/plain') {
        // Process text file
        const text = await file.text();
        setProgress(90);
        onProcessComplete(text);
      } else {
        throw new Error('Nicht unterstütztes Dateiformat');
      }

      setProgress(100);
      toast({
        title: 'Erfolgreich hochgeladen',
        description: 'Ihre Datei wurde erfolgreich verarbeitet.',
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Fehler beim Hochladen',
        description: 'Beim Verarbeiten der Datei ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [onProcessComplete, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  return (
    <Card className="p-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center"
      >
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          <div className="mb-4 text-4xl">📄</div>
          <p className="mb-2 text-lg font-semibold">
            Ziehen Sie Ihren Lebenslauf hierher oder klicken Sie zum Auswählen
          </p>
          <p className="text-sm text-gray-500">PDF oder TXT Dateien</p>
        </label>

        {processing && (
          <div className="mt-4 w-full">
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-sm text-gray-500">Verarbeite Datei...</p>
          </div>
        )}
      </div>
    </Card>
  );
}; 