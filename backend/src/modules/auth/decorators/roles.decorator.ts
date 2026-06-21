import { SetMetadata } from '@nestjs/common';

export const Roles = 'roles';

export const RequireRoles = (...roles: string[]) => SetMetadata(Roles, roles);
