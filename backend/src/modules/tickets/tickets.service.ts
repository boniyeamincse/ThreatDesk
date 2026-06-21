import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20) {
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          alert: true,
          comments: true,
        },
      }),
      this.prisma.ticket.count(),
    ]);

    return { tickets, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        alert: true,
        comments: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.ticket.create({
      data,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }
}
