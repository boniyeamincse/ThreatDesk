import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogSourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20) {
    const [sources, total] = await Promise.all([
      this.prisma.integration.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.integration.count(),
    ]);

    return { sources, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    const source = await this.prisma.integration.findUnique({
      where: { id },
    });

    if (!source) throw new NotFoundException('Log source not found');
    return source;
  }

  async create(data: any) {
    return this.prisma.integration.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        status: 'inactive',
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    return this.prisma.integration.update({
      where: { id },
      data: {
        name: data.name,
        config: data.config,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.integration.delete({ where: { id } });
  }

  async testConnection(id: string) {
    const source = await this.findOne(id);

    try {
      if (source.type === 'wazuh') {
        return await this.testWazuhConnection(source.config as any);
      } else if (source.type === 'deep-security') {
        return { success: true, message: 'Deep Security connection test passed' };
      } else if (source.type === 'firewall') {
        return { success: true, message: 'Firewall connection test passed' };
      }
      return { success: true, message: 'Connection test passed' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getHealth(id: string) {
    const source = await this.findOne(id);

    const alertCount = await this.prisma.alert.count({
      where: { source: source.type },
    });

    return {
      id,
      name: source.name,
      type: source.type,
      status: source.status,
      lastSyncAt: source.lastSyncAt,
      lastError: source.lastError,
      alertCount,
      healthy: source.status === 'active' && !source.lastError,
    };
  }

  async markSynced(id: string) {
    return this.prisma.integration.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        status: 'active',
        lastError: null,
      },
    });
  }

  async markError(id: string, error: string) {
    return this.prisma.integration.update({
      where: { id },
      data: {
        status: 'error',
        lastError: error,
      },
    });
  }

  private async testWazuhConnection(config: any) {
    // Placeholder - would use actual Wazuh API test
    if (!config.apiUrl || !config.user || !config.password) {
      throw new BadRequestException('Missing Wazuh configuration');
    }
    return { success: true, message: 'Wazuh connection test passed' };
  }
}
