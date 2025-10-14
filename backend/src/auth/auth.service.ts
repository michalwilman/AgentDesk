import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async validateUser(accessToken: string) {
    const supabase = this.supabaseService.getClient();

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Check if user profile exists in users table
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // Create profile if it doesn't exist
    if (!existingProfile) {
      const userData = user.user_metadata || {};
      await supabase.from('users').insert([
        {
          id: user.id,
          email: user.email,
          full_name: userData.full_name || '',
          company_name: userData.company_name || '',
        },
      ]);
    }

    return user;
  }

  async getUserProfile(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  async createUserProfile(userData: {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
  }) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  }
}

