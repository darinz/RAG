/**
 * Caching utilities for performance optimization
 */

import { createLogger } from './logger.js';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private logger = createLogger('cache');
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 1000, defaultTtl: number = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  set(key: string, value: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    };

    this.cache.set(key, entry);
    this.logger.debug('Cache entry set', { key, ttl: entry.ttl });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.logger.debug('Cache entry expired', { key });
      return null;
    }

    this.logger.debug('Cache hit', { key });
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger.debug('Cache cleanup completed', { cleaned });
    }
    
    return cleaned;
  }
}

/**
 * Model cache for reusing loaded models
 */
export class ModelCache {
  private static cache = new MemoryCache<any>(50, 600000); // 10 minutes
  private static logger = createLogger('model-cache');

  static async getOrLoad<T>(
    key: string,
    loader: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached) {
      this.logger.debug('Model cache hit', { key });
      return cached as T;
    }

    this.logger.debug('Loading model', { key });
    const model = await loader();
    this.cache.set(key, model, ttl);
    return model;
  }

  static clear(): void {
    this.cache.clear();
    this.logger.debug('Model cache cleared');
  }
}

/**
 * Document cache for frequently accessed documents
 */
export class DocumentCache {
  private static cache = new MemoryCache<any[]>(100, 300000); // 5 minutes
  private static logger = createLogger('document-cache');

  static getCachedDocuments(query: string): any[] | null {
    const key = this.getQueryKey(query);
    return this.cache.get(key);
  }

  static setCachedDocuments(query: string, documents: any[], ttl?: number): void {
    const key = this.getQueryKey(query);
    this.cache.set(key, documents, ttl);
    this.logger.debug('Documents cached', { query: query.substring(0, 50), count: documents.length });
  }

  private static getQueryKey(query: string): string {
    // Create a simple hash of the query for the cache key
    return `query_${query.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;
  }

  static clear(): void {
    this.cache.clear();
    this.logger.debug('Document cache cleared');
  }
}

/**
 * Connection pool for database connections
 */
export class ConnectionPool {
  private static connections = new Map<string, any>();
  private static logger = createLogger('connection-pool');

  static getConnection<T>(key: string, factory: () => T): T {
    if (this.connections.has(key)) {
      this.logger.debug('Reusing connection', { key });
      return this.connections.get(key) as T;
    }

    this.logger.debug('Creating new connection', { key });
    const connection = factory();
    this.connections.set(key, connection);
    return connection;
  }

  static closeConnection(key: string): void {
    if (this.connections.has(key)) {
      this.connections.delete(key);
      this.logger.debug('Connection closed', { key });
    }
  }

  static closeAll(): void {
    this.connections.clear();
    this.logger.debug('All connections closed');
  }

  static size(): number {
    return this.connections.size;
  }
}
