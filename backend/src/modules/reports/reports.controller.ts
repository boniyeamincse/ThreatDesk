import { Controller, Get, Query, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Response } from 'express';

@Controller('api/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  async getDailyReport(@Query('date') date?: string) {
    return this.reportsService.getDailyReport(date);
  }

  @Get('weekly')
  async getWeeklyReport(@Query('weeks') weeks?: string) {
    return this.reportsService.getWeeklyReport(weeks ? parseInt(weeks) : 1);
  }

  @Get('monthly')
  async getMonthlyReport(@Query('months') months?: string) {
    return this.reportsService.getMonthlyReport(months ? parseInt(months) : 1);
  }

  @Get('alerts-summary')
  async getAlertsSummary() {
    return this.reportsService.getAlertsSummary();
  }

  @Get('incidents-summary')
  async getIncidentsSummary() {
    return this.reportsService.getIncidentsSummary();
  }

  @Get('tickets-summary')
  async getTicketsSummary() {
    return this.reportsService.getTicketsSummary();
  }

  @Get('sla')
  async getSLAReport() {
    return this.reportsService.getSLAReport();
  }

  @Get('analyst-performance')
  async getAnalystPerformance() {
    return this.reportsService.getAnalystPerformance();
  }

  @Get('true-positive')
  async getTruePositiveReport() {
    return this.reportsService.getTruePositiveReport();
  }

  @Get('false-positive')
  async getFalsePositiveReport() {
    return this.reportsService.getFalsePositiveReport();
  }

  @Get('noisy-rules')
  async getNoisyRulesReport() {
    return this.reportsService.getNoisyRulesReport();
  }

  @Get('daily/export/pdf')
  async exportDailyPDF(@Res() res: Response, @Query('date') date?: string) {
    const data = await this.reportsService.getDailyReport(date);
    const pdf = await this.reportsService.generatePDF('Daily Report', data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-report.pdf"');
    res.send(pdf);
  }

  @Get('daily/export/excel')
  async exportDailyExcel(@Res() res: Response, @Query('date') date?: string) {
    const data = await this.reportsService.getDailyReport(date);
    const excel = await this.reportsService.generateExcel('Daily Report', data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-report.xlsx"');
    res.send(excel);
  }

  @Get('daily/export/csv')
  async exportDailyCSV(@Res() res: Response, @Query('date') date?: string) {
    const data = await this.reportsService.getDailyReport(date);
    const csv = await this.reportsService.generateCSV('Daily Report', data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-report.csv"');
    res.send(csv);
  }

  @Get('alerts/export/pdf')
  async exportAlertsPDF(@Res() res: Response) {
    const data = await this.reportsService.getAlertsSummary();
    const pdf = await this.reportsService.generatePDF('Alerts Report', data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts-report.pdf"');
    res.send(pdf);
  }

  @Get('alerts/export/excel')
  async exportAlertsExcel(@Res() res: Response) {
    const data = await this.reportsService.getAlertsSummary();
    const excel = await this.reportsService.generateExcel('Alerts Report', data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts-report.xlsx"');
    res.send(excel);
  }

  @Get('alerts/export/csv')
  async exportAlertsCSV(@Res() res: Response) {
    const data = await this.reportsService.getAlertsSummary();
    const csv = await this.reportsService.generateCSV('Alerts Report', data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts-report.csv"');
    res.send(csv);
  }
}
