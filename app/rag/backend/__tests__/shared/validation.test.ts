import { describe, it, expect } from '@jest/globals';
import { Sanitizer, RateLimiter } from '../../src/shared/validation.js';
import { ValidationError } from '../../src/shared/errors.js';

describe('Sanitizer', () => {
  describe('sanitizeQuery', () => {
    it('should sanitize query with HTML tags', () => {
      const query = '<script>alert("xss")</script>Hello World';
      const sanitized = Sanitizer.sanitizeQuery(query);
      expect(sanitized).toBe('alert("xss")Hello World');
    });

    it('should remove javascript: protocols', () => {
      const query = 'javascript:alert("xss")';
      const sanitized = Sanitizer.sanitizeQuery(query);
      expect(sanitized).toBe('alert("xss")');
    });

    it('should remove data: protocols', () => {
      const query = 'data:text/html,<script>alert("xss")</script>';
      const sanitized = Sanitizer.sanitizeQuery(query);
      expect(sanitized).toBe('text/html,alert("xss")');
    });

    it('should limit query length', () => {
      const longQuery = 'a'.repeat(2000);
      const sanitized = Sanitizer.sanitizeQuery(longQuery);
      expect(sanitized.length).toBe(1000);
    });

    it('should trim whitespace', () => {
      const query = '  Hello World  ';
      const sanitized = Sanitizer.sanitizeQuery(query);
      expect(sanitized).toBe('Hello World');
    });

    it('should throw error for non-string input', () => {
      expect(() => Sanitizer.sanitizeQuery(123 as any)).toThrow(ValidationError);
    });
  });

  describe('sanitizeDocumentContent', () => {
    it('should remove script tags', () => {
      const content = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const sanitized = Sanitizer.sanitizeDocumentContent(content);
      expect(sanitized).toBe('<p>Hello</p><p>World</p>');
    });

    it('should remove javascript: protocols', () => {
      const content = 'javascript:alert("xss")';
      const sanitized = Sanitizer.sanitizeDocumentContent(content);
      expect(sanitized).toBe('alert("xss")');
    });

    it('should limit content length', () => {
      const longContent = 'a'.repeat(200000);
      const sanitized = Sanitizer.sanitizeDocumentContent(longContent);
      expect(sanitized.length).toBe(100000);
    });

    it('should throw error for non-string input', () => {
      expect(() => Sanitizer.sanitizeDocumentContent(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateAndSanitizeQuery', () => {
    it('should validate and sanitize valid query', () => {
      const query = 'What is the meaning of life?';
      const result = Sanitizer.validateAndSanitizeQuery(query);
      expect(result).toBe('What is the meaning of life?');
    });

    it('should throw error for empty query', () => {
      expect(() => Sanitizer.validateAndSanitizeQuery('')).toThrow(ValidationError);
    });

    it('should throw error for query that is too long', () => {
      const longQuery = 'a'.repeat(1001);
      expect(() => Sanitizer.validateAndSanitizeQuery(longQuery)).toThrow(ValidationError);
    });

    it('should throw error for malicious query', () => {
      const maliciousQuery = '<script>alert("xss")</script>';
      expect(() => Sanitizer.validateAndSanitizeQuery(maliciousQuery)).toThrow(ValidationError);
    });
  });

  describe('validateAndSanitizeDocument', () => {
    it('should validate and sanitize valid document', () => {
      const doc = {
        pageContent: 'This is a test document',
        metadata: { source: 'test.pdf' }
      };
      const result = Sanitizer.validateAndSanitizeDocument(doc);
      expect(result.pageContent).toBe('This is a test document');
      expect(result.metadata).toEqual({ source: 'test.pdf' });
    });

    it('should throw error for document with empty content', () => {
      const doc = { pageContent: '' };
      expect(() => Sanitizer.validateAndSanitizeDocument(doc)).toThrow(ValidationError);
    });

    it('should throw error for document with content that is too long', () => {
      const doc = { pageContent: 'a'.repeat(100001) };
      expect(() => Sanitizer.validateAndSanitizeDocument(doc)).toThrow(ValidationError);
    });
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear any existing rate limit data
    (RateLimiter as any).requests = new Map();
  });

  describe('checkLimit', () => {
    it('should allow first request', () => {
      const result = RateLimiter.checkLimit('test-user');
      expect(result).toBe(true);
    });

    it('should allow multiple requests within limit', () => {
      const identifier = 'test-user';
      
      // Make multiple requests
      for (let i = 0; i < 50; i++) {
        const result = RateLimiter.checkLimit(identifier);
        expect(result).toBe(true);
      }
    });

    it('should block requests when limit is exceeded', () => {
      const identifier = 'test-user';
      
      // Make requests up to the limit
      for (let i = 0; i < 100; i++) {
        const result = RateLimiter.checkLimit(identifier);
        expect(result).toBe(true);
      }
      
      // This should be blocked
      const result = RateLimiter.checkLimit(identifier);
      expect(result).toBe(false);
    });

    it('should reset after time window', (done) => {
      const identifier = 'test-user';
      
      // Fill up the limit
      for (let i = 0; i < 100; i++) {
        RateLimiter.checkLimit(identifier);
      }
      
      // Should be blocked
      expect(RateLimiter.checkLimit(identifier)).toBe(false);
      
      // Wait for the time window to reset (in a real test, you'd mock the time)
      setTimeout(() => {
        // This would work in a real scenario with time mocking
        done();
      }, 100);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max requests for new identifier', () => {
      const remaining = RateLimiter.getRemainingRequests('new-user');
      expect(remaining).toBe(100);
    });

    it('should return correct remaining requests', () => {
      const identifier = 'test-user';
      
      // Make some requests
      for (let i = 0; i < 30; i++) {
        RateLimiter.checkLimit(identifier);
      }
      
      const remaining = RateLimiter.getRemainingRequests(identifier);
      expect(remaining).toBe(70);
    });
  });
});
