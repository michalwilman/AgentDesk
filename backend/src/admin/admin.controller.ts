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
  NotFoundException,
} from '@nestjs/common';
import { AdminService, PromoteUserDto } from './admin.service';
import { AdminGuard, UserRole } from '../common/guards/admin.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsageTrackingService } from '../actions/integrations/usage-tracking.service';

/**
 * Admin Controller - All routes are protected by AdminGuard
 * Only users with 'admin' or 'super_admin' roles can access these endpoints
 */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usageTrackingService: UsageTrackingService,
  ) {}

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

  /**
   * GET /admin/users/pending-deletion
   * Get all users pending deletion (soft-deleted)
   * Accessible by: admin, super_admin
   */
  @Get('users/pending-deletion')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUsersPendingDeletion() {
    return this.adminService.getUsersPendingDeletion();
  }

  /**
   * POST /admin/users/:id/restore
   * Restore a soft-deleted user
   * Accessible by: super_admin only
   */
  @Post('users/:id/restore')
  @Roles(UserRole.SUPER_ADMIN)
  async restoreUser(@Param('id') userId: string, @Req() req: any) {
    // Get user email from user ID
    const supabase = this.adminService['supabaseService'].getClient();
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.adminService.restoreUser(user.email, req.user.id);
  }

  /**
   * POST /admin/users/:id/mark-for-deletion
   * Mark a user for deletion (soft delete)
   * Accessible by: super_admin only
   */
  @Post('users/:id/mark-for-deletion')
  @Roles(UserRole.SUPER_ADMIN)
  async markUserForDeletion(@Param('id') userId: string, @Req() req: any) {
    await this.adminService.markUserForDeletion(userId, req.user.id);
    return { message: 'User marked for deletion successfully' };
  }

  /**
   * GET /admin/deletion-stats
   * Get deletion statistics
   * Accessible by: admin, super_admin
   */
  @Get('deletion-stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getDeletionStats() {
    return this.adminService.getDeletionStats();
  }

  /**
   * GET /admin/usage-stats
   * Get message usage statistics across all customers
   * Accessible by: admin, super_admin
   * 
   * Query params:
   * - month: string (YYYY-MM-DD format, first day of month)
   * - plan_type: string (starter, pro, enterprise)
   */
  @Get('usage-stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUsageStats(
    @Query('month') month?: string,
    @Query('plan_type') planType?: string,
  ) {
    const usageData = await this.usageTrackingService.getUsageStats(month, planType);
    
    // Calculate totals and costs
    let totalSMS = 0;
    let totalWhatsApp = 0;
    let totalEmail = 0;
    let estimatedCost = 0;

    const SMS_COST = 0.08; // USD per SMS to Israel
    const WHATSAPP_COST = 0.005; // USD per WhatsApp message

    usageData.forEach((usage: any) => {
      totalSMS += usage.sms_sent || 0;
      totalWhatsApp += usage.whatsapp_sent || 0;
      totalEmail += usage.email_sent || 0;
      
      // Calculate estimated cost
      estimatedCost += (usage.sms_sent || 0) * SMS_COST;
      estimatedCost += (usage.whatsapp_sent || 0) * WHATSAPP_COST;
    });

    return {
      summary: {
        totalSMS,
        totalWhatsApp,
        totalEmail,
        estimatedCostUSD: estimatedCost.toFixed(2),
        estimatedCostILS: (estimatedCost * 3.7).toFixed(2), // Approximate ILS conversion
        totalCustomers: usageData.length,
      },
      details: usageData.map((usage: any) => ({
        userId: usage.user_id,
        userEmail: usage.users?.email,
        userName: usage.users?.full_name,
        planType: usage.users?.plan_type,
        botId: usage.bot_id,
        botName: usage.bots?.name,
        month: usage.month,
        sms: usage.sms_sent || 0,
        whatsapp: usage.whatsapp_sent || 0,
        email: usage.email_sent || 0,
        smsLimit: usage.sms_limit,
        whatsappLimit: usage.whatsapp_limit,
        costUSD: ((usage.sms_sent || 0) * SMS_COST + (usage.whatsapp_sent || 0) * WHATSAPP_COST).toFixed(2),
      })),
    };
  }
}

