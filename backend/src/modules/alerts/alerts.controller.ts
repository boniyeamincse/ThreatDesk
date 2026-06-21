import { Controller, Get, Param, Patch, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface UpdateStatusBody {
  status: string;
}

interface AddCommentBody {
  content: string;
}

interface AssignBody {
  userId: string;
}

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

  @Get('users/assignees/list')
  getAssignees() {
    return this.alertsService.getAssignees();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusBody) {
    return this.alertsService.updateStatus(id, body.status);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() body: AssignBody) {
    return this.alertsService.assign(id, body.userId);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: AddCommentBody, @Request() req: any) {
    return this.alertsService.addComment(id, req.user.id, body.content);
  }

  @Post(':id/escalate')
  async escalate(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.alertsService.escalate(id, req.user.id, body.reason);
  }

  @Patch(':id/verdict')
  async updateVerdict(
    @Param('id') id: string,
    @Body() body: { verdict: string },
  ) {
    return this.alertsService.updateVerdict(id, body.verdict);
  }
}
