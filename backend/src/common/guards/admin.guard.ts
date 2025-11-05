import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../supabase.service';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * Admin Guard - Protects routes that require admin or super_admin access
 * 
 * Usage:
 * @UseGuards(AdminGuard)
 * @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 * 
 * This will ensure only users with admin or super_admin role can access the route
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get the authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const supabase = this.supabaseService.getClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific roles are required, just check if user is admin or super_admin
    const allowedRoles = requiredRoles || [UserRole.ADMIN, UserRole.SUPER_ADMIN];

    // Fetch the user's role from the database
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      throw new UnauthorizedException('User not found');
    }

    const userRole = userData.role as UserRole;

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Admin access required. Your role: ${userRole}, Required: ${allowedRoles.join(' or ')}`,
      );
    }

    // Add user and role to request for later use
    request.user = { ...user, role: userRole };

    return true;
  }
}

