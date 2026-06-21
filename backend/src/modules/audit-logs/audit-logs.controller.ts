import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    const filters = { userId, action, resource };
    return this.auditLogsService.findAll(parseInt(skip || '0'), parseInt(take || '20'), filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Get('user/:userId')
  async getUserLogs(@Param('userId') userId: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.auditLogsService.getUserLogs(userId, parseInt(skip || '0'), parseInt(take || '20'));
  }

  @Get('resource/:resource')
  async getResourceLogs(
    @Param('resource') resource: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.auditLogsService.getResourceLogs(resource, parseInt(skip || '0'), parseInt(take || '20'));
  }
}
