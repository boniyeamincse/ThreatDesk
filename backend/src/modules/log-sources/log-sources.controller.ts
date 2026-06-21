import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LogSourcesService } from './log-sources.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/log-sources')
@UseGuards(JwtAuthGuard)
export class LogSourcesController {
  constructor(private logSourcesService: LogSourcesService) {}

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.logSourcesService.findAll(parseInt(skip || '0'), parseInt(take || '20'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.logSourcesService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.logSourcesService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.logSourcesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.logSourcesService.delete(id);
  }

  @Post(':id/test-connection')
  async testConnection(@Param('id') id: string) {
    return this.logSourcesService.testConnection(id);
  }

  @Get(':id/health')
  async getHealth(@Param('id') id: string) {
    return this.logSourcesService.getHealth(id);
  }

  @Post(':id/sync')
  async sync(@Param('id') id: string) {
    // Trigger sync job - would be handled by background queue
    return { message: 'Sync job queued', sourceId: id };
  }
}
