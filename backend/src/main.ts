import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Bot-Token'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Health check endpoints BEFORE global prefix (for Railway/Docker)
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/health') {
      return res.json({
        status: 'ok',
        service: 'AgentDesk Backend',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
      });
    }
    next();
  });

  // Serve static files from dist folder (where webpack puts widget-standalone.js)
  app.use(express.static(join(__dirname), {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  
  // Debug: Log all important environment variables
  console.log('🔍 Environment Check:');
  console.log(`   PORT: ${process.env.PORT || 'not set (using 3001)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   HOST: ${process.env.HOST || 'not set'}`);
  
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 AgentDesk Backend running on: http://0.0.0.0:${port}`);
  console.log(`📍 Health check: http://0.0.0.0:${port}/ and http://0.0.0.0:${port}/health`);
  console.log(`🔗 API endpoints: http://0.0.0.0:${port}/api`);
}

bootstrap();

