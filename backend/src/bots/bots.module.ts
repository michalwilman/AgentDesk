import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [BotsController],
  providers: [BotsService, SupabaseService, AuthService],
  exports: [BotsService],
})
export class BotsModule {}

