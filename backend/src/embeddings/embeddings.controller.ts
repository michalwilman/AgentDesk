import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(
    private embeddingsService: EmbeddingsService,
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

  @Post('generate/:botId')
  async generateEmbeddings(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.embeddingsService.generateEmbeddingsForBot(botId);
  }

  @Get(':botId')
  async getEmbeddings(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.embeddingsService.getEmbeddings(botId);
  }

  @Post('search')
  async searchSimilar(
    @Headers('authorization') authorization: string,
    @Body() body: { query: string; botId: string; matchThreshold?: number; matchCount?: number },
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    return await this.embeddingsService.searchSimilarContent(
      body.query,
      body.botId,
      body.matchThreshold,
      body.matchCount,
    );
  }
}

