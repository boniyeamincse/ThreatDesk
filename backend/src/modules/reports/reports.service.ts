import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyReport(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [alerts, incidents, tickets, truePositives, falsePositives] = await Promise.all([
      this.prisma.alert.count({
        where: { createdAt: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.incident.count({
        where: { createdAt: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.ticket.count({
        where: { createdAt: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.alert.count({
        where: { verdict: 'true_positive', createdAt: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.alert.count({
        where: { verdict: 'false_positive', createdAt: { gte: targetDate, lt: nextDate } },
      }),
    ]);

    return {
      date: targetDate.toISOString().split('T')[0],
      alerts,
      incidents,
      tickets,
      truePositives,
      falsePositives,
      accuracy: alerts > 0 ? ((truePositives / alerts) * 100).toFixed(2) : '0',
    };
  }

  async getWeeklyReport(weeks?: number) {
    const numWeeks = weeks || 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7 * numWeeks);
    startDate.setHours(0, 0, 0, 0);

    const [alerts, incidents, tickets, truePositives, falsePositives] = await Promise.all([
      this.prisma.alert.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.incident.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.ticket.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.alert.count({ where: { verdict: 'true_positive', createdAt: { gte: startDate } } }),
      this.prisma.alert.count({ where: { verdict: 'false_positive', createdAt: { gte: startDate } } }),
    ]);

    return {
      startDate: startDate.toISOString().split('T')[0],
      daysIncluded: 7 * numWeeks,
      alerts,
      incidents,
      tickets,
      truePositives,
      falsePositives,
      accuracy: alerts > 0 ? ((truePositives / alerts) * 100).toFixed(2) : '0',
      dailyAverage: {
        alerts: Math.round(alerts / (7 * numWeeks)),
        incidents: Math.round(incidents / (7 * numWeeks)),
        tickets: Math.round(tickets / (7 * numWeeks)),
      },
    };
  }

  async getMonthlyReport(months?: number) {
    const numMonths = months || 1;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths);
    startDate.setHours(0, 0, 0, 0);

    const [alerts, incidents, tickets, truePositives, falsePositives] = await Promise.all([
      this.prisma.alert.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.incident.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.ticket.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.alert.count({ where: { verdict: 'true_positive', createdAt: { gte: startDate } } }),
      this.prisma.alert.count({ where: { verdict: 'false_positive', createdAt: { gte: startDate } } }),
    ]);

    const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      startDate: startDate.toISOString().split('T')[0],
      daysIncluded: days,
      alerts,
      incidents,
      tickets,
      truePositives,
      falsePositives,
      accuracy: alerts > 0 ? ((truePositives / alerts) * 100).toFixed(2) : '0',
      dailyAverage: {
        alerts: Math.round(alerts / days),
        incidents: Math.round(incidents / days),
        tickets: Math.round(tickets / days),
      },
    };
  }

  async getAlertsSummary() {
    const [newAlerts, inProgress, escalated, closed, byStatus, bySeverity, bySource, byVerdict] = await Promise.all([
      this.prisma.alert.count({ where: { status: 'new' } }),
      this.prisma.alert.count({ where: { status: 'in_progress' } }),
      this.prisma.alert.count({ where: { status: 'escalated' } }),
      this.prisma.alert.count({ where: { status: 'closed' } }),
      this.prisma.alert.groupBy({ by: ['status'], _count: true }),
      this.prisma.alert.groupBy({ by: ['severity'], _count: true }),
      this.prisma.alert.groupBy({ by: ['source'], _count: true, where: { source: { not: null } } }),
      this.prisma.alert.groupBy({ by: ['verdict'], _count: true }),
    ]);

    return {
      summary: { newAlerts, inProgress, escalated, closed },
      byStatus: byStatus.map((s) => ({ name: s.status, count: s._count })),
      bySeverity: bySeverity.map((s) => ({ name: s.severity, count: s._count })),
      bySource: bySource.map((s) => ({ name: s.source || 'unknown', count: s._count })),
      byVerdict: byVerdict.map((v) => ({ name: v.verdict, count: v._count })),
    };
  }

  async getIncidentsSummary() {
    const [open, investigating, contained, remediated, recovered, closed] = await Promise.all([
      this.prisma.incident.count({ where: { status: 'open' } }),
      this.prisma.incident.count({ where: { status: 'investigating' } }),
      this.prisma.incident.count({ where: { status: 'contained' } }),
      this.prisma.incident.count({ where: { status: 'remediated' } }),
      this.prisma.incident.count({ where: { status: 'recovered' } }),
      this.prisma.incident.count({ where: { status: 'closed' } }),
    ]);

    return {
      open,
      investigating,
      contained,
      remediated,
      recovered,
      closed,
      total: open + investigating + contained + remediated + recovered + closed,
    };
  }

  async getTicketsSummary() {
    const [open, assigned, inProgress, resolved, closed] = await Promise.all([
      this.prisma.ticket.count({ where: { status: 'open' } }),
      this.prisma.ticket.count({ where: { status: 'assigned' } }),
      this.prisma.ticket.count({ where: { status: 'in_progress' } }),
      this.prisma.ticket.count({ where: { status: 'resolved' } }),
      this.prisma.ticket.count({ where: { status: 'closed' } }),
    ]);

    return {
      open,
      assigned,
      inProgress,
      resolved,
      closed,
      total: open + assigned + inProgress + resolved + closed,
    };
  }

  async getSLAReport() {
    const breachedAlerts = await this.prisma.alert.findMany({
      where: {
        status: 'escalated',
        escalatedAt: { not: null },
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
      take: 50,
    });

    const breachCount = breachedAlerts.length;
    const totalEscalated = await this.prisma.alert.count({ where: { status: 'escalated' } });

    return {
      breachCount,
      totalEscalated,
      breachRate: totalEscalated > 0 ? ((breachCount / totalEscalated) * 100).toFixed(2) : '0',
      recentBreaches: breachedAlerts,
    };
  }

  async getAnalystPerformance() {
    const analysts = await this.prisma.user.findMany({
      include: {
        alerts: { select: { alertId: true } },
      },
    });

    return Promise.all(
      analysts.map(async (analyst) => {
        const alertCount = await this.prisma.alertAssignment.count({
          where: { userId: analyst.id },
        });
        const closedCount = await this.prisma.alert.count({
          where: {
            assignedTo: { some: { userId: analyst.id } },
            status: 'closed',
          },
        });

        return {
          userId: analyst.id,
          analyst: `${analyst.firstName} ${analyst.lastName}`,
          email: analyst.email,
          alertsAssigned: alertCount,
          alertsClosed: closedCount,
          closureRate: alertCount > 0 ? ((closedCount / alertCount) * 100).toFixed(2) : '0',
        };
      }),
    );
  }

  async getTruePositiveReport() {
    const alerts = await this.prisma.alert.findMany({
      where: { verdict: 'true_positive' },
      select: {
        id: true,
        alertCode: true,
        name: true,
        severity: true,
        source: true,
        alertTime: true,
      },
      orderBy: { alertTime: 'desc' },
      take: 100,
    });

    const count = await this.prisma.alert.count({ where: { verdict: 'true_positive' } });
    const total = await this.prisma.alert.count();

    return {
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(2) : '0',
      recentAlerts: alerts,
    };
  }

  async getFalsePositiveReport() {
    const alerts = await this.prisma.alert.findMany({
      where: { verdict: 'false_positive' },
      select: {
        id: true,
        alertCode: true,
        name: true,
        severity: true,
        source: true,
        alertTime: true,
      },
      orderBy: { alertTime: 'desc' },
      take: 100,
    });

    const count = await this.prisma.alert.count({ where: { verdict: 'false_positive' } });
    const total = await this.prisma.alert.count();

    return {
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(2) : '0',
      recentAlerts: alerts,
    };
  }

  async getNoisyRulesReport() {
    const rules = await this.prisma.alert.groupBy({
      by: ['ruleId'],
      _count: true,
    });

    return rules
      .filter((r) => r.ruleId !== null)
      .sort((a, b) => b._count - a._count)
      .slice(0, 20)
      .map((r) => ({
        ruleId: r.ruleId,
        count: r._count,
        percentage: ((r._count / 1000) * 100).toFixed(2),
      }));
  }

  async generatePDF(reportType: string, data: any): Promise<Buffer> {
    // Placeholder - in production, use a library like pdfkit or puppeteer
    const pdfContent = `Report: ${reportType}\n\nData: ${JSON.stringify(data, null, 2)}`;
    return Buffer.from(pdfContent);
  }

  async generateExcel(reportType: string, data: any): Promise<Buffer> {
    // Placeholder - in production, use xlsx library
    const csvContent = this.jsonToCSV(data);
    return Buffer.from(csvContent);
  }

  async generateCSV(reportType: string, data: any): Promise<Buffer> {
    const csvContent = this.jsonToCSV(data);
    return Buffer.from(csvContent);
  }

  private jsonToCSV(data: any): string {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map((row) => Object.values(row).join(',')).join('\n');
      return `${headers}\n${rows}`;
    }
    return JSON.stringify(data, null, 2);
  }
}
