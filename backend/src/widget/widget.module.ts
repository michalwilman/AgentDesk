import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';

@Module({
  controllers: [WidgetController],
})
export class WidgetModule {}

