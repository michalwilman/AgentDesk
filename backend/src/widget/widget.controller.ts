import { Controller, Get, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

@Controller()
export class WidgetController {
  @Get('widget-standalone.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  getWidget(@Res() res: Response) {
    try {
      const widgetPath = join(__dirname, '..', '..', 'public', 'widget-standalone.js');
      const widgetContent = readFileSync(widgetPath, 'utf-8');
      return res.send(widgetContent);
    } catch (error) {
      console.error('Error serving widget:', error);
      console.error('Attempted path:', join(__dirname, '..', '..', 'public', 'widget-standalone.js'));
      return res.status(404).send('Widget not found');
    }
  }
}

