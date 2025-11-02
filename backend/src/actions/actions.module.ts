import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActionsController } from './actions.controller';
import { GoogleOAuthController } from './google-oauth.controller';
import { ActionsService } from './actions.service';
import { EmailService } from './integrations/email.service';
import { CalendarService } from './integrations/calendar.service';
import { PdfService } from './integrations/pdf.service';
import { WebhookService } from './integrations/webhook.service';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [ActionsController, GoogleOAuthController],
  providers: [
    ActionsService,
    EmailService,
    CalendarService,
    PdfService,
    WebhookService,
    SupabaseService,
    AuthService,
  ],
  exports: [ActionsService], // Export for use in ChatService
})
export class ActionsModule {}

