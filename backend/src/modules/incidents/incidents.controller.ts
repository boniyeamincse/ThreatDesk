import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    const filters = { severity, status };
    return this.incidentsService.findAll(parseInt(skip || '0'), parseInt(take || '20'), filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.incidentsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.incidentsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.incidentsService.delete(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() data: { owner: string }) {
    return this.incidentsService.assignIncident(id, data.owner);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.incidentsService.updateStatus(id, data.status);
  }

  @Post(':id/contain')
  contain(@Param('id') id: string, @Body() data?: { details?: string }) {
    return this.incidentsService.containIncident(id, data?.details);
  }

  @Post(':id/remediate')
  remediate(@Param('id') id: string, @Body() data?: { details?: string }) {
    return this.incidentsService.remediateIncident(id, data?.details);
  }

  @Post(':id/recover')
  recover(@Param('id') id: string, @Body() data?: { details?: string }) {
    return this.incidentsService.recoverIncident(id, data?.details);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() data?: { details?: string }) {
    return this.incidentsService.closeIncident(id, data?.details);
  }

  @Post(':id/reopen')
  reopen(@Param('id') id: string, @Body() data?: { reason?: string }) {
    return this.incidentsService.reopenIncident(id, data?.reason);
  }

  @Post(':id/alerts')
  addAlert(@Param('id') id: string, @Body() data: { alertId: string }) {
    return this.incidentsService.addAlertToIncident(id, data.alertId);
  }

  @Delete(':id/alerts/:alertId')
  removeAlert(@Param('id') id: string, @Param('alertId') alertId: string) {
    return this.incidentsService.removeAlertFromIncident(id, alertId);
  }

  @Get(':id/alerts')
  getAlerts(@Param('id') id: string) {
    return this.incidentsService.getIncidentAlerts(id);
  }

  @Post(':id/assets')
  addAsset(@Param('id') id: string, @Body() data: { assetId: string }) {
    return this.incidentsService.addAssetToIncident(id, data.assetId);
  }

  @Delete(':id/assets/:assetId')
  removeAsset(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.incidentsService.removeAssetFromIncident(id, assetId);
  }

  @Get(':id/assets')
  getAssets(@Param('id') id: string) {
    return this.incidentsService.getIncidentAssets(id);
  }
}
