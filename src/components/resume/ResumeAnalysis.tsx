import React from 'react';
import { Card } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { AnalysisSuggestion } from '../../utils/resumeAnalyzer';

interface ResumeAnalysisProps {
  suggestions: AnalysisSuggestion[];
  isLoading?: boolean;
}

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({
  suggestions,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p>Analysiere Lebenslauf...</p>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-6">
        <Alert>
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle>Sehr gut!</AlertTitle>
          <AlertDescription>
            Ihr Lebenslauf entspricht bereits den Best Practices.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Verbesserungsvorschläge</h3>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <Alert
            key={index}
            variant={
              suggestion.type === 'positive'
                ? 'default'
                : suggestion.type === 'warning'
                ? 'warning'
                : 'destructive'
            }
          >
            {suggestion.type === 'positive' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : suggestion.type === 'warning' ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Info className="h-5 w-5 text-red-500" />
            )}
            <AlertTitle>
              {suggestion.type === 'positive'
                ? 'Gut gemacht!'
                : suggestion.type === 'warning'
                ? 'Hinweis'
                : 'Verbesserungspotenzial'}
            </AlertTitle>
            <AlertDescription>
              {suggestion.message}
              {suggestion.section && (
                <div className="mt-2 rounded bg-gray-100 p-2 text-sm">
                  <strong>Betroffener Text:</strong> {suggestion.section}
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </Card>
  );
}; 