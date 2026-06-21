import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async create(data: { name: string; description?: string }) {
    const existing = await this.prisma.permission.findFirst({
      where: { name: data.name },
    });

    if (existing) throw new ConflictException('Permission with this name already exists');

    return this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findOne(id);

    if (data.name) {
      const existing = await this.prisma.permission.findFirst({
        where: { name: data.name, id: { not: id } },
      });
      if (existing) throw new ConflictException('Permission with this name already exists');
    }

    return this.prisma.permission.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.permission.delete({ where: { id } });
  }
}
