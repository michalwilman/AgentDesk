import { Controller, Get, Put, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsNotificationsService } from './appointments-notifications.service';

@Controller('api/appointments/notifications')
@UseGuards(AuthGuard('jwt'))
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

