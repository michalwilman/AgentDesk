import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService, PromoteUserDto } from './admin.service';
import { AdminGuard, UserRole } from '../common/guards/admin.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

/**
 * Admin Controller - All routes are protected by AdminGuard
 * Only users with 'admin' or 'super_admin' roles can access these endpoints
 */
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats
   * Get system-wide statistics
   * Accessible by: admin, super_admin
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  /**
   * GET /admin/users
   * Get all users with pagination and search
   * Accessible by: admin, super_admin
   * 
   * Query params:
   * - limit: number (default: 50)
   * - offset: number (default: 0)
   * - search: string (optional)
   */
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllUsers(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(limit, offset, search);
  }

  /**
   * GET /admin/users/:id
   * Get detailed information about a specific user
   * Accessible by: admin, super_admin
   */
  @Get('users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUserDetails(@Param('id') userId: string) {
    return this.adminService.getUserDetails(userId);
  }

  /**
   * POST /admin/users/:id/promote
   * Promote or demote a user to a different role
   * Accessible by: super_admin only
   * 
   * Body:
   * - newRole: 'user' | 'admin' | 'super_admin'
   */
  @Post('users/:id/promote')
  @Roles(UserRole.SUPER_ADMIN)
  async promoteUser(
    @Param('id') userId: string,
    @Body('newRole') newRole: UserRole,
    @Req() req: any,
  ) {
    return this.adminService.promoteUser(
      { userId, newRole },
      req.user.id,
    );
  }

  /**
   * POST /admin/users/:id/toggle-status
   * Toggle user active/inactive status
   * Accessible by: admin, super_admin
   */
  @Post('users/:id/toggle-status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async toggleUserStatus(
    @Param('id') userId: string,
    @Req() req: any,
  ) {
    return this.adminService.toggleUserStatus(userId, req.user.id);
  }

  /**
   * GET /admin/audit-logs
   * Get admin audit logs
   * Accessible by: admin, super_admin
   * 
   * Query params:
   * - limit: number (default: 100)
   * - offset: number (default: 0)
   */
  @Get('audit-logs')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAuditLogs(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getAuditLogs(limit, offset);
  }

  /**
   * GET /admin/bots
   * Get all bots in the system with owner information
   * Accessible by: admin, super_admin
   * 
   * Query params:
   * - limit: number (default: 50)
   * - offset: number (default: 0)
   * - search: string (optional)
   */
  @Get('bots')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllBots(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllBots(limit, offset, search);
  }
}

