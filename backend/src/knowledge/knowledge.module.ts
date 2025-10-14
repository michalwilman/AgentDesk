import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, SupabaseService, AuthService, BotsService, EmbeddingsService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}

