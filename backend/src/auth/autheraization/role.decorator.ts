
import { SetMetadata } from '@nestjs/common';
import { Role, RoleWithAdmin } from 'src/DTOs/DTOs';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleWithAdmin[]) => SetMetadata(ROLES_KEY, roles);
