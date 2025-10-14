import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);
    const profile = await this.authService.getUserProfile(user.id);

    return {
      user,
      profile,
    };
  }

  @Post('profile')
  async createProfile(
    @Headers('authorization') authorization: string,
    @Body() body: { full_name?: string; company_name?: string },
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateUser(token);

    const profile = await this.authService.createUserProfile({
      id: user.id,
      email: user.email,
      full_name: body.full_name,
      company_name: body.company_name,
    });

    return profile;
  }
}

