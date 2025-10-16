/**
 * Input validation and sanitization utilities
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Common validation schemas
 */
export const QuerySchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(1000, 'Query cannot exceed 1000 characters')
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Query contains potentially malicious content'
    ),
});

export const DocumentSchema = z.object({
  pageContent: z.string()
    .min(1, 'Document content cannot be empty')
    .max(100000, 'Document content cannot exceed 100,000 characters'),
  metadata: z.record(z.any()).optional(),
});

export const ConfigurationSchema = z.object({
  retrieverProvider: z.enum(['supabase']),
  k: z.number().int().min(1).max(50),
  filterKwargs: z.record(z.any()).optional(),
  queryModel: z.string().min(1),
  docsFile: z.string().optional(),
  useSampleDocs: z.boolean().optional(),
});

/**
 * Sanitization utilities
 */
export class Sanitizer {
  /**
   * Sanitize a query string by removing potentially harmful content
   */
  static sanitizeQuery(query: string): string {
    if (typeof query !== 'string') {
      throw new ValidationError('Query must be a string', 'query');
    }
    
    return query
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitize document content
   */
  static sanitizeDocumentContent(content: string): string {
    if (typeof content !== 'string') {
      throw new ValidationError('Document content must be a string', 'content');
    }
    
    return content
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .substring(0, 100000); // Limit length
  }

  /**
   * Validate and sanitize a query
   */
  static validateAndSanitizeQuery(query: unknown): string {
    const result = QuerySchema.safeParse({ query });
    if (!result.success) {
      throw new ValidationError(
        `Invalid query: ${result.error.errors.map(e => e.message).join(', ')}`,
        'query'
      );
    }
    return this.sanitizeQuery(result.data.query);
  }

  /**
   * Validate and sanitize a document
   */
  static validateAndSanitizeDocument(doc: unknown): { pageContent: string; metadata?: any } {
    const result = DocumentSchema.safeParse(doc);
    if (!result.success) {
      throw new ValidationError(
        `Invalid document: ${result.error.errors.map(e => e.message).join(', ')}`,
        'document'
      );
    }
    
    return {
      pageContent: this.sanitizeDocumentContent(result.data.pageContent),
      metadata: result.data.metadata,
    };
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(config: unknown): any {
    const result = ConfigurationSchema.safeParse(config);
    if (!result.success) {
      throw new ValidationError(
        `Invalid configuration: ${result.error.errors.map(e => e.message).join(', ')}`,
        'configuration'
      );
    }
    return result.data;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS = 100; // Max requests per window

  static checkLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.MAX_REQUESTS;
    }
    return Math.max(0, this.MAX_REQUESTS - record.count);
  }
}
