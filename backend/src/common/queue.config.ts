import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

/**
 * Creates Redis connection configuration for BullMQ
 * Supports both REDIS_URL (Railway) and individual REDIS_HOST/PORT/PASSWORD
 * @param configService - NestJS ConfigService instance
 * @returns Redis connection options
 */
export function getQueueConfig(configService: ConfigService): ConnectionOptions {
  const redisUrl = configService.get<string>('REDIS_URL');
  
  // If REDIS_URL is provided (Railway style), parse it
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      const connection: ConnectionOptions = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
      };
      
      // Extract password from URL if present
      if (url.password) {
        connection.password = url.password;
      }
      
      console.log(`✅ Redis connected via REDIS_URL: ${url.hostname}:${connection.port}`);
      return connection;
    } catch (error) {
      console.error('❌ Failed to parse REDIS_URL:', error.message);
      console.log('⚠️ Falling back to individual REDIS_HOST/PORT/PASSWORD');
    }
  }
  
  // Fallback to individual environment variables
  const host = configService.get<string>('REDIS_HOST', 'localhost');
  const port = parseInt(configService.get<string>('REDIS_PORT', '6379'), 10);
  const password = configService.get<string>('REDIS_PASSWORD');

  const connection: ConnectionOptions = {
    host,
    port,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  };

  // Add password if provided
  if (password) {
    connection.password = password;
  }

  console.log(`✅ Redis connected: ${host}:${port}`);
  return connection;
}

/**
 * Queue names used in the application
 */
export const QUEUE_NAMES = {
  SITE_CRAWLER: 'site-crawler',
} as const;

/**
 * Default job options for queues
 */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000, // Start with 5 seconds delay
  },
  removeOnComplete: {
    age: 86400, // Keep completed jobs for 24 hours
    count: 1000, // Keep max 1000 completed jobs
  },
  removeOnFail: {
    age: 604800, // Keep failed jobs for 7 days
    count: 5000, // Keep max 5000 failed jobs
  },
};

