import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { AuthService } from '../auth/auth.service';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';

@Controller('bots')
export class BotsController {
  constructor(
    private botsService: BotsService,
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

  @Post()
  async create(
    @Headers('authorization') authorization: string,
    @Body() createBotDto: CreateBotDto,
  ) {
    const user = await this.validateAuth(authorization);
    return this.botsService.create(user.id, createBotDto);
  }

  @Get()
  async findAll(@Headers('authorization') authorization: string) {
    const user = await this.validateAuth(authorization);
    return this.botsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.botsService.findOne(id, user.id);
  }

  @Get(':id/analytics')
  async getAnalytics(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.botsService.getBotAnalytics(id, user.id);
  }

  @Put(':id')
  async update(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateBotDto: UpdateBotDto,
  ) {
    const user = await this.validateAuth(authorization);
    return this.botsService.update(id, user.id, updateBotDto);
  }

  @Delete(':id')
  async delete(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = await this.validateAuth(authorization);
    return this.botsService.delete(id, user.id);
  }

  @Get(':id/has-knowledge')
  async hasKnowledge(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = await this.validateAuth(authorization);
    const hasTrained = await this.botsService.hasKnowledge(id, user.id);
    return {
      hasTrained,
    };
  }

  @Get('config/:token')
  async getPublicConfig(
    @Param('token') token: string,
    @Headers('origin') origin: string,
    @Headers('referer') referer: string,
  ) {
    const bot = await this.botsService.findByApiToken(token);
    
    // Domain validation - check if request comes from allowed domain
    if (bot.allowed_domains && bot.allowed_domains.length > 0) {
      const requestDomain = this.extractDomain(origin || referer);
      const isAllowed = bot.allowed_domains.some((domain: string) => 
        requestDomain.includes(domain) || domain === '*'
      );

      if (!isAllowed) {
        throw new UnauthorizedException(
          `Domain ${requestDomain} is not authorized to use this bot`
        );
      }
    }

    return {
      name: bot.name,
      avatar_url: bot.avatar_url,
      primary_color: bot.primary_color,
      welcome_message: bot.welcome_message,
      welcome_messages: bot.welcome_messages,
      language: bot.language,
      position: bot.position,
    };
  }

  private extractDomain(url: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  @Post('validate')
  async validateToken(@Body() body: { apiToken: string }) {
    try {
      const bot = await this.botsService.findByApiToken(body.apiToken);
      return {
        valid: true,
        bot: {
          id: bot.id,
          name: bot.name,
          is_active: bot.is_active,
          is_trained: bot.is_trained,
          language: bot.language,
        },
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Invalid or inactive bot token',
      };
    }
  }

  @Post('wordpress-heartbeat')
  async wordpressHeartbeat(
    @Headers('x-bot-token') botToken: string,
    @Body()
    body: {
      site_url: string;
      plugin_version: string;
      wp_version?: string;
      is_active: boolean;
    },
  ) {
    try {
      // Validate bot token first
      await this.botsService.findByApiToken(botToken);

      // Update WordPress connection data
      await this.botsService.updateWordPressConnection(botToken, body);

      return {
        success: true,
        message: 'WordPress connection updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update WordPress connection',
      };
    }
  }
}

