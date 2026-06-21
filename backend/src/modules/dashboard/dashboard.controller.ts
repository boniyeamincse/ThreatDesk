import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('severity-count')
  async getSeverityCount() {
    return this.dashboardService.getSeverityCount();
  }

  @Get('status-count')
  async getStatusCount() {
    return this.dashboardService.getStatusCount();
  }

  @Get('verdict-count')
  async getVerdictCount() {
    return this.dashboardService.getVerdictCount();
  }
}
