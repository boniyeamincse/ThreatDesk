import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total, page: skip / take, limit: take };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, preferences: true },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async create(data: any) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('User with this email already exists');

    const role = await this.prisma.role.findFirst({
      where: { name: data.role || 'L1 Analyst' },
    });

    if (!role) throw new BadRequestException('Role not found');

    const hashedPassword = await bcrypt.hash(data.password || 'TempPassword123!', 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        roleId: role.id,
        active: true,
      },
      include: { role: true },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    let roleId: string | undefined;
    if (data.role) {
      const role = await this.prisma.role.findFirst({
        where: { name: data.role },
      });
      if (!role) throw new BadRequestException('Role not found');
      roleId = role.id;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        roleId,
      },
      include: { role: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      include: { role: true },
    });
  }

  async activate(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { active: true },
      include: { role: true },
    });
  }

  async resetPassword(id: string) {
    await this.findOne(id);
    const tempPassword = crypto.randomBytes(8).toString('hex').toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password reset. Send temp password to user.',
      tempPassword,
    };
  }
}
