import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20, filters?: any) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.resource) {
      where.resource = filters.resource;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
    });
  }

  async log(data: {
    userId?: string;
    action: string;
    resource?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        changes: data.changes,
      },
    });
  }

  async getUserLogs(userId: string, skip = 0, take = 20) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    return { logs, total, page: skip / take, limit: take };
  }

  async getResourceLogs(resource: string, skip = 0, take = 20) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { resource },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { resource } }),
    ]);

    return { logs, total, page: skip / take, limit: take };
  }
}
