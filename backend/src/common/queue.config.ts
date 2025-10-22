import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'bullmq';

/**
 * Creates Redis connection configuration for BullMQ
 * @param configService - NestJS ConfigService instance
 * @returns Redis connection options
 */
export function getQueueConfig(configService: ConfigService): ConnectionOptions {
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

