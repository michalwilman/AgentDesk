import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer';
import { getQueueConfig, QUEUE_NAMES } from '../common/queue.config';
import { SiteCrawlerJobData } from './dto/site-scan.dto';
import { SupabaseService } from '../common/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { EncryptionService } from '../common/encryption.service';

/**
 * Site Crawler Worker
 * Processes website crawling jobs with optional login support
 */
export class SiteCrawlerWorker {
  private worker: Worker<SiteCrawlerJobData> | null = null;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private embeddingsService: EmbeddingsService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Initialize and start the worker
   */
  async start(): Promise<void> {
    const connection = getQueueConfig(this.configService);

    this.worker = new Worker<SiteCrawlerJobData>(
      QUEUE_NAMES.SITE_CRAWLER,
      async (job: Job<SiteCrawlerJobData>) => {
        return await this.processJob(job);
      },
      {
        connection,
        concurrency: 2, // Process 2 jobs simultaneously
      },
    );

    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    console.log(`🚀 Site Crawler Worker started`);
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      console.log('🛑 Site Crawler Worker stopped');
    }
  }

  /**
   * Process a single crawling job
   */
  private async processJob(job: Job<SiteCrawlerJobData>): Promise<void> {
    const { jobId, botId, startUrlAfterLogin, loginUrl, usernameSelector, passwordSelector, submitSelector, usernameEncrypted, passwordEncrypted } = job.data;

    let browser: Browser | null = null;
    const supabase = this.supabaseService.getClient();

    try {
      // Update job status to processing
      await supabase
        .from('site_scan_jobs')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      console.log(`🔄 Processing job ${jobId} for bot ${botId}`);

      // Launch Puppeteer browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      
      // Set a reasonable viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Set user agent
      await page.setUserAgent(
        this.configService.get('SCRAPER_USER_AGENT', 'AgentDesk-Bot/1.0'),
      );

      // Handle login if credentials are provided
      if (loginUrl && usernameEncrypted && passwordEncrypted) {
        console.log(`🔐 Logging in to ${loginUrl}`);
        await this.performLogin(
          page,
          loginUrl,
          usernameEncrypted,
          passwordEncrypted,
          usernameSelector || '#username',
          passwordSelector || '#password',
          submitSelector || 'button[type="submit"]',
        );
      }

      // Navigate to the target URL
      console.log(`📄 Crawling ${startUrlAfterLogin}`);
      await page.goto(startUrlAfterLogin, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for body to be present
      await page.waitForSelector('body');

      // Extract page title and content
      const { title, content } = await this.extractPageContent(page);

      if (!content || content.length < 50) {
        throw new Error('Insufficient content extracted from page');
      }

      console.log(`📝 Extracted ${content.length} characters from "${title}"`);

      // Save to scraped_content table
      const { data: scrapedContent, error: insertError } = await supabase
        .from('scraped_content')
        .insert([
          {
            bot_id: botId,
            source_url: startUrlAfterLogin,
            content_type: 'website',
            title: title || startUrlAfterLogin,
            content: content,
            file_name: title || 'Website Content',
            file_type: 'website',
            word_count: content.split(/\s+/).length,
            processing_status: 'completed',
            metadata: {
              crawled_at: new Date().toISOString(),
              login_required: !!loginUrl,
            },
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save content: ${insertError.message}`);
      }

      console.log(`💾 Content saved with ID: ${scrapedContent.id}`);

      // Generate embeddings for the content
      try {
        await this.embeddingsService.generateEmbeddingsForContent(
          scrapedContent.id,
          botId,
        );
        console.log(`🧠 Embeddings generated for content ${scrapedContent.id}`);
      } catch (embError) {
        console.error(`⚠️ Failed to generate embeddings:`, embError.message);
        // Don't fail the entire job if embeddings fail
      }

      // Update job status to completed
      await supabase
        .from('site_scan_jobs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      console.log(`✅ Job ${jobId} completed successfully`);

    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error.message);

      // Update job status to failed
      await supabase
        .from('site_scan_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      throw error; // Re-throw to mark the job as failed in BullMQ
    } finally {
      // Always close the browser
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Perform login on a website
   */
  private async performLogin(
    page: Page,
    loginUrl: string,
    usernameEncrypted: string,
    passwordEncrypted: string,
    usernameSelector: string,
    passwordSelector: string,
    submitSelector: string,
  ): Promise<void> {
    // Decrypt credentials
    const username = this.encryptionService.decrypt(usernameEncrypted);
    const password = this.encryptionService.decrypt(passwordEncrypted);

    // Navigate to login page
    await page.goto(loginUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for login form elements
    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    await page.waitForSelector(passwordSelector, { timeout: 10000 });

    // Fill in credentials
    await page.type(usernameSelector, username, { delay: 100 });
    await page.type(passwordSelector, password, { delay: 100 });

    // Click submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click(submitSelector),
    ]);

    // Wait a bit for any redirects
    await page.waitForTimeout(2000);

    console.log('✅ Login successful');
  }

  /**
   * Extract clean text content from page
   */
  private async extractPageContent(page: Page): Promise<{ title: string; content: string }> {
    const result = await page.evaluate(() => {
      // Get page title
      const title = document.title || '';

      // Remove unwanted elements
      const unwantedSelectors = ['script', 'style', 'nav', 'footer', 'header', 'iframe', 'noscript', 'aside'];
      unwantedSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      });

      // Try to get main content first
      let contentElement = document.querySelector('main') ||
                          document.querySelector('article') ||
                          document.querySelector('.content') ||
                          document.querySelector('#content') ||
                          document.body;

      // Extract text content
      let text = contentElement?.textContent || '';

      // Clean up whitespace
      text = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();

      return { title, content: text };
    });

    return result;
  }
}

