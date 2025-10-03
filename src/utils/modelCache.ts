import { pipeline, Pipeline, env } from '@xenova/transformers';

interface ModelCache {
  [key: string]: {
    model: Pipeline | null;
    loading: boolean;
    error: Error | null;
    lastUsed: number;
  };
}

const cache: ModelCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const loadModel = async (
  task: string,
  model: string,
  onProgress?: (progress: number) => void
): Promise<Pipeline> => {
  const cacheKey = `${task}-${model}`;

  // Check if model is in cache and still valid
  if (
    cache[cacheKey]?.model &&
    Date.now() - cache[cacheKey].lastUsed < CACHE_DURATION
  ) {
    cache[cacheKey].lastUsed = Date.now();
    return cache[cacheKey].model!;
  }

  // If model is currently loading, wait for it
  if (cache[cacheKey]?.loading) {
    let attempts = 0;
    while (cache[cacheKey].loading && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (cache[cacheKey].model) {
      return cache[cacheKey].model;
    }
  }

  // Initialize cache entry
  cache[cacheKey] = {
    model: null,
    loading: true,
    error: null,
    lastUsed: Date.now(),
  };

  try {
    // Load model with progress tracking
    const progressSteps = [0, 25, 50, 75, 100];
    let currentStep = 0;

    const modelPipeline = await pipeline(task, model, {
      progress_callback: () => {
        if (currentStep < progressSteps.length) {
          onProgress?.(progressSteps[currentStep]);
          currentStep++;
        }
      },
    });

    cache[cacheKey].model = modelPipeline;
    onProgress?.(100);
    return modelPipeline;
  } catch (error) {
    cache[cacheKey].error = error as Error;
    throw error;
  } finally {
    cache[cacheKey].loading = false;
  }
};

export const clearOldModels = () => {
  const now = Date.now();
  Object.keys(cache).forEach((key) => {
    if (now - cache[key].lastUsed > CACHE_DURATION) {
      delete cache[key];
    }
  });
};

// Clean up old models periodically
setInterval(clearOldModels, CACHE_DURATION); 