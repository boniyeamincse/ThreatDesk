import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  // Users endpoints
  @Get('users')
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.usersService.findAll(parseInt(skip || '0'), parseInt(take || '20'));
  }

  @Get('users/:id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('users')
  async create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Patch('users/:id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete('users/:id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('users/:id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Post('users/:id/activate')
  async activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Post('users/:id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  // Roles endpoints
  @Get('roles')
  async findAllRoles() {
    return this.rolesService.findAll();
  }

  @Get('roles/:id')
  async findOneRole(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post('roles')
  async createRole(@Body() data: any) {
    return this.rolesService.create(data);
  }

  @Patch('roles/:id')
  async updateRole(@Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(id, data);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  // Permissions endpoints
  @Get('permissions')
  async findAllPermissions() {
    return this.permissionsService.findAll();
  }

  @Post('permissions')
  async createPermission(@Body() data: any) {
    return this.permissionsService.create(data);
  }

  @Get('roles/:roleId/permissions')
  async getRolePermissions(@Param('roleId') roleId: string) {
    return this.rolesService.getPermissions(roleId);
  }

  @Post('roles/:roleId/permissions')
  async addRolePermissions(@Param('roleId') roleId: string, @Body() data: { permissionIds: string[] }) {
    return this.rolesService.addPermissionsToRole(roleId, data.permissionIds);
  }

  @Put('roles/:roleId/permissions')
  async setRolePermissions(@Param('roleId') roleId: string, @Body() data: { permissionIds: string[] }) {
    return this.rolesService.setPermissionsForRole(roleId, data.permissionIds);
  }
}
