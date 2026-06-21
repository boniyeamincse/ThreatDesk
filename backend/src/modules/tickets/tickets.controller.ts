import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    const filters = { status, severity };
    return this.ticketsService.findAll(parseInt(skip || '0'), parseInt(take || '20'), filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.ticketsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ticketsService.updateStatus(id, body.status);
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() body: { ownerId: string }) {
    return this.ticketsService.assignTicket(id, body.ownerId);
  }

  @Post(':id/escalate')
  async escalate(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.ticketsService.escalateTicket(id, body?.reason);
  }

  @Post(':id/resolve')
  async resolve(@Param('id') id: string, @Body() body: { resolutionNotes: string }) {
    return this.ticketsService.resolveTicket(id, body.resolutionNotes);
  }

  @Post(':id/close')
  async close(@Param('id') id: string) {
    return this.ticketsService.closeTicket(id);
  }

  @Post(':id/reopen')
  async reopen(@Param('id') id: string) {
    return this.ticketsService.reopenTicket(id);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.ticketsService.getComments(id);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() body: { content: string }, @Request() req: any) {
    return this.ticketsService.addComment(id, req.user.email || req.user.id, body.content);
  }

  @Put(':id/comments/:commentId')
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
  ) {
    return this.ticketsService.updateComment(id, commentId, body.content);
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(@Param('id') id: string, @Param('commentId') commentId: string) {
    return this.ticketsService.deleteComment(id, commentId);
  }
}
