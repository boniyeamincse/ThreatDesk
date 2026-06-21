import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        department: true,
        role: { select: { name: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        department: true,
      },
    });

    return user;
  }

  async getUserPreferences(userId: string) {
    let prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.userPreferences.create({
        data: { userId },
      });
    }

    return prefs;
  }

  async updateUserPreferences(
    userId: string,
    data: {
      emailAlerts?: boolean;
      emailSeverity?: string[];
      slackAlerts?: boolean;
      slackWebhook?: string;
      dailySummary?: boolean;
    },
  ) {
    let prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.userPreferences.create({
        data: { userId },
      });
    }

    return this.prisma.userPreferences.update({
      where: { userId },
      data,
    });
  }

  async updatePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated' };
  }

  async enableMfa(userId: string) {
    const secret = crypto.randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, message: 'MFA enabled. Save this secret safely.' };
  }

  async disableMfa(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
    });

    return { message: 'MFA disabled' };
  }

  async getApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  async generateApiKey(userId: string, name: string) {
    const key = crypto.randomBytes(32).toString('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        key: await bcrypt.hash(key, 10),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      ...apiKey,
      key,
      message: 'API key created. Save it now — you cannot view it again.',
    };
  }

  async revokeApiKey(userId: string, keyId: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== userId) {
      throw new ForbiddenException('Cannot revoke this API key');
    }

    await this.prisma.apiKey.delete({ where: { id: keyId } });
    return { message: 'API key revoked' };
  }

  async listUsers(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role.name !== 'Admin') {
      throw new ForbiddenException('Only admins can list users');
    }

    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(userId: string, data: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!requester || requester.role.name !== 'Admin') {
      throw new ForbiddenException('Only admins can create users');
    }

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
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: { select: { name: true } },
      },
    });
  }

  async deleteUser(userId: string, targetUserId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!requester || requester.role.name !== 'Admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    if (userId === targetUserId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    await this.prisma.user.delete({ where: { id: targetUserId } });
    return { message: 'User deleted' };
  }
}
