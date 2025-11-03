import {
  Controller,
  Get,
  Put,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsNotificationsService } from './appointments-notifications.service';
import { AuthService } from '../auth/auth.service';

@Controller('appointments/notifications')
export class AppointmentsNotificationsController {
  constructor(
    private notificationsService: AppointmentsNotificationsService,
    private authService: AuthService,
  ) {}

  @Get()
  async getNotifications(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);

    return this.notificationsService.getNotifications(user.id);
  }

  @Put(':id/dismiss')
  async dismissNotification(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);

    return this.notificationsService.dismissNotification(id, user.id);
  }
}

