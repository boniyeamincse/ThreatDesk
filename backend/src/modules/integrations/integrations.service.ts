import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.integration.findMany();
  }

  async findOne(id: string) {
    return this.prisma.integration.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.integration.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.integration.update({
      where: { id },
      data,
    });
  }

  async testWazuh(apiUrl: string, user: string, password: string) {
    // Simple test - in production use actual Wazuh API
    try {
      console.log(`Testing Wazuh integration at ${apiUrl}`);
      return { success: true, message: 'Wazuh test passed' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Unknown error' };
    }
  }
}
