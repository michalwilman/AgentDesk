import { Controller, Get, Query, Req, Res, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { google } from 'googleapis';
import { SupabaseService } from '../common/supabase.service';
import { AuthService } from '../auth/auth.service';

@Controller('actions/google')
export class GoogleOAuthController {
  private oauth2Client;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
  ) {
    // Log environment variables for debugging
    console.log('🔧 Google OAuth Config:', {
      clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'Using default',
    });

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://agentdesk-backend-production.up.railway.app/api/actions/google/callback'
        : 'http://localhost:3001/api/actions/google/callback');

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );
  }

  @Get('authorize')
  async authorize(@Query('bot_id') botId: string, @Res() res: Response) {
    if (!botId) {
      return res.status(400).send('bot_id is required');
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://agentdesk-backend-production.up.railway.app/api/actions/google/callback'
        : 'http://localhost:3001/api/actions/google/callback');
    
    console.log('🔗 Generating OAuth URL with redirect_uri:', redirectUri);

    // Generate authorization URL with state parameter (bot_id)
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: botId, // Pass bot_id in state to retrieve after callback
      prompt: 'consent', // Force consent screen to get refresh token
      redirect_uri: redirectUri, // Explicitly pass redirect_uri
    });

    console.log('✅ OAuth URL generated:', authUrl);

    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') botId: string,
    @Res() res: Response,
  ) {
    // 🔍 LOG: Callback received
    console.log('📥 Google OAuth callback received:', {
      hasCode: !!code,
      codeLength: code?.length,
      botId,
      timestamp: new Date().toISOString(),
    });

    try {
      if (!code || !botId) {
        console.error('❌ Missing code or botId:', { hasCode: !!code, botId });
        return res.status(400).send('Missing authorization code or bot_id');
      }

      console.log('🔄 Exchanging authorization code for tokens...');
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      console.log('✅ Tokens received:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
      });
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain tokens');
      }

      // Get user's primary calendar ID and email
      console.log('📅 Fetching calendar and user info from Google...');
      this.oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      
      const [calendarList, userInfo] = await Promise.all([
        calendar.calendarList.list(),
        oauth2.userinfo.get(),
      ]);
      
      const primaryCalendar = calendarList.data.items?.find(cal => cal.primary);
      const userEmail = userInfo.data.email;
      console.log('✅ Google info fetched:', {
        calendarId: primaryCalendar?.id,
        email: userEmail,
      });

      // Save tokens to database
      console.log('💾 Saving tokens to database...');
      const supabase = this.supabaseService.getClient();
      
      const { error } = await supabase
        .from('bot_actions_config')
        .upsert({
          bot_id: botId,
          google_calendar_access_token: tokens.access_token,
          google_calendar_refresh_token: tokens.refresh_token,
          google_calendar_id: primaryCalendar?.id || 'primary',
          google_calendar_email: userEmail,
          appointments_enabled: true, // Auto-enable appointments when connected
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'bot_id',
        });

      if (error) {
        console.error('❌ Error saving Google Calendar tokens:', error);
        throw error;
      }

      console.log('✅ Tokens saved to database successfully');

      // Redirect back to the Actions page with success message
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://agentdesk-frontend-production.up.railway.app'
          : 'http://localhost:3000');
      
      console.log(`🎉 Google Calendar connected for bot ${botId}`);
      console.log(`🔀 Redirecting to: ${frontendUrl}/dashboard/bots/${botId}/actions?google_connected=true`);
      res.redirect(`${frontendUrl}/dashboard/bots/${botId}/actions?google_connected=true`);
    } catch (error) {
      console.error('💥 Error in Google OAuth callback:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      const frontendUrl = process.env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://agentdesk-frontend-production.up.railway.app'
          : 'http://localhost:3000');
      console.log(`🔀 Redirecting to error page: ${frontendUrl}/dashboard/bots/${botId}/actions?google_error=true`);
      res.redirect(`${frontendUrl}/dashboard/bots/${botId}/actions?google_error=true`);
    }
  }

  @Get('disconnect')
  async disconnect(
    @Query('bot_id') botId: string,
    @Headers('authorization') authorization: string,
  ) {
    try {
      // Validate authentication
      if (!authorization) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const token = authorization.replace('Bearer ', '');
      const user = await this.authService.validateUser(token);

      const supabase = this.supabaseService.getClient();

      // Verify bot ownership
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('user_id')
        .eq('id', botId)
        .single();

      if (botError || !bot || bot.user_id !== user.id) {
        throw new UnauthorizedException('Bot not found or access denied');
      }

      // Remove Google Calendar tokens from database
      const { error } = await supabase
        .from('bot_actions_config')
        .update({
          google_calendar_access_token: null,
          google_calendar_refresh_token: null,
          google_calendar_id: null,
          google_calendar_email: null,
          appointments_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('bot_id', botId);

      if (error) {
        throw error;
      }

      console.log(`✅ Google Calendar disconnected for bot ${botId}`);

      return {
        success: true,
        message: 'Google Calendar disconnected successfully',
      };
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      return {
        success: false,
        error: error.message || 'Failed to disconnect Google Calendar',
      };
    }
  }

  @Get('status')
  async getConnectionStatus(
    @Query('bot_id') botId: string,
    @Headers('authorization') authorization: string,
  ) {
    try {
      // Validate authentication
      if (!authorization) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const token = authorization.replace('Bearer ', '');
      const user = await this.authService.validateUser(token);

      const supabase = this.supabaseService.getClient();

      // Verify bot ownership
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('user_id')
        .eq('id', botId)
        .single();

      if (botError || !bot || bot.user_id !== user.id) {
        throw new UnauthorizedException('Bot not found or access denied');
      }

      const { data, error } = await supabase
        .from('bot_actions_config')
        .select('google_calendar_access_token, google_calendar_refresh_token, google_calendar_id, google_calendar_email, appointments_enabled')
        .eq('bot_id', botId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isConnected = !!(data?.google_calendar_access_token && data?.google_calendar_refresh_token);

      return {
        connected: isConnected,
        calendar_id: data?.google_calendar_id,
        email: data?.google_calendar_email,
        appointments_enabled: data?.appointments_enabled || false,
      };
    } catch (error) {
      console.error('Error getting Google Calendar status:', error);
      return {
        connected: false,
        error: error.message || 'Failed to get connection status',
      };
    }
  }
}

