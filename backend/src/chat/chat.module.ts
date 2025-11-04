import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SupabaseService } from '../common/supabase.service';
import { PlanGuardService } from '../common/plan-guard.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { BotsService } from '../bots/bots.service';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [ActionsModule],
  controllers: [ChatController],
  providers: [ChatService, SupabaseService, PlanGuardService, EmbeddingsService, BotsService],
  exports: [ChatService],
})
export class ChatModule {}

