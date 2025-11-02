import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { AuthService } from '../auth/auth.service';
import { UpdateBotActionsConfigDto } from './dto/bot-actions-config.dto';

@Controller('actions')
export class ActionsController {
  constructor(
    private actionsService: ActionsService,
    private authService: AuthService,
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
   * Get bot actions configuration
   */
  @Get('config/:botId')
  async getConfig(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.actionsService.getBotActionsConfig(botId, user.id);
  }

  /**
   * Update bot actions configuration
   */
  @Put('config/:botId')
  async updateConfig(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
    @Body() updateDto: UpdateBotActionsConfigDto,
  ) {
    const user = await this.validateAuth(authorization);
    return this.actionsService.updateBotActionsConfig(botId, user.id, updateDto);
  }

  /**
   * Get leads for a bot
   */
  @Get('leads/:botId')
  async getLeads(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.actionsService.getLeads(botId, user.id);
  }

  /**
   * Get appointments for a bot
   */
  @Get('appointments/:botId')
  async getAppointments(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.actionsService.getAppointments(botId, user.id);
  }

  /**
   * Get action logs for a bot
   */
  @Get('logs/:botId')
  async getActionLogs(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
    @Query('limit') limit?: string,
  ) {
    const user = await this.validateAuth(authorization);
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.actionsService.getActionLogs(botId, user.id, limitNum);
  }

  /**
   * Get all leads across all user's bots
   */
  @Get('leads')
  async getAllLeads(@Headers('authorization') authorization: string) {
    const user = await this.validateAuth(authorization);
    // This would need to be implemented in the service
    // For now, returns empty array - can be enhanced later
    return [];
  }

  /**
   * Get all appointments across all user's bots
   */
  @Get('appointments')
  async getAllAppointments(@Headers('authorization') authorization: string) {
    const user = await this.validateAuth(authorization);
    // This would need to be implemented in the service
    // For now, returns empty array - can be enhanced later
    return [];
  }
}

