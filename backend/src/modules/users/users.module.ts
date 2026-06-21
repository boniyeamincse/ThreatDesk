import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, RolesService, PermissionsService],
  controllers: [UsersController],
  exports: [UsersService, RolesService, PermissionsService],
})
export class UsersModule {}
