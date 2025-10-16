/**
 * Health check endpoint for the RAG backend
 */

import { HealthChecker, createHealthResponse } from './shared/health.js';
import { createLogger } from './shared/logger.js';

const logger = createLogger('health-endpoint');

/**
 * Simple health check endpoint
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; services: number; healthy: boolean }> {
  try {
    logger.info('Health check requested');
    const healthStatus = await HealthChecker.checkHealth();
    return createHealthResponse(healthStatus);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: 0,
      services: 0,
      healthy: false,
    };
  }
}

/**
 * Detailed health check with full status
 */
export async function detailedHealthCheck() {
  try {
    logger.info('Detailed health check requested');
    return await HealthChecker.checkHealth();
  } catch (error) {
    logger.error('Detailed health check failed', error as Error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {},
      uptime: 0,
      memory: { used: 0, total: 0, percentage: 0 },
    };
  }
}

/**
 * Get system metrics
 */
export function getMetrics() {
  logger.info('Metrics requested');
  return HealthChecker.getMetrics();
}
