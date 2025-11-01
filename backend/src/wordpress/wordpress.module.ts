import { Module } from '@nestjs/common';
import { WordpressController } from './wordpress.controller';
import { WordpressService } from './wordpress.service';

@Module({
  controllers: [WordpressController],
  providers: [WordpressService],
})
export class WordpressModule {}

