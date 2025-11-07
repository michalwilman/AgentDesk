import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommonModule } from '../common/common.module';
import { UsageTrackingService } from '../actions/integrations/usage-tracking.service';

@Module({
  imports: [CommonModule],
  controllers: [AdminController],
  providers: [AdminService, UsageTrackingService],
  exports: [AdminService],
})
export class AdminModule {}

