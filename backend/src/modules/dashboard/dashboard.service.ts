import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [newAlerts, inProgress, escalated, truePositive, falsePositive, closedToday, criticalAlerts, slaBreached] =
      await Promise.all([
        this.prisma.alert.count({ where: { status: 'new' } }),
        this.prisma.alert.count({ where: { status: 'in_progress' } }),
        this.prisma.alert.count({ where: { status: 'escalated' } }),
        this.prisma.alert.count({ where: { verdict: 'true_positive' } }),
        this.prisma.alert.count({ where: { verdict: 'false_positive' } }),
        this.prisma.alert.count({
          where: {
            status: 'closed',
            updatedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        this.prisma.alert.count({ where: { severity: 'critical' } }),
        this.prisma.alert.count({ where: { status: 'escalated', alertTime: { lt: new Date(Date.now() - 3600000) } } }),
      ]);

    return {
      newAlerts,
      inProgress,
      escalated,
      truePositive,
      falsePositive,
      closedToday,
      criticalAlerts,
      slaBreached,
    };
  }

  async getSeverityCount() {
    const counts = await this.prisma.alert.groupBy({
      by: ['severity'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.severity,
      count: item._count,
    }));
  }

  async getStatusCount() {
    const counts = await this.prisma.alert.groupBy({
      by: ['status'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.status,
      count: item._count,
    }));
  }

  async getVerdictCount() {
    const counts = await this.prisma.alert.groupBy({
      by: ['verdict'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.verdict,
      count: item._count,
    }));
  }
}
