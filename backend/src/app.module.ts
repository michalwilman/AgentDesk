import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { ScraperModule } from './scraper/scraper.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { ChatModule } from './chat/chat.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DocumentsModule } from './documents/documents.module';
import { WidgetModule } from './widget/widget.module';
import { RootController } from './root.controller';

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
    AuthModule,
    BotsModule,
    ScraperModule,
    EmbeddingsModule,
    ChatModule,
    KnowledgeModule,
    WebhooksModule,
    DocumentsModule,
    WidgetModule,
  ],
  controllers: [RootController],
})
export class AppModule {}

