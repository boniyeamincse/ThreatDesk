import { Controller, Get, Param, Post, Body, Patch, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface UpdateStatusBody {
  status: string;
}

@Controller('api/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.ticketsService.findAll(parseInt(skip || '0'), parseInt(take || '20'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.ticketsService.create(data);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusBody) {
    return this.ticketsService.updateStatus(id, body.status);
  }
}
