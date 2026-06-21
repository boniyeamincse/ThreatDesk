import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    const filters = { severity, status, source };
    return this.alertsService.findAll(parseInt(skip || '0'), parseInt(take || '20'), filters);
  }

  @Post()
  create(@Body() data: any) {
    return this.alertsService.create(data);
  }

  @Get('users/assignees/list')
  getAssignees() {
    return this.alertsService.getAssignees();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.alertsService.deleteAlert(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.alertsService.updateStatus(id, body.status);
  }

  @Patch(':id/severity')
  updateSeverity(@Param('id') id: string, @Body() body: { severity: string }) {
    return this.alertsService.updateSeverity(id, body.severity);
  }

  @Patch(':id/priority-score')
  updatePriorityScore(@Param('id') id: string, @Body() body: { priorityScore: number }) {
    return this.alertsService.updatePriorityScore(id, body.priorityScore);
  }

  @Patch(':id/verdict')
  updateVerdict(@Param('id') id: string, @Body() body: { verdict: string }) {
    return this.alertsService.updateVerdict(id, body.verdict);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.alertsService.assign(id, body.userId);
  }

  @Post(':id/unassign')
  unassign(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.alertsService.unassign(id, body.userId);
  }

  @Post(':id/start')
  startInvestigation(@Param('id') id: string) {
    return this.alertsService.startInvestigation(id);
  }

  @Post(':id/close')
  closeAlert(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.alertsService.closeAlert(id, body?.reason);
  }

  @Post(':id/archive')
  archiveAlert(@Param('id') id: string) {
    return this.alertsService.archiveAlert(id);
  }

  @Post(':id/reopen')
  reopenAlert(@Param('id') id: string) {
    return this.alertsService.reopenAlert(id);
  }

  @Post(':id/escalate')
  escalate(@Param('id') id: string, @Body() body: { reason: string }, @Request() req: any) {
    return this.alertsService.escalate(id, req.user.id, body.reason);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.alertsService.getComments(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: { content: string }, @Request() req: any) {
    return this.alertsService.addComment(id, req.user.id, body.content);
  }

  @Put(':id/comments/:commentId')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.alertsService.updateComment(id, commentId, req.user.id, body.content);
  }

  @Delete(':id/comments/:commentId')
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.alertsService.deleteComment(id, commentId, req.user.id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.alertsService.getTimeline(id);
  }

  @Get(':id/raw-event')
  getRawEvent(@Param('id') id: string) {
    return this.alertsService.getRawEvent(id);
  }

  @Get(':id/related-alerts')
  getRelatedAlerts(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.alertsService.getRelatedAlerts(id, limit ? parseInt(limit) : 5);
  }

  @Post(':id/create-incident')
  createIncident(@Param('id') id: string, @Body() data: any) {
    return this.alertsService.createIncidentFromAlert(id, data);
  }
}
