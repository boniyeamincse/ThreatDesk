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
      new_alerts: newAlerts,
      in_progress: inProgress,
      escalated,
      true_positive: truePositive,
      false_positive: falsePositive,
      closed_today: closedToday,
      critical_alerts: criticalAlerts,
      sla_breached: slaBreached,
    };
  }

  async getAlertCounts() {
    const [newAlerts, inProgress, escalated, closed, archived] = await Promise.all([
      this.prisma.alert.count({ where: { status: 'new' } }),
      this.prisma.alert.count({ where: { status: 'in_progress' } }),
      this.prisma.alert.count({ where: { status: 'escalated' } }),
      this.prisma.alert.count({ where: { status: 'closed' } }),
      this.prisma.alert.count({ where: { status: 'archived' } }),
    ]);

    return {
      new: newAlerts,
      in_progress: inProgress,
      escalated,
      closed,
      archived,
    };
  }

  async getSeverityCounts() {
    const counts = await this.prisma.alert.groupBy({
      by: ['severity'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.severity,
      count: item._count,
    }));
  }

  async getStatusCounts() {
    const counts = await this.prisma.alert.groupBy({
      by: ['status'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.status,
      count: item._count,
    }));
  }

  async getVerdictCounts() {
    const counts = await this.prisma.alert.groupBy({
      by: ['verdict'],
      _count: true,
    });

    return counts.map((item) => ({
      name: item.verdict,
      count: item._count,
    }));
  }

  async getSourceCounts() {
    const counts = await this.prisma.alert.groupBy({
      by: ['source'],
      _count: true,
    });

    return counts
      .filter((item) => item.source !== null)
      .sort((a, b) => b._count - a._count)
      .slice(0, 10)
      .map((item) => ({
        name: item.source || 'unknown',
        count: item._count,
      }));
  }

  async getSLABreaches() {
    const breaches = await this.prisma.alert.findMany({
      where: {
        status: 'escalated',
        alertTime: { lt: new Date(Date.now() - 3600000) },
      },
      select: {
        id: true,
        alertCode: true,
        name: true,
        severity: true,
        alertTime: true,
        escalatedAt: true,
      },
      orderBy: { escalatedAt: 'desc' },
      take: 20,
    });

    return breaches;
  }

  async getAnalystWorkload() {
    const workload = await this.prisma.alertAssignment.groupBy({
      by: ['userId'],
      _count: true,
    });

    const results = await Promise.all(
      workload.map(async (w) => {
        const user = await this.prisma.user.findUnique({
          where: { id: w.userId },
          select: { id: true, firstName: true, lastName: true, email: true },
        });
        return {
          userId: w.userId,
          analyst: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          alertCount: w._count,
        };
      }),
    );

    return results.sort((a, b) => b.alertCount - a.alertCount);
  }

  async getAlertTrends(days: number = 7) {
    const alerts = await this.prisma.alert.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true, severity: true },
      orderBy: { createdAt: 'asc' },
    });

    const trends: { [key: string]: { [key: string]: number } } = {};
    alerts.forEach((alert) => {
      const date = alert.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { critical: 0, high: 0, medium: 0, low: 0 };
      }
      trends[date][alert.severity] = (trends[date][alert.severity] || 0) + 1;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getTopRiskAssets(limit: number = 10) {
    const assets = await this.prisma.alert.groupBy({
      by: ['assetId'],
      _count: true,
    });

    const sorted = assets
      .filter((a) => a.assetId !== null)
      .sort((a, b) => b._count - a._count)
      .slice(0, limit);

    const results = await Promise.all(
      sorted.map(async (a) => {
        if (!a.assetId) return null;
        const asset = await this.prisma.asset.findUnique({
          where: { id: a.assetId },
        });
        return {
          assetId: a.assetId,
          hostname: asset?.hostname,
          alertCount: a._count,
          criticality: asset?.criticality,
        };
      }),
    );

    return results.filter((r) => r !== null);
  }

  async getTopNoisyRules(limit: number = 10) {
    const rules = await this.prisma.alert.groupBy({
      by: ['ruleId'],
      _count: true,
    });

    return rules
      .sort((a, b) => b._count - a._count)
      .slice(0, limit)
      .map((item) => ({
        ruleId: item.ruleId,
        count: item._count,
      }));
  }
}
