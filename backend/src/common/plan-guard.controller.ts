import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { PlanGuardService } from './plan-guard.service';
import { AuthService } from '../auth/auth.service';

@Controller('plan')
export class PlanGuardController {
  constructor(
    private planGuardService: PlanGuardService,
    private authService: AuthService,
  ) {}

  /**
   * Get user's plan limits and current usage
   */
  @Get('limits-and-usage')
  async getLimitsAndUsage(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);

    const [limits, usage, planName] = await Promise.all([
      this.planGuardService.getPlanLimits(user.id),
      this.planGuardService.getUsageStats(user.id),
      this.planGuardService.getUserPlan(user.id),
    ]);

    return {
      plan: planName,
      limits,
      usage,
    };
  }

  /**
   * Check if user can perform a specific action
   */
  @Get('can-perform/:action')
  async canPerform(
    @Headers('authorization') authorization: string,
    @Headers('action') action: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);

    const result = await this.planGuardService.checkAction(
      user.id,
      action as 'create_bot' | 'send_message' | 'send_whatsapp',
    );

    return result;
  }
}

