import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { EncryptionService } from '../common/encryption.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { SiteCrawlerWorker } from './site-crawler.worker';
import { closeSiteCrawlerQueue } from './site-crawler.queue';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    SupabaseService,
    AuthService,
    BotsService,
    EncryptionService,
    EmbeddingsService,
  ],
  exports: [ScraperService],
})
export class ScraperModule implements OnModuleInit, OnModuleDestroy {
  private worker: SiteCrawlerWorker | null = null;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
    private encryptionService: EncryptionService,
  ) {}

  async onModuleInit() {
    try {
      // Initialize and start the worker
      this.worker = new SiteCrawlerWorker(
        this.configService,
        this.supabaseService,
        this.embeddingsService,
        this.encryptionService,
      );

      await this.worker.start();
    } catch (error) {
      console.error('⚠️ Failed to start Site Crawler Worker:', error.message);
      console.error('Module will continue to load, but crawling jobs will not be processed.');
      console.error('Please ensure Redis is running and ENCRYPTION_KEY is configured.');
    }
  }

  async onModuleDestroy() {
    // Stop the worker
    if (this.worker) {
      await this.worker.stop();
    }

    // Close the queue connection
    await closeSiteCrawlerQueue();
  }
}

