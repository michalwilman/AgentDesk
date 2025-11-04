import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, SupabaseService, AuthService, BotsService, EmbeddingsService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}

