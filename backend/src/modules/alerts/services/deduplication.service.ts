import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeduplicationService {
  constructor(private prisma: PrismaService) {}

  async findDuplicates(
    ruleId: string,
    assetId: string,
    timeWindowMinutes: number = 60,
  ): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    return this.prisma.alert.findMany({
      where: {
        ruleId,
        assetId,
        alertTime: {
          gte: cutoffTime,
        },
        status: {
          notIn: ['closed', 'archived'],
        },
      },
      orderBy: {
        alertTime: 'desc',
      },
      take: 10,
    });
  }

  async isDuplicate(
    ruleId: string,
    assetId: string,
    sourceIp?: string,
    destinationIp?: string,
    timeWindowMinutes: number = 60,
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const count = await this.prisma.alert.count({
      where: {
        ruleId,
        assetId,
        alertTime: {
          gte: cutoffTime,
        },
        sourceIp,
        destinationIp,
        status: {
          notIn: ['closed', 'archived'],
        },
      },
    });

    return count > 0;
  }

  async updateDuplicateAlertTimeline(alertId: string, duplicateCount: number) {
    return this.prisma.alertTimeline.create({
      data: {
        alertId,
        action: 'duplicate_detected',
        details: `${duplicateCount} similar alert(s) found in past hour`,
      },
    });
  }
}
