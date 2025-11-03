import { Controller, Get, Put, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppointmentsNotificationsService } from './appointments-notifications.service';

@Controller('api/appointments/notifications')
@UseGuards(JwtAuthGuard)
export class AppointmentsNotificationsController {
  constructor(
    private notificationsService: AppointmentsNotificationsService,
  ) {}

  @Get()
  async getNotifications(@Req() req) {
    return this.notificationsService.getNotifications(req.user.id);
  }

  @Put(':id/dismiss')
  async dismissNotification(@Param('id') id: string, @Req() req) {
    return this.notificationsService.dismissNotification(id, req.user.id);
  }
}

