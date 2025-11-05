import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { UserRole } from '../common/guards/admin.guard';

export interface AdminStats {
  total_users: number;
  active_users: number;
  trial_users: number;
  paid_users: number;
  total_bots: number;
  active_bots: number;
  chats_today: number;
  messages_today: number;
  signups_this_week: number;
  signups_this_month: number;
}

export interface UserSummary {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: UserRole;
  subscription_tier: string;
  subscription_status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  total_bots: number;
  total_chats: number;
  conversations_this_month: number;
  whatsapp_messages_this_month: number;
}

export interface PromoteUserDto {
  userId: string;
  newRole: UserRole;
}

export interface AdminAuditLog {
  action: string;
  targetUserId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get system-wide statistics
   * Only accessible by admins and super_admins
   */
  async getSystemStats(): Promise<AdminStats> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('admin_system_stats')
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException('Failed to fetch system stats');
    }

    return data;
  }

  /**
   * Get all users with their summary information
   * Only accessible by admins and super_admins
   */
  async getAllUsers(
    limit: number = 50,
    offset: number = 0,
    searchTerm?: string,
  ): Promise<{ users: UserSummary[]; total: number }> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('admin_users_summary')
      .select('*', { count: 'exact' });

    // Add search filter if provided
    if (searchTerm) {
      query = query.or(
        `email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`,
      );
    }

    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch users');
    }

    return {
      users: data || [],
      total: count || 0,
    };
  }

  /**
   * Get a single user's detailed information
   * Only accessible by admins and super_admins
   */
  async getUserDetails(userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    // Get user's bots
    const { data: bots } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', userId);

    // Get user's usage this month
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('tracking_month', new Date().getMonth() + 1)
      .eq('tracking_year', new Date().getFullYear())
      .single();

    // Get recent chats
    const { data: recentChats } = await supabase
      .from('chats')
      .select('*, bots(name)')
      .in('bot_id', bots?.map(b => b.id) || [])
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      user,
      bots: bots || [],
      usage: usage || null,
      recentChats: recentChats || [],
    };
  }

  /**
   * Promote or demote a user to a different role
   * Only accessible by super_admins
   */
  async promoteUser(
    promoteDto: PromoteUserDto,
    adminId: string,
  ): Promise<{ success: boolean; message: string }> {
    const supabase = this.supabaseService.getClient();

    // Validate role
    if (!Object.values(UserRole).includes(promoteDto.newRole)) {
      throw new BadRequestException('Invalid role');
    }

    // Call the database function
    const { data, error } = await supabase.rpc('promote_user_to_admin', {
      target_user_id: promoteDto.userId,
      new_role: promoteDto.newRole,
    });

    if (error) {
      throw new BadRequestException('Failed to update user role: ' + error.message);
    }

    if (!data.success) {
      throw new BadRequestException(data.error || 'Failed to update user role');
    }

    // Log the action
    await this.logAdminAction({
      action: 'ROLE_CHANGE',
      targetUserId: promoteDto.userId,
      details: {
        newRole: promoteDto.newRole,
        adminId,
      },
    });

    return {
      success: true,
      message: data.message,
    };
  }

  /**
   * Toggle user active status
   * Only accessible by admins and super_admins
   */
  async toggleUserStatus(
    userId: string,
    adminId: string,
  ): Promise<{ success: boolean; isActive: boolean }> {
    const supabase = this.supabaseService.getClient();

    // Get current status
    const { data: user } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Toggle status
    const newStatus = !user.is_active;
    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (error) {
      throw new BadRequestException('Failed to update user status');
    }

    // Log the action
    await this.logAdminAction({
      action: newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetUserId: userId,
      details: { adminId },
    });

    return {
      success: true,
      isActive: newStatus,
    };
  }

  /**
   * Get admin audit logs
   * Only accessible by admins and super_admins
   */
  async getAuditLogs(
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ logs: any[]; total: number }> {
    const supabase = this.supabaseService.getClient();

    const { data, error, count } = await supabase
      .from('admin_audit_log')
      .select('*, admin:admin_id(email, full_name), target:target_user_id(email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch audit logs');
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  }

  /**
   * Log an admin action
   * Internal method
   */
  private async logAdminAction(log: AdminAuditLog): Promise<void> {
    const supabase = this.supabaseService.getClient();

    await supabase.from('admin_audit_log').insert({
      admin_id: log.details?.adminId,
      action: log.action,
      target_user_id: log.targetUserId,
      details: log.details,
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
    });
  }
}

