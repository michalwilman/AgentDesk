import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private knowledgeService: KnowledgeService,
    private authService: AuthService,
    private botsService: BotsService,
  ) {}

  private async validateAuth(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authorization.replace('Bearer ', '');
    return await this.authService.validateUser(token);
  }

  @Post('add')
  async addContent(
    @Headers('authorization') authorization: string,
    @Body() body: { botId: string; content: string; title?: string; metadata?: any },
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    return await this.knowledgeService.addManualContent(
      body.botId,
      body.content,
      body.title,
      body.metadata,
    );
  }

  @Get(':botId')
  async getKnowledgeBase(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.knowledgeService.getKnowledgeBase(botId);
  }

  @Get(':botId/stats')
  async getStats(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.knowledgeService.getKnowledgeStats(botId);
  }

  @Delete(':contentId/:botId')
  async deleteKnowledge(
    @Headers('authorization') authorization: string,
    @Param('contentId') contentId: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.knowledgeService.deleteKnowledge(contentId, botId);
  }
}

