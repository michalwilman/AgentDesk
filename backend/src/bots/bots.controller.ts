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

  @Get('config/:token')
  async getPublicConfig(@Param('token') token: string) {
    const bot = await this.botsService.findByApiToken(token);
    return {
      name: bot.name,
      avatar_url: bot.avatar_url,
      primary_color: bot.primary_color,
      welcome_message: bot.welcome_message,
      language: bot.language,
      position: bot.position,
    };
  }
}

