import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriorityService } from './services/priority.service';

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private priorityService: PriorityService,
  ) {}

  async findAll(skip = 0, take = 20, filters: any = {}) {
    const where: any = {};

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip,
        take,
        orderBy: { alertTime: 'desc' },
        include: {
          asset: true,
          assignedTo: { include: { user: true } },
        },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return { alerts, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    return this.prisma.alert.findUnique({
      where: { id },
      include: {
        asset: true,
        assignedTo: { include: { user: true } },
        comments: { include: { user: true } },
        timeline: true,
        tickets: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.alert.update({
      where: { id },
      data: { status },
    });
  }

  async assign(id: string, userId: string) {
    return this.prisma.alertAssignment.create({
      data: {
        alertId: id,
        userId,
      },
    });
  }

  async addComment(id: string, userId: string, content: string) {
    return this.prisma.alertComment.create({
      data: {
        alertId: id,
        userId,
        content,
      },
    });
  }

  async escalate(id: string, userId: string, reason: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        status: 'escalated',
        escalatedAt: new Date(),
        escalatedBy: userId,
        escalationReason: reason,
      },
    });

    // Create timeline entry
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'escalated',
        details: `Escalated to L2. Reason: ${reason}`,
      },
    });

    return alert;
  }

  async updateVerdict(id: string, verdict: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        verdict,
      },
    });

    // Create timeline entry
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'verdict_set',
        details: `Verdict set to: ${verdict}`,
      },
    });

    return alert;
  }

  async getAssignees() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }
}
