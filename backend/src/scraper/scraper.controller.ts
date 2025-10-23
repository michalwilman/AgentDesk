import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { AuthService } from '../auth/auth.service';
import { BotsService } from '../bots/bots.service';
import { StartSiteScanDto } from './dto/site-scan.dto';

@Controller('scraper')
export class ScraperController {
  constructor(
    private scraperService: ScraperService,
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

  @Post('scrape')
  async scrapeUrl(
    @Headers('authorization') authorization: string,
    @Body() body: { url: string; botId: string },
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    const content = await this.scraperService.scrapeUrl(body.url, body.botId);

    return {
      message: 'URL scraped successfully',
      chunks: content.length,
      data: content,
    };
  }

  @Post('scrape-multiple')
  async scrapeMultipleUrls(
    @Headers('authorization') authorization: string,
    @Body() body: { urls: string[]; botId: string },
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    const content = await this.scraperService.scrapeMultipleUrls(body.urls, body.botId);

    return {
      message: 'URLs scraped successfully',
      totalChunks: content.length,
      data: content,
    };
  }

  @Get('content/:botId')
  async getScrapedContent(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.scraperService.getScrapedContent(botId);
  }

  @Delete('content/:contentId/:botId')
  async deleteContent(
    @Headers('authorization') authorization: string,
    @Param('contentId') contentId: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.scraperService.deleteScrapedContent(contentId, botId);
  }

  @Post('scan/start')
  async startSiteScan(
    @Headers('authorization') authorization: string,
    @Body() body: StartSiteScanDto,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(body.botId, user.id);

    const job = await this.scraperService.startSiteScan(body);

    return {
      message: 'Site scan started successfully',
      job,
    };
  }

  @Get('scan/jobs/:botId')
  async getSiteScanJobs(
    @Headers('authorization') authorization: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.scraperService.getSiteScanJobs(botId);
  }

  @Get('scan/job/:jobId/:botId')
  async getSiteScanJob(
    @Headers('authorization') authorization: string,
    @Param('jobId') jobId: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    return await this.scraperService.getSiteScanJob(jobId, botId);
  }

  @Delete('scan/job/:jobId/:botId')
  async deleteSiteScanJob(
    @Headers('authorization') authorization: string,
    @Param('jobId') jobId: string,
    @Param('botId') botId: string,
  ) {
    const user = await this.validateAuth(authorization);
    
    // Verify bot ownership
    await this.botsService.findOne(botId, user.id);

    await this.scraperService.deleteSiteScanJob(jobId, botId);

    return {
      message: 'Scan job deleted successfully',
    };
  }
}

