import { describe, it, expect } from '@jest/globals';
import {
  ConfigurationError,
  RetrievalError,
  IngestionError,
  ModelError,
  ValidationError,
  ErrorHandler,
} from '../../src/shared/errors.js';

describe('Custom Error Classes', () => {
  describe('ConfigurationError', () => {
    it('should create error with message and field', () => {
      const error = new ConfigurationError('Invalid config', 'retrieverProvider');
      expect(error.message).toBe('Invalid config');
      expect(error.field).toBe('retrieverProvider');
      expect(error.name).toBe('ConfigurationError');
    });

    it('should create error with message only', () => {
      const error = new ConfigurationError('Invalid config');
      expect(error.message).toBe('Invalid config');
      expect(error.field).toBeUndefined();
    });
  });

  describe('RetrievalError', () => {
    it('should create error with message and query', () => {
      const error = new RetrievalError('Failed to retrieve', 'test query');
      expect(error.message).toBe('Failed to retrieve');
      expect(error.query).toBe('test query');
      expect(error.name).toBe('RetrievalError');
    });
  });

  describe('IngestionError', () => {
    it('should create error with message and documentId', () => {
      const error = new IngestionError('Failed to ingest', 'doc123');
      expect(error.message).toBe('Failed to ingest');
      expect(error.documentId).toBe('doc123');
      expect(error.name).toBe('IngestionError');
    });
  });

  describe('ModelError', () => {
    it('should create error with message and modelName', () => {
      const error = new ModelError('Model failed', 'gpt-4');
      expect(error.message).toBe('Model failed');
      expect(error.modelName).toBe('gpt-4');
      expect(error.name).toBe('ModelError');
    });
  });

  describe('ValidationError', () => {
    it('should create error with message and field', () => {
      const error = new ValidationError('Invalid input', 'query');
      expect(error.message).toBe('Invalid input');
      expect(error.field).toBe('query');
      expect(error.name).toBe('ValidationError');
    });
  });
});

describe('ErrorHandler', () => {
  describe('formatError', () => {
    it('should format ConfigurationError', () => {
      const error = new ConfigurationError('Invalid config', 'retrieverProvider');
      const formatted = ErrorHandler.formatError(error);
      
      expect(formatted.message).toBe('Invalid config');
      expect(formatted.type).toBe('ConfigurationError');
      expect(formatted.details).toEqual({ field: 'retrieverProvider' });
    });

    it('should format RetrievalError', () => {
      const error = new RetrievalError('Failed to retrieve', 'test query');
      const formatted = ErrorHandler.formatError(error);
      
      expect(formatted.message).toBe('Failed to retrieve');
      expect(formatted.type).toBe('RetrievalError');
      expect(formatted.details).toEqual({ query: 'test query' });
    });

    it('should format unknown error', () => {
      const error = 'Unknown error';
      const formatted = ErrorHandler.formatError(error);
      
      expect(formatted.message).toBe('An unknown error occurred');
      expect(formatted.type).toBe('UnknownError');
      expect(formatted.details).toEqual({ originalError: 'Unknown error' });
    });

    it('should format generic Error', () => {
      const error = new Error('Generic error');
      const formatted = ErrorHandler.formatError(error);
      
      expect(formatted.message).toBe('Generic error');
      expect(formatted.type).toBe('Error');
      expect(formatted.details).toBeUndefined();
    });
  });
});
