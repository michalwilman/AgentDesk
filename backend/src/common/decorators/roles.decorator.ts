import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../guards/admin.guard';

/**
 * Roles Decorator - Specify which roles can access a route
 * 
 * Usage:
 * @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 * @UseGuards(AdminGuard)
 * async getAdminData() { ... }
 * 
 * This will allow only users with 'admin' or 'super_admin' roles
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

