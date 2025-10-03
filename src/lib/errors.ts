export class CVError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "CVError";
  }
}

export class ValidationError extends CVError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class APIError extends CVError {
  constructor(message: string) {
    super(message, "API_ERROR");
    this.name = "APIError";
  }
}

export class PDFError extends CVError {
  constructor(message: string) {
    super(message, "PDF_ERROR");
    this.name = "PDFError";
  }
}

export class StorageError extends CVError {
  constructor(message: string) {
    super(message, "STORAGE_ERROR");
    this.name = "StorageError";
  }
}

export function handleError(error: unknown): CVError {
  if (error instanceof CVError) {
    return error;
  }

  if (error instanceof Error) {
    // Map known error types to custom errors
    if (error.message.includes("PDF")) {
      return new PDFError(error.message);
    }
    if (error.message.includes("API")) {
      return new APIError(error.message);
    }
    if (error.message.includes("validation")) {
      return new ValidationError(error.message);
    }
    return new CVError(error.message, "UNKNOWN_ERROR");
  }

  return new CVError("An unknown error occurred", "UNKNOWN_ERROR");
}
