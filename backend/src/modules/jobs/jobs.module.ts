import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LogSourcesModule } from '../log-sources/log-sources.module';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    NotificationsModule,
    LogSourcesModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
