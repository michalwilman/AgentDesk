import { Module } from '@nestjs/common';
import { PlanGuardService } from './plan-guard.service';
import { PlanGuardController } from './plan-guard.controller';
import { SupabaseService } from './supabase.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [PlanGuardController],
  providers: [PlanGuardService, SupabaseService, AuthService],
  exports: [PlanGuardService, SupabaseService],
})
export class CommonModule {}

