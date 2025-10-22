import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { getQueueConfig, QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from '../common/queue.config';
import { SiteCrawlerJobData } from './dto/site-scan.dto';

let queueInstance: Queue<SiteCrawlerJobData> | null = null;

/**
 * Get or create the site crawler queue instance
 * @param configService - NestJS ConfigService for Redis connection
 * @returns BullMQ Queue instance
 */
export function getSiteCrawlerQueue(configService: ConfigService): Queue<SiteCrawlerJobData> {
  if (!queueInstance) {
    const connection = getQueueConfig(configService);
    
    queueInstance = new Queue<SiteCrawlerJobData>(QUEUE_NAMES.SITE_CRAWLER, {
      connection,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    console.log(`✅ Site Crawler Queue initialized: ${QUEUE_NAMES.SITE_CRAWLER}`);
  }

  return queueInstance;
}

/**
 * Close the queue connection (used in module cleanup)
 */
export async function closeSiteCrawlerQueue(): Promise<void> {
  if (queueInstance) {
    await queueInstance.close();
    queueInstance = null;
    console.log('🔒 Site Crawler Queue closed');
  }
}

/**
 * Export queue name for consistency
 */
export const SITE_CRAWLER_QUEUE_NAME = QUEUE_NAMES.SITE_CRAWLER;

