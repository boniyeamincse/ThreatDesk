import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LogSourcesService } from './log-sources.service';
import { LogSourcesController } from './log-sources.controller';

@Module({
  imports: [PrismaModule],
  providers: [LogSourcesService],
  controllers: [LogSourcesController],
  exports: [LogSourcesService],
})
export class LogSourcesModule {}
