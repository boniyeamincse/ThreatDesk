import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PriorityService } from './services/priority.service';
import { DeduplicationService } from './services/deduplication.service';

@Module({
  imports: [PrismaModule],
  providers: [AlertsService, PriorityService, DeduplicationService],
  controllers: [AlertsController],
  exports: [AlertsService, PriorityService, DeduplicationService],
})
export class AlertsModule {}
