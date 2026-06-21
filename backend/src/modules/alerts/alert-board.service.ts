import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertBoardService {
  constructor(private prisma: PrismaService) {}

  private readonly boardColumns = ['new', 'in_progress', 'escalated', 'closed', 'archived'];

  async getBoard(filters?: { severity?: string; source?: string; assignedTo?: string }) {
    const where: any = {};

    if (filters?.severity) {
      where.severity = filters.severity;
    }
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.assignedTo) {
      where.assignedTo = {
        some: { userId: filters.assignedTo },
      };
    }

    const columns = await Promise.all(
      this.boardColumns.map(async (status) => ({
        id: status,
        title: this.formatColumnName(status),
        status,
        alerts: await this.prisma.alert.findMany({
          where: { ...where, status },
          include: {
            asset: true,
            assignedTo: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          },
          orderBy: { alertTime: 'desc' },
        }),
      })),
    );

    return {
      columns,
      total: columns.reduce((sum, col) => sum + col.alerts.length, 0),
    };
  }

  async getColumns() {
    return this.boardColumns.map((status) => ({
      id: status,
      title: this.formatColumnName(status),
      status,
    }));
  }

  async moveAlert(alertId: string, newStatus: string) {
    if (!this.boardColumns.includes(newStatus)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${this.boardColumns.join(', ')}`);
    }

    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alert not found');

    const updated = await this.prisma.alert.update({
      where: { id: alertId },
      data: { status: newStatus },
      include: {
        asset: true,
        assignedTo: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId,
        action: 'status_changed',
        details: `Moved from ${alert.status} to ${newStatus}`,
      },
    });

    return updated;
  }

  async getMyAlerts(userId: string) {
    const alerts = await this.prisma.alert.findMany({
      where: {
        assignedTo: {
          some: { userId },
        },
      },
      include: {
        asset: true,
        assignedTo: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { alertTime: 'desc' },
    });

    return alerts;
  }

  async getTeamAlerts(userRole?: string) {
    const alerts = await this.prisma.alert.findMany({
      where: {
        assignedTo: {
          some: {},
        },
      },
      include: {
        asset: true,
        assignedTo: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } } },
      },
      orderBy: { alertTime: 'desc' },
    });

    return alerts;
  }

  private formatColumnName(status: string): string {
    const names: { [key: string]: string } = {
      new: 'New',
      in_progress: 'In Progress',
      escalated: 'Escalated',
      closed: 'Closed',
      archived: 'Archived',
    };
    return names[status] || status;
  }
}
