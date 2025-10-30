import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      name: 'AgentDesk API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      message: 'Welcome to AgentDesk API',
      endpoints: {
        auth: '/api/auth',
        bots: '/api/bots',
        chat: '/api/chat',
        documents: '/api/documents',
        embeddings: '/api/embeddings',
        knowledge: '/api/knowledge',
        scraper: '/api/scraper',
        webhooks: '/api/webhooks',
      },
      health: {
        root: '/',
        health: '/health',
      },
      docs: 'See API.md for detailed documentation',
    };
  }
}

