/**
 * Health check and monitoring utilities
 */

import { createLogger } from './logger.js';
import { ConnectionPool } from './cache.js';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    [key: string]: ServiceHealth;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

export class HealthChecker {
  private static logger = createLogger('health-checker');
  private static startTime = Date.now();

  /**
   * Perform comprehensive health check
   */
  static async checkHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const services: { [key: string]: ServiceHealth } = {};

    // Check Supabase connection
    services.supabase = await this.checkSupabase();
    
    // Check OpenAI API
    services.openai = await this.checkOpenAI();
    
    // Check cache status
    services.cache = this.checkCache();
    
    // Check overall system health
    const overallStatus = this.determineOverallStatus(services);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp,
      services,
      uptime,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: memoryPercentage,
      },
    };

    this.logger.info('Health check completed', { 
      status: overallStatus,
      uptime,
      memoryPercentage: memoryPercentage.toFixed(2)
    });

    return healthStatus;
  }

  /**
   * Check Supabase connection health
   */
  private static async checkSupabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: 'Missing Supabase environment variables',
        };
      }

      // Try to create a client (basic connectivity check)
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );

      // Simple ping to check connectivity
      await client.from('documents').select('count').limit(1);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check OpenAI API health
   */
  private static async checkOpenAI(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        return {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: 'Missing OpenAI API key',
        };
      }

      // Simple test to check if OpenAI is accessible
      const { OpenAIEmbeddings } = await import('@langchain/openai');
      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
      });

      // Test with a small embedding
      await embeddings.embedQuery('health check');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check cache status
   */
  private static checkCache(): ServiceHealth {
    try {
      // Check if cache is functioning
      ConnectionPool.size();
      
      return {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Cache error',
      };
    }
  }

  /**
   * Determine overall system health based on service statuses
   */
  private static determineOverallStatus(services: { [key: string]: ServiceHealth }): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Get system metrics
   */
  static getMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime,
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: process.cpuUsage(),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
    };
  }
}

/**
 * Simple health check endpoint response
 */
export function createHealthResponse(status: HealthStatus) {
  return {
    status: status.status,
    timestamp: status.timestamp,
    uptime: status.uptime,
    services: Object.keys(status.services).length,
    healthy: status.status === 'healthy',
  };
}
