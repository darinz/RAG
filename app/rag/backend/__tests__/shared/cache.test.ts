import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MemoryCache, ModelCache, DocumentCache, ConnectionPool } from '../../src/shared/cache.js';

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache(10, 1000); // 10 max size, 1 second TTL
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should return null for expired entries', (done) => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        done();
      }, 150);
    });

    it('should handle different value types', () => {
      const objectCache = new MemoryCache<object>();
      const testObj = { name: 'test', value: 123 };
      
      objectCache.set('obj', testObj);
      expect(objectCache.get('obj')).toEqual(testObj);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired entries', (done) => {
      cache.set('key1', 'value1', 100);
      
      setTimeout(() => {
        expect(cache.has('key1')).toBe(false);
        done();
      }, 150);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('should return false for non-existent key', () => {
      expect(cache.delete('non-existent')).toBe(false);
    });
  });

  describe('size limits', () => {
    it('should respect max size limit', () => {
      // Fill cache beyond max size
      for (let i = 0; i < 15; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      
      expect(cache.size()).toBe(10);
      // First entries should be evicted
      expect(cache.get('key0')).toBeNull();
      expect(cache.get('key14')).toBe('value14');
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', (done) => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 200);
      
      setTimeout(() => {
        const cleaned = cache.cleanup();
        expect(cleaned).toBe(1); // key1 should be expired
        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBe('value2');
        done();
      }, 150);
    });
  });
});

describe('ModelCache', () => {
  beforeEach(() => {
    ModelCache.clear();
  });

  describe('getOrLoad', () => {
    it('should load and cache model', async () => {
      const loader = jest.fn(() => Promise.resolve('cached-model'));
      
      const result1 = await ModelCache.getOrLoad('test-model', loader);
      const result2 = await ModelCache.getOrLoad('test-model', loader);
      
      expect(result1).toBe('cached-model');
      expect(result2).toBe('cached-model');
      expect(loader).toHaveBeenCalledTimes(1); // Should only load once
    });

    it('should handle different cache keys', async () => {
      const loader1 = jest.fn(() => Promise.resolve('model1'));
      const loader2 = jest.fn(() => Promise.resolve('model2'));
      
      const result1 = await ModelCache.getOrLoad('key1', loader1);
      const result2 = await ModelCache.getOrLoad('key2', loader2);
      
      expect(result1).toBe('model1');
      expect(result2).toBe('model2');
      expect(loader1).toHaveBeenCalledTimes(1);
      expect(loader2).toHaveBeenCalledTimes(1);
    });
  });
});

describe('DocumentCache', () => {
  beforeEach(() => {
    DocumentCache.clear();
  });

  describe('getCachedDocuments and setCachedDocuments', () => {
    it('should cache and retrieve documents', () => {
      const query = 'test query';
      const documents = [{ content: 'doc1' }, { content: 'doc2' }];
      
      DocumentCache.setCachedDocuments(query, documents);
      const cached = DocumentCache.getCachedDocuments(query);
      
      expect(cached).toEqual(documents);
    });

    it('should return null for non-cached query', () => {
      const cached = DocumentCache.getCachedDocuments('non-existent');
      expect(cached).toBeNull();
    });

    it('should handle query normalization', () => {
      const query1 = 'Test Query';
      const query2 = 'test query';
      const documents = [{ content: 'doc1' }];
      
      DocumentCache.setCachedDocuments(query1, documents);
      const cached = DocumentCache.getCachedDocuments(query2);
      
      expect(cached).toEqual(documents);
    });
  });
});

describe('ConnectionPool', () => {
  beforeEach(() => {
    ConnectionPool.closeAll();
  });

  describe('getConnection', () => {
    it('should create and reuse connections', () => {
      const factory = jest.fn().mockReturnValue('connection');
      
      const conn1 = ConnectionPool.getConnection('test-key', factory);
      const conn2 = ConnectionPool.getConnection('test-key', factory);
      
      expect(conn1).toBe('connection');
      expect(conn2).toBe('connection');
      expect(factory).toHaveBeenCalledTimes(1); // Should only create once
    });

    it('should create separate connections for different keys', () => {
      const factory1 = jest.fn().mockReturnValue('connection1');
      const factory2 = jest.fn().mockReturnValue('connection2');
      
      const conn1 = ConnectionPool.getConnection('key1', factory1);
      const conn2 = ConnectionPool.getConnection('key2', factory2);
      
      expect(conn1).toBe('connection1');
      expect(conn2).toBe('connection2');
      expect(factory1).toHaveBeenCalledTimes(1);
      expect(factory2).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeConnection', () => {
    it('should close specific connection', () => {
      const factory = jest.fn().mockReturnValue('connection');
      
      ConnectionPool.getConnection('test-key', factory);
      ConnectionPool.closeConnection('test-key');
      
      // Next call should create a new connection
      const factory2 = jest.fn().mockReturnValue('connection2');
      const conn = ConnectionPool.getConnection('test-key', factory2);
      
      expect(conn).toBe('connection2');
      expect(factory2).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeAll', () => {
    it('should close all connections', () => {
      const factory1 = jest.fn().mockReturnValue('connection1');
      const factory2 = jest.fn().mockReturnValue('connection2');
      
      ConnectionPool.getConnection('key1', factory1);
      ConnectionPool.getConnection('key2', factory2);
      ConnectionPool.closeAll();
      
      // Next calls should create new connections
      const factory3 = jest.fn().mockReturnValue('connection3');
      const conn = ConnectionPool.getConnection('key1', factory3);
      
      expect(conn).toBe('connection3');
      expect(factory3).toHaveBeenCalledTimes(1);
    });
  });
});
