import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.notificationsService.findAll(parseInt(skip || '0'), parseInt(take || '20'));
  }

  @Get('unread')
  async getUnread(@Request() req: any, @Query('userId') userId?: string) {
    return this.notificationsService.getUnread(userId || req.user.id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Get('summary/daily')
  async getDailySummary(@Request() req: any) {
    return this.notificationsService.getDailySummary(req.user.id);
  }
}
