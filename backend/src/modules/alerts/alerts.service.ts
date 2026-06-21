import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        asset: true,
        assignedTo: { include: { user: true } },
        comments: { include: { user: true } },
        timeline: true,
        tickets: true,
      },
    });

    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async create(data: any) {
    const alert = await this.prisma.alert.create({
      data: {
        source: data.source,
        name: data.name,
        description: data.description,
        severity: data.severity || 'medium',
        status: data.status || 'new',
        verdict: data.verdict || 'unclassified',
        alertTime: new Date(data.alertTime),
        eventTime: new Date(data.eventTime),
        assetId: data.assetId,
        username: data.username,
        sourceIp: data.sourceIp,
        destinationIp: data.destinationIp,
        destinationPort: data.destinationPort,
        protocol: data.protocol,
        mitreTactic: data.mitreTactic,
        mitreTechnique: data.mitreTechnique,
        ruleId: data.ruleId,
        rawEvent: data.rawEvent,
        priorityScore: data.priorityScore || 0,
      },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: alert.id,
        action: 'created',
        details: 'Alert created',
      },
    });

    return alert;
  }

  async deleteAlert(id: string) {
    await this.findOne(id);
    await this.prisma.alertComment.deleteMany({ where: { alertId: id } });
    await this.prisma.alertTimeline.deleteMany({ where: { alertId: id } });
    await this.prisma.alertAssignment.deleteMany({ where: { alertId: id } });
    return this.prisma.alert.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: { status },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'status_changed',
        details: `Status changed to: ${status}`,
      },
    });

    return alert;
  }

  async updateSeverity(id: string, severity: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: { severity },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'severity_changed',
        details: `Severity changed to: ${severity}`,
      },
    });

    return alert;
  }

  async updatePriorityScore(id: string, priorityScore: number) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: { priorityScore },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'priority_changed',
        details: `Priority score changed to: ${priorityScore}`,
      },
    });

    return alert;
  }

  async assign(id: string, userId: string) {
    await this.findOne(id);
    const existing = await this.prisma.alertAssignment.findFirst({
      where: { alertId: id, userId },
    });
    if (existing) return existing;

    const assignment = await this.prisma.alertAssignment.create({
      data: { alertId: id, userId },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'assigned',
        details: `Assigned to user ${userId}`,
      },
    });

    return assignment;
  }

  async unassign(id: string, userId: string) {
    await this.findOne(id);
    const assignment = await this.prisma.alertAssignment.findFirst({
      where: { alertId: id, userId },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    await this.prisma.alertAssignment.delete({ where: { id: assignment.id } });
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'unassigned',
        details: `Unassigned from user ${userId}`,
      },
    });

    return { message: 'Unassigned' };
  }

  async startInvestigation(id: string) {
    return this.updateStatus(id, 'in_progress');
  }

  async closeAlert(id: string, reason?: string) {
    const alert = await this.updateStatus(id, 'closed');
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'closed',
        details: `Closed. Reason: ${reason || 'No reason provided'}`,
      },
    });
    return alert;
  }

  async archiveAlert(id: string) {
    const alert = await this.updateStatus(id, 'archived');
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'archived',
        details: 'Alert archived',
      },
    });
    return alert;
  }

  async reopenAlert(id: string) {
    const alert = await this.updateStatus(id, 'new');
    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'reopened',
        details: 'Alert reopened',
      },
    });
    return alert;
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
      data: { verdict },
    });

    await this.prisma.alertTimeline.create({
      data: {
        alertId: id,
        action: 'verdict_set',
        details: `Verdict set to: ${verdict}`,
      },
    });

    return alert;
  }

  async addComment(id: string, userId: string, content: string) {
    await this.findOne(id);
    return this.prisma.alertComment.create({
      data: { alertId: id, userId, content },
      include: { user: true },
    });
  }

  async getComments(id: string) {
    await this.findOne(id);
    return this.prisma.alertComment.findMany({
      where: { alertId: id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateComment(id: string, commentId: string, userId: string, content: string) {
    const comment = await this.prisma.alertComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new BadRequestException('Can only edit your own comments');

    return this.prisma.alertComment.update({
      where: { id: commentId },
      data: { content },
      include: { user: true },
    });
  }

  async deleteComment(id: string, commentId: string, userId: string) {
    const comment = await this.prisma.alertComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new BadRequestException('Can only delete your own comments');

    await this.prisma.alertComment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }

  async getTimeline(id: string) {
    await this.findOne(id);
    return this.prisma.alertTimeline.findMany({
      where: { alertId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRawEvent(id: string) {
    const alert = await this.findOne(id);
    return {
      id: alert.id,
      alertCode: alert.alertCode,
      rawEvent: alert.rawEvent,
    };
  }

  async getRelatedAlerts(id: string, limit = 5) {
    const alert = await this.findOne(id);
    if (!alert.assetId) return [];

    return this.prisma.alert.findMany({
      where: {
        assetId: alert.assetId,
        id: { not: id },
      },
      orderBy: { alertTime: 'desc' },
      take: limit,
      include: { asset: true },
    });
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
