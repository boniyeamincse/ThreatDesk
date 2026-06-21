import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertBoardService } from './alert-board.service';
import { AlertBoardController } from './alert-board.controller';
import { PriorityService } from './services/priority.service';
import { DeduplicationService } from './services/deduplication.service';

@Module({
  imports: [PrismaModule],
  providers: [AlertsService, AlertBoardService, PriorityService, DeduplicationService],
  controllers: [AlertsController, AlertBoardController],
  exports: [AlertsService, AlertBoardService, PriorityService, DeduplicationService],
})
export class AlertsModule {}
