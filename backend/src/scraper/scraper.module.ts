import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, SupabaseService, AuthService, BotsService],
  exports: [ScraperService],
})
export class ScraperModule {}

