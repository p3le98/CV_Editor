declare module '@xenova/transformers' {
  export const env: {
    useBrowserCache: boolean;
    allowLocalModels: boolean;
  };

  export interface PipelineOptions {
    topk?: number;
    [key: string]: any;
  }

  export interface ClassificationResult {
    label: string;
    score: number;
  }

  export interface SentimentResult {
    label: string;
    score: number;
  }

  export type Pipeline = (
    text: string,
    options?: PipelineOptions
  ) => Promise<ClassificationResult[] | SentimentResult[]>;

  export function pipeline(
    task: string,
    model: string
  ): Promise<Pipeline>;
} 