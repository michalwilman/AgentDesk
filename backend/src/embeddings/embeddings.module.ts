import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsController } from './embeddings.controller';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [EmbeddingsController],
  providers: [EmbeddingsService, SupabaseService, AuthService, BotsService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}

