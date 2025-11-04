import { Module } from '@nestjs/common';
import { PlanGuardService } from './plan-guard.service';
import { PlanGuardController } from './plan-guard.controller';
import { SupabaseService } from './supabase.service';
import { AuthService } from '../auth/auth.service';
import { TrialService } from './trial.service';
import { TrialController } from './trial.controller';

@Module({
  controllers: [PlanGuardController, TrialController],
  providers: [PlanGuardService, SupabaseService, AuthService, TrialService],
  exports: [PlanGuardService, SupabaseService, TrialService],
})
export class CommonModule {}

