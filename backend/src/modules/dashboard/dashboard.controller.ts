import { Controller, Get, UseGuards, Query } from '@nestjs/common';
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

  @Get('alert-counts')
  async getAlertCounts() {
    return this.dashboardService.getAlertCounts();
  }

  @Get('severity-counts')
  async getSeverityCounts() {
    return this.dashboardService.getSeverityCounts();
  }

  @Get('status-counts')
  async getStatusCounts() {
    return this.dashboardService.getStatusCounts();
  }

  @Get('verdict-counts')
  async getVerdictCounts() {
    return this.dashboardService.getVerdictCounts();
  }

  @Get('source-counts')
  async getSourceCounts() {
    return this.dashboardService.getSourceCounts();
  }

  @Get('sla-breaches')
  async getSLABreaches() {
    return this.dashboardService.getSLABreaches();
  }

  @Get('analyst-workload')
  async getAnalystWorkload() {
    return this.dashboardService.getAnalystWorkload();
  }

  @Get('alert-trends')
  async getAlertTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : 7;
    return this.dashboardService.getAlertTrends(daysNum);
  }

  @Get('top-risk-assets')
  async getTopRiskAssets(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.dashboardService.getTopRiskAssets(limitNum);
  }

  @Get('top-noisy-rules')
  async getTopNoisyRules(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.dashboardService.getTopNoisyRules(limitNum);
  }
}
