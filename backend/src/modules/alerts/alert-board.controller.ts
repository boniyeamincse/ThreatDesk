import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AlertBoardService } from './alert-board.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/alert-board')
@UseGuards(JwtAuthGuard)
export class AlertBoardController {
  constructor(private alertBoardService: AlertBoardService) {}

  @Get()
  getBoard(
    @Query('severity') severity?: string,
    @Query('source') source?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.alertBoardService.getBoard({ severity, source, assignedTo });
  }

  @Get('columns')
  getColumns() {
    return this.alertBoardService.getColumns();
  }

  @Patch('alerts/:id/move')
  moveAlert(@Param('id') id: string, @Body() body: { status: string }) {
    return this.alertBoardService.moveAlert(id, body.status);
  }

  @Get('my-alerts')
  getMyAlerts(@Request() req: any) {
    return this.alertBoardService.getMyAlerts(req.user.id);
  }

  @Get('team-alerts')
  getTeamAlerts(@Request() req: any) {
    return this.alertBoardService.getTeamAlerts();
  }
}
