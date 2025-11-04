import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ActionsController } from './actions.controller';
import { GoogleOAuthController } from './google-oauth.controller';
import { AppointmentsNotificationsController } from './appointments-notifications.controller';
import { ActionsService } from './actions.service';
import { AppointmentsNotificationsService } from './appointments-notifications.service';
import { EmailService } from './integrations/email.service';
import { CalendarService } from './integrations/calendar.service';
import { PdfService } from './integrations/pdf.service';
import { WebhookService } from './integrations/webhook.service';
import { TwilioService } from './integrations/twilio.service';
import { RemindersService } from './integrations/reminders.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [
    ActionsController,
    GoogleOAuthController,
    AppointmentsNotificationsController,
  ],
  providers: [
    ActionsService,
    AppointmentsNotificationsService,
    EmailService,
    CalendarService,
    PdfService,
    WebhookService,
    TwilioService,
    RemindersService,
    SupabaseService,
    AuthService,
  ],
  exports: [ActionsService], // Export for use in ChatService
})
export class ActionsModule {}

