import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TrialService } from './trial.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  /**
   * GET /api/trial/status
   * Check current user's trial status
   */
  @Get('status')
  @UseGuards(AuthGuard)
  async getTrialStatus(@Req() req: any) {
    const userId = req.user?.id;

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const status = await this.trialService.checkTrialStatus(userId);

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
  @UseGuards(AuthGuard)
  async convertToPaid(
    @Req() req: any,
    @Body() body: { tier: string; payment_method_id?: string },
  ) {
    const userId = req.user?.id;

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    const result = await this.trialService.convertToPaid(
      userId,
      body.tier,
      body.payment_method_id,
    );

    return result;
  }
}

