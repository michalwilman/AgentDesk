import { Module } from '@nestjs/common';
import { PlanGuardService } from './plan-guard.service';
import { PlanGuardController } from './plan-guard.controller';
import { SupabaseService } from './supabase.service';
import { AuthService } from '../auth/auth.service';
import { TrialService } from './trial.service';
import { TrialController } from './trial.controller';
import { ActionsModule } from '../actions/actions.module';

@Module({
  imports: [ActionsModule],
  controllers: [PlanGuardController, TrialController],
  providers: [PlanGuardService, SupabaseService, AuthService, TrialService],
  exports: [PlanGuardService, SupabaseService, TrialService],
})
export class CommonModule {}

