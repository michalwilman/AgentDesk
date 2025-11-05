import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { ScraperModule } from './scraper/scraper.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { ChatModule } from './chat/chat.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DocumentsModule } from './documents/documents.module';
import { WidgetModule } from './widget/widget.module';
import { WordpressModule } from './wordpress/wordpress.module';
import { ActionsModule } from './actions/actions.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    }]),

    // Feature modules
    CommonModule,
    AuthModule,
    BotsModule,
    ScraperModule,
    EmbeddingsModule,
    ChatModule,
    KnowledgeModule,
    WebhooksModule,
    DocumentsModule,
    WidgetModule,
    WordpressModule,
    ActionsModule,
    AdminModule,  // Admin Dashboard - Protected routes
  ],
  controllers: [],
})
export class AppModule {}

