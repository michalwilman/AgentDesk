import { Controller, Get } from '@nestjs/common';

/**
 * Root controller - handles requests at the root path
 * This is needed for Railway health checks
 */
@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'AgentDesk Backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      api: '/api',
      health: '/health',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'AgentDesk Backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

