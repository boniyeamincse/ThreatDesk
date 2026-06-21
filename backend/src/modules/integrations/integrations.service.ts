import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as https from 'https';
import * as http from 'http';

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

  async getWazuhConfig() {
    const integration = await this.prisma.integration.findFirst({
      where: { type: 'wazuh' },
    });

    if (!integration) {
      return null;
    }

    const config = integration.config as any;
    return {
      apiUrl: config.apiUrl || '',
      user: config.user || '',
      password: config.password || '', // Note: in production, should not return password
    };
  }

  async saveWazuhConfig(data: any) {
    const { apiUrl, user, password } = data;

    if (!apiUrl || !user || !password) {
      throw new BadRequestException('API URL, username, and password are required');
    }

    let integration = await this.prisma.integration.findFirst({
      where: { type: 'wazuh' },
    });

    if (integration) {
      return this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          config: { apiUrl, user, password },
          status: 'inactive',
        },
      });
    } else {
      return this.prisma.integration.create({
        data: {
          name: 'Wazuh',
          type: 'wazuh',
          config: { apiUrl, user, password },
          status: 'inactive',
        },
      });
    }
  }

  async testWazuh(apiUrl: string, user: string, password: string) {
    try {
      if (!apiUrl || !user || !password) {
        return { success: false, message: 'All fields are required' };
      }

      const url = new URL('/api/agents', apiUrl);
      const credentials = Buffer.from(`${user}:${password}`).toString('base64');

      return new Promise((resolve) => {
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'GET',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          rejectUnauthorized: false,
        };

        const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
          if (res.statusCode === 200 || res.statusCode === 401) {
            if (res.statusCode === 401) {
              resolve({ success: false, message: 'Invalid credentials' });
            } else {
              resolve({ success: true, message: 'Wazuh connection successful' });
            }
          } else {
            resolve({
              success: false,
              message: `Wazuh API returned status ${res.statusCode}`,
            });
          }
        });

        req.on('error', (error: any) => {
          resolve({
            success: false,
            message: `Connection failed: ${error.message}`,
          });
        });

        req.setTimeout(5000);
        req.end();
      });
    } catch (error: any) {
      return { success: false, message: error?.message || 'Unknown error' };
    }
  }
}
