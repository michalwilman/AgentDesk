import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { SupabaseService } from '../common/supabase.service';
import { EncryptionService } from '../common/encryption.service';
import { getSiteCrawlerQueue } from './site-crawler.queue';
import { StartSiteScanDto, SiteScanJobResponse, SiteScanJobsListResponse, SiteCrawlerJobData } from './dto/site-scan.dto';

@Injectable()
export class ScraperService {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly timeout: number;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private encryptionService: EncryptionService,
  ) {
    this.chunkSize = parseInt(this.configService.get('CHUNK_SIZE', '500'));
    this.chunkOverlap = parseInt(this.configService.get('CHUNK_OVERLAP', '50'));
    this.timeout = parseInt(this.configService.get('SCRAPER_TIMEOUT', '30000'));
  }

  async scrapeUrl(url: string, botId: string): Promise<any[]> {
    try {
      // Try Cheerio first (faster for static content)
      const content = await this.scrapeWithCheerio(url);
      
      if (content && content.length > 100) {
        return await this.saveScrapedContent(botId, url, content);
      }

      // Fallback to Puppeteer for dynamic content
      const dynamicContent = await this.scrapeWithPuppeteer(url);
      return await this.saveScrapedContent(botId, url, dynamicContent);
    } catch (error) {
      throw new Error(`Failed to scrape URL: ${error.message}`);
    }
  }

  private async scrapeWithCheerio(url: string): Promise<string> {
    const response = await axios.get(url, {
      timeout: this.timeout,
      headers: {
        'User-Agent': this.configService.get('SCRAPER_USER_AGENT', 'AgentDesk-Bot/1.0'),
      },
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // Extract main content
    const title = $('title').text().trim();
    const mainContent = $('main, article, .content, #content, body')
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ');

    return mainContent || $('body').text().trim().replace(/\s+/g, ' ');
  }

  private async scrapeWithPuppeteer(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.timeout,
      });

      // Wait for content to load
      await page.waitForSelector('body');

      // Extract text content
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const elementsToRemove = document.querySelectorAll(
          'script, style, nav, footer, header, iframe, noscript',
        );
        elementsToRemove.forEach((el) => el.remove());

        const main = document.querySelector('main, article, .content, #content, body');
        return main?.textContent?.trim().replace(/\s+/g, ' ') || '';
      });

      return content;
    } finally {
      await browser.close();
    }
  }

  private chunkText(text: string): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunk = words.slice(i, i + this.chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }

  private async saveScrapedContent(
    botId: string,
    sourceUrl: string,
    content: string,
  ): Promise<any[]> {
    const supabase = this.supabaseService.getClient();
    const chunks = this.chunkText(content);

    const insertData = chunks.map((chunk, index) => ({
      bot_id: botId,
      source_url: sourceUrl,
      content: chunk,
      chunk_index: index,
      word_count: chunk.split(' ').length,
      content_type: 'webpage',
    }));

    const { data, error } = await supabase
      .from('scraped_content')
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(`Failed to save scraped content: ${error.message}`);
    }

    return data;
  }

  async scrapeMultipleUrls(urls: string[], botId: string): Promise<any[]> {
    const results = [];

    for (const url of urls) {
      try {
        const content = await this.scrapeUrl(url, botId);
        results.push(...content);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        // Continue with other URLs
      }
    }

    return results;
  }

  async getScrapedContent(botId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('scraped_content')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch scraped content: ${error.message}`);
    }

    return data;
  }

  async deleteScrapedContent(contentId: string, botId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('scraped_content')
      .delete()
      .eq('id', contentId)
      .eq('bot_id', botId);

    if (error) {
      throw new Error(`Failed to delete scraped content: ${error.message}`);
    }

    return { message: 'Content deleted successfully' };
  }

  /**
   * Start a new site scan job
   * Creates database record and adds job to BullMQ queue
   */
  async startSiteScan(dto: StartSiteScanDto): Promise<SiteScanJobResponse> {
    const supabase = this.supabaseService.getClient();

    // Encrypt credentials if provided
    let usernameEncrypted: string | undefined;
    let passwordEncrypted: string | undefined;

    if (dto.username && dto.password) {
      usernameEncrypted = this.encryptionService.encrypt(dto.username);
      passwordEncrypted = this.encryptionService.encrypt(dto.password);
    }

    // Create job record in database
    const { data: job, error: dbError } = await supabase
      .from('site_scan_jobs')
      .insert([
        {
          bot_id: dto.botId,
          login_url: dto.loginUrl,
          start_url_after_login: dto.startUrlAfterLogin,
          username_selector: dto.usernameSelector,
          password_selector: dto.passwordSelector,
          submit_selector: dto.submitSelector,
          username_encrypted: usernameEncrypted,
          password_encrypted: passwordEncrypted,
          status: 'queued',
        },
      ])
      .select()
      .single();

    if (dbError || !job) {
      throw new Error(`Failed to create scan job: ${dbError?.message}`);
    }

    // Add job to BullMQ queue
    const queue = getSiteCrawlerQueue(this.configService);
    
    const jobData: SiteCrawlerJobData = {
      jobId: job.id,
      botId: dto.botId,
      startUrlAfterLogin: dto.startUrlAfterLogin,
      loginUrl: dto.loginUrl,
      usernameSelector: dto.usernameSelector,
      passwordSelector: dto.passwordSelector,
      submitSelector: dto.submitSelector,
      usernameEncrypted,
      passwordEncrypted,
    };

    await queue.add('crawl-site', jobData);

    console.log(`🚀 Site scan job ${job.id} added to queue`);

    return {
      id: job.id,
      botId: job.bot_id,
      startUrlAfterLogin: job.start_url_after_login,
      loginUrl: job.login_url,
      status: job.status,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    };
  }

  /**
   * Get all site scan jobs for a bot
   */
  async getSiteScanJobs(botId: string): Promise<SiteScanJobsListResponse> {
    const supabase = this.supabaseService.getClient();

    const { data: jobs, error } = await supabase
      .from('site_scan_jobs')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch site scan jobs: ${error.message}`);
    }

    const jobsFormatted: SiteScanJobResponse[] = (jobs || []).map((job) => ({
      id: job.id,
      botId: job.bot_id,
      startUrlAfterLogin: job.start_url_after_login,
      loginUrl: job.login_url,
      status: job.status,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }));

    return {
      jobs: jobsFormatted,
      total: jobsFormatted.length,
    };
  }

  /**
   * Get a specific site scan job
   */
  async getSiteScanJob(jobId: string, botId: string): Promise<SiteScanJobResponse> {
    const supabase = this.supabaseService.getClient();

    const { data: job, error } = await supabase
      .from('site_scan_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('bot_id', botId)
      .single();

    if (error || !job) {
      throw new Error('Job not found');
    }

    return {
      id: job.id,
      botId: job.bot_id,
      startUrlAfterLogin: job.start_url_after_login,
      loginUrl: job.login_url,
      status: job.status,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    };
  }
}

