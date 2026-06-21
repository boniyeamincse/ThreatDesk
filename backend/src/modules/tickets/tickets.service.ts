import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20, filters?: any) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.severity) {
      where.severity = filters.severity;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          alert: true,
          comments: true,
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { tickets, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        alert: true,
        comments: true,
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(data: any) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity || 'medium',
        status: data.status || 'open',
        assignedTeam: data.assignedTeam,
        ownerId: data.ownerId,
        dueTime: data.dueTime,
        alertId: data.alertId,
        incidentId: data.incidentId,
      },
    });

    return ticket;
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        assignedTeam: data.assignedTeam,
        ownerId: data.ownerId,
        dueTime: data.dueTime,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.ticketComment.deleteMany({
      where: { ticketId: id },
    });

    return this.prisma.ticket.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['open', 'assigned', 'in_progress', 'waiting_user', 'waiting_it', 'resolved', 'closed', 'reopened'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }

  async assignTicket(id: string, ownerId: string) {
    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ownerId,
        status: 'assigned',
      },
    });
  }

  async escalateTicket(id: string, reason?: string) {
    const ticket = await this.findOne(id);

    if (ticket.severity === 'critical') {
      throw new BadRequestException('Cannot escalate critical severity ticket');
    }

    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const currentLevel = severityOrder.indexOf(ticket.severity);
    const newSeverity = severityOrder[Math.min(currentLevel + 1, severityOrder.length - 1)];

    return this.prisma.ticket.update({
      where: { id },
      data: {
        severity: newSeverity,
        status: 'in_progress',
      },
    });
  }

  async resolveTicket(id: string, resolutionNotes: string) {
    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'resolved',
        resolutionNotes,
      },
    });
  }

  async closeTicket(id: string) {
    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  async reopenTicket(id: string) {
    await this.findOne(id);

    return this.prisma.ticket.update({
      where: { id },
      data: { status: 'reopened' },
    });
  }

  async getComments(id: string) {
    await this.findOne(id);

    return this.prisma.ticketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addComment(id: string, author: string, content: string) {
    await this.findOne(id);

    return this.prisma.ticketComment.create({
      data: {
        ticketId: id,
        author,
        content,
      },
    });
  }

  async updateComment(ticketId: string, commentId: string, content: string) {
    const comment = await this.prisma.ticketComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.ticketId !== ticketId) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.ticketComment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(ticketId: string, commentId: string) {
    const comment = await this.prisma.ticketComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.ticketId !== ticketId) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.ticketComment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted' };
  }
}
