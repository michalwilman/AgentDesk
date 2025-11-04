import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { TrialService } from './trial.service';
import { AuthService } from '../auth/auth.service';

@Controller('trial')
export class TrialController {
  constructor(
    private readonly trialService: TrialService,
    private readonly authService: AuthService,
  ) {}

  private async validateAuth(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);
    return user;
  }

  /**
   * GET /api/trial/status
   * Check current user's trial status
   */
  @Get('status')
  async getTrialStatus(@Headers('authorization') authorization: string) {
    const user = await this.validateAuth(authorization);
    const status = await this.trialService.checkTrialStatus(user.id);

    return {
      success: true,
      ...status,
    };
  }

  /**
   * POST /api/trial/convert
   * Convert trial to paid subscription
   */
  @Post('convert')
  async convertToPaid(
    @Headers('authorization') authorization: string,
    @Body() body: { tier: string; payment_method_id?: string },
  ) {
    const user = await this.validateAuth(authorization);

    const result = await this.trialService.convertToPaid(
      user.id,
      body.tier,
      body.payment_method_id,
    );

    return result;
  }
}

