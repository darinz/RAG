/**
 * Custom error classes for the RAG application
 */

export class ConfigurationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class RetrievalError extends Error {
  constructor(message: string, public readonly query?: string) {
    super(message);
    this.name = 'RetrievalError';
  }
}

export class IngestionError extends Error {
  constructor(message: string, public readonly documentId?: string) {
    super(message);
    this.name = 'IngestionError';
  }
}

export class ModelError extends Error {
  constructor(message: string, public readonly modelName?: string) {
    super(message);
    this.name = 'ModelError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error handler utility for consistent error formatting
 */
export class ErrorHandler {
  static formatError(error: unknown): { message: string; type: string; details?: any } {
    if (error instanceof Error) {
      return {
        message: error.message,
        type: error.constructor.name,
        details: error instanceof ConfigurationError ? { field: error.field } :
                 error instanceof RetrievalError ? { query: error.query } :
                 error instanceof IngestionError ? { documentId: error.documentId } :
                 error instanceof ModelError ? { modelName: error.modelName } :
                 error instanceof ValidationError ? { field: error.field } :
                 undefined
      };
    }
    
    return {
      message: 'An unknown error occurred',
      type: 'UnknownError',
      details: { originalError: error }
    };
  }
}
