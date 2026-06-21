import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count(),
    ]);

    return { notifications, total, page: skip / take, limit: take };
  }

  async getUnread(userId?: string) {
    const where: any = { read: false };
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type: string;
    relatedId?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        relatedId: data.relatedId,
        userId: data.userId,
        read: false,
      },
    });
  }

  async notifyAlertCreated(alert: any) {
    await this.createNotification({
      title: `New ${alert.severity} Alert`,
      message: `${alert.name} from ${alert.source}`,
      type: 'alert.created',
      relatedId: alert.id,
    });

    await this.sendToChannels({
      event: 'alert.created',
      severity: alert.severity,
      data: alert,
    });
  }

  async notifyAlertEscalated(alert: any) {
    await this.createNotification({
      title: 'Alert Escalated to L2',
      message: `${alert.name} escalated`,
      type: 'alert.escalated',
      relatedId: alert.id,
    });

    await this.sendToChannels({
      event: 'alert.escalated',
      severity: alert.severity,
      data: alert,
    });
  }

  async notifyAlertAssigned(alert: any, assignedTo: string) {
    await this.createNotification({
      userId: assignedTo,
      title: 'Alert Assigned',
      message: `${alert.name} assigned to you`,
      type: 'alert.assigned',
      relatedId: alert.id,
    });
  }

  async notifyTicketCreated(ticket: any) {
    await this.createNotification({
      title: 'New Ticket Created',
      message: ticket.title,
      type: 'ticket.created',
      relatedId: ticket.id,
    });

    await this.sendToChannels({
      event: 'ticket.created',
      severity: ticket.severity,
      data: ticket,
    });
  }

  async notifyIncidentCreated(incident: any) {
    await this.createNotification({
      title: 'New Incident Created',
      message: incident.title,
      type: 'incident.created',
      relatedId: incident.id,
    });

    await this.sendToChannels({
      event: 'incident.created',
      severity: incident.severity,
      data: incident,
    });
  }

  async notifySLABreach(alert: any) {
    await this.createNotification({
      title: 'SLA Breach',
      message: `${alert.name} breached SLA`,
      type: 'sla.breached',
      relatedId: alert.id,
    });

    await this.sendToChannels({
      event: 'sla.breached',
      severity: alert.severity,
      data: alert,
    });
  }

  async notifyLogSourceDisconnected(source: any) {
    await this.createNotification({
      title: 'Log Source Disconnected',
      message: `${source.name} is no longer responding`,
      type: 'logsource.disconnected',
      relatedId: source.id,
    });

    await this.sendToChannels({
      event: 'logsource.disconnected',
      data: source,
    });
  }

  private async sendToChannels(payload: any) {
    // Placeholder for sending to Slack, Teams, email, etc.
    // In production, would queue these as background jobs
    const preferences = await this.prisma.userPreferences.findMany({});

    for (const pref of preferences) {
      if (pref.emailAlerts && this.shouldNotifyViaSeverity(payload.severity, pref.emailSeverity as string[])) {
        // Queue email notification
        console.log(`[Email] Sending ${payload.event} to user`);
      }

      if (pref.slackAlerts && pref.slackWebhook) {
        // Queue Slack notification
        console.log(`[Slack] Sending ${payload.event} to webhook`);
      }
    }
  }

  private shouldNotifyViaSeverity(severity: string, severityList: string[]): boolean {
    if (!severityList || severityList.length === 0) return false;
    return severityList.includes(severity);
  }

  async getDailySummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [alertsCount, incidentsCount, ticketsCount, notifications] = await Promise.all([
      this.prisma.alert.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      this.prisma.incident.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      this.prisma.ticket.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      this.prisma.notification.findMany({
        where: {
          createdAt: { gte: today },
        },
        take: 5,
      }),
    ]);

    return {
      date: today.toISOString().split('T')[0],
      alertsCreated: alertsCount,
      incidentsCreated: incidentsCount,
      ticketsCreated: ticketsCount,
      recentNotifications: notifications,
    };
  }
}
