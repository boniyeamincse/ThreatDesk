import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.settingsService.getUserProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() data: any) {
    return this.settingsService.updateUserProfile(req.user.id, data);
  }

  @Get('preferences')
  async getPreferences(@Request() req) {
    return this.settingsService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  async updatePreferences(@Request() req, @Body() data: any) {
    return this.settingsService.updateUserPreferences(req.user.id, data);
  }

  @Put('security/password')
  async updatePassword(
    @Request() req,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.settingsService.updatePassword(req.user.id, data);
  }

  @Post('security/mfa/enable')
  async enableMfa(@Request() req) {
    return this.settingsService.enableMfa(req.user.id);
  }

  @Post('security/mfa/disable')
  async disableMfa(@Request() req) {
    return this.settingsService.disableMfa(req.user.id);
  }

  @Get('api-keys')
  async getApiKeys(@Request() req) {
    return this.settingsService.getApiKeys(req.user.id);
  }

  @Post('api-keys')
  async generateApiKey(@Request() req, @Body() data: { name: string }) {
    return this.settingsService.generateApiKey(req.user.id, data.name);
  }

  @Delete('api-keys/:keyId')
  async revokeApiKey(@Request() req, @Param('keyId') keyId: string) {
    return this.settingsService.revokeApiKey(req.user.id, keyId);
  }

  @Get('users')
  async listUsers(@Request() req) {
    return this.settingsService.listUsers(req.user.id);
  }

  @Post('users')
  async createUser(@Request() req, @Body() data: any) {
    return this.settingsService.createUser(req.user.id, data);
  }

  @Delete('users/:userId')
  async deleteUser(@Request() req, @Param('userId') userId: string) {
    return this.settingsService.deleteUser(req.user.id, userId);
  }
}
