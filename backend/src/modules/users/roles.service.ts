import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true, users: true },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: { name: string; description?: string; permissions?: string[] }) {
    const existing = await this.prisma.role.findFirst({
      where: { name: data.name },
    });

    if (existing) throw new ConflictException('Role with this name already exists');

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: { permissions: true },
    });

    if (data.permissions && data.permissions.length > 0) {
      await this.addPermissionsToRole(role.id, data.permissions);
    }

    return role;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findOne(id);

    if (data.name) {
      const existing = await this.prisma.role.findFirst({
        where: { name: data.name, id: { not: id } },
      });
      if (existing) throw new ConflictException('Role with this name already exists');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: { permissions: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    const userCount = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException('Cannot delete role with active users');
    }

    return this.prisma.role.delete({ where: { id } });
  }

  async getPermissions(roleId: string) {
    await this.findOne(roleId);
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });
    return role?.permissions || [];
  }

  async addPermissionsToRole(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId);

    for (const permId of permissionIds) {
      const perm = await this.prisma.permission.findUnique({
        where: { id: permId },
      });
      if (!perm) throw new NotFoundException(`Permission ${permId} not found`);
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  async setPermissionsForRole(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId);

    for (const permId of permissionIds) {
      const perm = await this.prisma.permission.findUnique({
        where: { id: permId },
      });
      if (!perm) throw new NotFoundException(`Permission ${permId} not found`);
    }

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }
}
