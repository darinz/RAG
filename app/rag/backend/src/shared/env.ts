/**
 * Environment variable validation and management
 */

import { z } from 'zod';
import { ConfigurationError } from './errors.js';
import { createLogger } from './logger.js';

const logger = createLogger('env-validation');

/**
 * Environment variable schema
 */
const EnvSchema = z.object({
  // Supabase configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // OpenAI configuration
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // Optional configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('3000'),
  
  // Rate limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int().min(1)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int().min(1000)).default('60000'),
  
  // Cache configuration
  CACHE_MAX_SIZE: z.string().transform(Number).pipe(z.number().int().min(1)).default('1000'),
  CACHE_TTL_MS: z.string().transform(Number).pipe(z.number().int().min(1000)).default('300000'),
  
  // Model configuration
  DEFAULT_MODEL: z.string().default('openai/gpt-4o'),
  DEFAULT_TEMPERATURE: z.string().transform(Number).pipe(z.number().min(0).max(2)).default('0.2'),
  
  // Retrieval configuration
  DEFAULT_K: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).default('5'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Validated environment configuration
 */
let validatedEnv: EnvConfig | null = null;

/**
 * Validates and returns environment variables
 */
export function getEnv(): EnvConfig {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    logger.info('Validating environment variables');
    
    const result = EnvSchema.safeParse(process.env);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw new ConfigurationError(
        `Environment validation failed: ${errors}`,
        'environment'
      );
    }
    
    validatedEnv = result.data;
    logger.info('Environment validation successful');
    
    return validatedEnv;
  } catch (error) {
    logger.error('Environment validation failed', error as Error);
    throw error;
  }
}

/**
 * Get a specific environment variable with type safety
 */
export function getEnvVar<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  const env = getEnv();
  return env[key];
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV') === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV') === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return getEnvVar('NODE_ENV') === 'test';
}

/**
 * Get log level as numeric value
 */
export function getLogLevel(): number {
  const level = getEnvVar('LOG_LEVEL');
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  return levels[level];
}

/**
 * Validate required environment variables for specific features
 */
export class FeatureValidator {
  /**
   * Validate environment for Supabase integration
   */
  static validateSupabase(): void {
    const env = getEnv();
    
    if (!env.SUPABASE_URL) {
      throw new ConfigurationError(
        'SUPABASE_URL is required for Supabase integration',
        'SUPABASE_URL'
      );
    }
    
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new ConfigurationError(
        'SUPABASE_SERVICE_ROLE_KEY is required for Supabase integration',
        'SUPABASE_SERVICE_ROLE_KEY'
      );
    }
    
    logger.info('Supabase environment validation passed');
  }

  /**
   * Validate environment for OpenAI integration
   */
  static validateOpenAI(): void {
    const env = getEnv();
    
    if (!env.OPENAI_API_KEY) {
      throw new ConfigurationError(
        'OPENAI_API_KEY is required for OpenAI integration',
        'OPENAI_API_KEY'
      );
    }
    
    logger.info('OpenAI environment validation passed');
  }

  /**
   * Validate all required features
   */
  static validateAll(): void {
    logger.info('Validating all required features');
    
    this.validateSupabase();
    this.validateOpenAI();
    
    logger.info('All feature validations passed');
  }
}

/**
 * Environment configuration for different deployment scenarios
 */
export class DeploymentConfig {
  /**
   * Get configuration for development environment
   */
  static getDevelopmentConfig(): Partial<EnvConfig> {
    return {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
      RATE_LIMIT_MAX_REQUESTS: 1000, // More lenient for development
      CACHE_TTL_MS: 60000, // Shorter cache for development
    };
  }

  /**
   * Get configuration for production environment
   */
  static getProductionConfig(): Partial<EnvConfig> {
    return {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      RATE_LIMIT_MAX_REQUESTS: 100,
      CACHE_TTL_MS: 300000, // Longer cache for production
    };
  }

  /**
   * Get configuration for test environment
   */
  static getTestConfig(): Partial<EnvConfig> {
    return {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error', // Only errors in tests
      RATE_LIMIT_MAX_REQUESTS: 10000, // Very lenient for tests
      CACHE_TTL_MS: 1000, // Very short cache for tests
    };
  }
}
