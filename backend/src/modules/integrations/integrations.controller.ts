import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  async findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.integrationsService.create(data);
  }

  @Get('wazuh/config')
  async getWazuhConfig() {
    return this.integrationsService.getWazuhConfig();
  }

  @Post('wazuh/config')
  async saveWazuhConfig(@Body() body: any) {
    return this.integrationsService.saveWazuhConfig(body);
  }

  @Post('wazuh/test')
  async testWazuh(@Body() body: any) {
    return this.integrationsService.testWazuh(body.apiUrl, body.user, body.password);
  }
}
