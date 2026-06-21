import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LogSourcesService } from '../log-sources/log-sources.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private logSourcesService: LogSourcesService,
  ) {}

  // Sync Wazuh alerts every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncWazuhAlerts() {
    this.logger.log('Starting Wazuh alert sync...');
    try {
      const wazuhSource = await this.prisma.integration.findFirst({
        where: { type: 'wazuh' },
      });

      if (!wazuhSource || wazuhSource.status !== 'active') {
        this.logger.log('Wazuh source not configured or inactive');
        return;
      }

      // Placeholder: In production, would call Wazuh API
      const config = wazuhSource.config as any;
      console.log(`Syncing from Wazuh: ${config.apiUrl}`);

      // Mark as synced
      await this.logSourcesService['markSynced'](wazuhSource.id);
      this.logger.log('Wazuh sync completed');
    } catch (error) {
      this.logger.error('Wazuh sync failed', error);
    }
  }

  // Check SLA breaches every 1 minute
  @Cron(CronExpression.EVERY_MINUTE)
  async checkSLABreaches() {
    this.logger.log('Checking SLA breaches...');
    try {
      const escalatedAlerts = await this.prisma.alert.findMany({
        where: {
          status: 'escalated',
          escalatedAt: {
            lt: new Date(Date.now() - 3600000), // 1 hour
          },
        },
      });

      for (const alert of escalatedAlerts) {
        this.logger.warn(`SLA breach detected: ${alert.id}`);
        // Emit SLA breach notification
        if (this.notificationsService['notifySLABreach']) {
          await this.notificationsService['notifySLABreach'](alert);
        }
      }

      this.logger.log(`Found ${escalatedAlerts.length} SLA breaches`);
    } catch (error) {
      this.logger.error('SLA check failed', error);
    }
  }

  // Generate daily SOC report at 8 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDailyReport() {
    this.logger.log('Generating daily SOC report...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alerts = await this.prisma.alert.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
      });

      const truePositives = await this.prisma.alert.count({
        where: {
          verdict: 'true_positive',
          createdAt: { gte: yesterday, lt: today },
        },
      });

      const falsePositives = await this.prisma.alert.count({
        where: {
          verdict: 'false_positive',
          createdAt: { gte: yesterday, lt: today },
        },
      });

      this.logger.log(
        `Daily report: ${alerts} alerts, ${truePositives} TP, ${falsePositives} FP`,
      );

      // In production, would email report to managers
    } catch (error) {
      this.logger.error('Daily report generation failed', error);
    }
  }

  // Deduplicate similar alerts every 10 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async deduplicateAlerts() {
    this.logger.log('Deduplicating alerts...');
    try {
      const recentAlerts = await this.prisma.alert.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 600000) }, // Last 10 min
          status: 'new',
        },
        orderBy: { alertTime: 'desc' },
      });

      // Group by source + name + asset
      const groups = new Map<string, any[]>();
      for (const alert of recentAlerts) {
        const key = `${alert.source}:${alert.name}:${alert.assetId}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)?.push(alert);
      }

      // Mark duplicates as archived
      let deduped = 0;
      for (const [_, alerts] of groups) {
        if (alerts.length > 1) {
          const keep = alerts[0];
          const dups = alerts.slice(1);
          for (const dup of dups) {
            await this.prisma.alert.update({
              where: { id: dup.id },
              data: { status: 'archived' },
            });
            deduped++;
          }
        }
      }

      this.logger.log(`Deduplicated ${deduped} alerts`);
    } catch (error) {
      this.logger.error('Deduplication failed', error);
    }
  }

  // Check log source health every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkLogSourceHealth() {
    this.logger.log('Checking log source health...');
    try {
      const sources = await this.prisma.integration.findMany();

      for (const source of sources) {
        const lastSync = source.lastSyncAt
          ? new Date(source.lastSyncAt)
          : new Date(0);
        const minutesSinceSync = (Date.now() - lastSync.getTime()) / 60000;

        // If no sync in 30 minutes, mark as disconnected
        if (minutesSinceSync > 30 && source.status === 'active') {
          await this.prisma.integration.update({
            where: { id: source.id },
            data: {
              status: 'error',
              lastError: 'No data received in 30 minutes',
            },
          });

          this.logger.warn(`Log source ${source.name} marked disconnected`);
        }
      }

      this.logger.log('Log source health check completed');
    } catch (error) {
      this.logger.error('Health check failed', error);
    }
  }

  // Cleanup old audit logs monthly
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldAuditLogs() {
    this.logger.log('Cleaning up old audit logs...');
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deleted = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      this.logger.log(`Deleted ${deleted.count} old audit logs`);
    } catch (error) {
      this.logger.error('Audit log cleanup failed', error);
    }
  }

  // Archive old closed alerts monthly
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async archiveOldAlerts() {
    this.logger.log('Archiving old alerts...');
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const updated = await this.prisma.alert.updateMany({
        where: {
          status: 'closed',
          updatedAt: { lt: sixtyDaysAgo },
        },
        data: {
          status: 'archived',
        },
      });

      this.logger.log(`Archived ${updated.count} old closed alerts`);
    } catch (error) {
      this.logger.error('Alert archive failed', error);
    }
  }
}
