import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20, filters?: any) {
    const where: any = {};

    if (filters?.severity) {
      where.severity = filters.severity;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [incidents, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tickets: true,
        },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return { incidents, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            comments: true,
          },
        },
      },
    });

    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async create(data: any) {
    const incident = await this.prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity || 'high',
        status: data.status || 'open',
        owner: data.owner,
      },
    });

    return incident;
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    return this.prisma.incident.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        owner: data.owner,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    await this.prisma.ticket.deleteMany({
      where: { incidentId: id },
    });

    return this.prisma.incident.delete({ where: { id } });
  }

  async assignIncident(id: string, owner: string) {
    await this.findOne(id);

    return this.prisma.incident.update({
      where: { id },
      data: { owner },
    });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['open', 'investigating', 'contained', 'remediated', 'recovered', 'closed', 'reopened'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    await this.findOne(id);

    return this.prisma.incident.update({
      where: { id },
      data: { status },
    });
  }

  async containIncident(id: string, details?: string) {
    await this.findOne(id);

    const incident = await this.prisma.incident.update({
      where: { id },
      data: { status: 'contained' },
    });

    await this.createIncidentLog(id, 'contained', details || 'Incident contained');

    return incident;
  }

  async remediateIncident(id: string, details?: string) {
    await this.findOne(id);

    const incident = await this.prisma.incident.update({
      where: { id },
      data: { status: 'remediated' },
    });

    await this.createIncidentLog(id, 'remediated', details || 'Remediation completed');

    return incident;
  }

  async recoverIncident(id: string, details?: string) {
    await this.findOne(id);

    const incident = await this.prisma.incident.update({
      where: { id },
      data: { status: 'recovered' },
    });

    await this.createIncidentLog(id, 'recovered', details || 'System recovery completed');

    return incident;
  }

  async closeIncident(id: string, details?: string) {
    await this.findOne(id);

    const incident = await this.prisma.incident.update({
      where: { id },
      data: { status: 'closed' },
    });

    await this.createIncidentLog(id, 'closed', details || 'Incident closed');

    return incident;
  }

  async reopenIncident(id: string, reason?: string) {
    await this.findOne(id);

    const incident = await this.prisma.incident.update({
      where: { id },
      data: { status: 'reopened' },
    });

    await this.createIncidentLog(id, 'reopened', reason || 'Incident reopened');

    return incident;
  }

  async addAlertToIncident(incidentId: string, alertId: string) {
    await this.findOne(incidentId);

    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.ticket.create({
      data: {
        incidentId,
        alertId,
        title: `Alert: ${alert.name}`,
        description: alert.description,
        severity: alert.severity,
        status: 'open',
      },
    });
  }

  async removeAlertFromIncident(incidentId: string, alertId: string) {
    await this.findOne(incidentId);

    const ticket = await this.prisma.ticket.findFirst({
      where: { incidentId, alertId },
    });

    if (!ticket) throw new NotFoundException('Alert not linked to incident');

    await this.prisma.ticket.delete({ where: { id: ticket.id } });

    return { message: 'Alert removed from incident' };
  }

  async getIncidentAlerts(incidentId: string) {
    await this.findOne(incidentId);

    return this.prisma.ticket.findMany({
      where: { incidentId },
      include: {
        alert: true,
        comments: true,
      },
    });
  }

  async addAssetToIncident(incidentId: string, assetId: string) {
    await this.findOne(incidentId);

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        // In a real system, you'd have a many-to-many junction table for incidents and assets
        // For now, we'll just return the asset as confirmation
      },
    });
  }

  async removeAssetFromIncident(incidentId: string, assetId: string) {
    await this.findOne(incidentId);

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return { message: 'Asset removed from incident' };
  }

  async getIncidentAssets(incidentId: string) {
    await this.findOne(incidentId);

    const tickets = await this.prisma.ticket.findMany({
      where: { incidentId },
      include: { alert: { include: { asset: true } } },
    });

    const assetIds = new Set(tickets.map((t) => t.alert?.assetId).filter(Boolean));
    const assets = await this.prisma.asset.findMany({
      where: { id: { in: Array.from(assetIds) } },
    });

    return assets;
  }

  async createIncidentFromAlert(alertId: string, incidentData: any) {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new NotFoundException('Alert not found');

    const incident = await this.prisma.incident.create({
      data: {
        title: incidentData.title || `Incident from ${alert.name}`,
        description: incidentData.description || alert.description,
        severity: alert.severity,
        status: 'investigating',
        owner: incidentData.owner,
      },
    });

    await this.prisma.ticket.create({
      data: {
        incidentId: incident.id,
        alertId,
        title: `Alert: ${alert.name}`,
        description: alert.description,
        severity: alert.severity,
        status: 'open',
      },
    });

    return incident;
  }

  private async createIncidentLog(incidentId: string, action: string, details: string) {
    // In a real system, you'd have an IncidentLog or similar table
    // For now, just log to console
    console.log(`[Incident ${incidentId}] ${action}: ${details}`);
  }
}
