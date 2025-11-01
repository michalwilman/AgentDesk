import { Controller, Get, Query } from '@nestjs/common';
import { WordpressService } from './wordpress.service';

@Controller('wordpress')
export class WordpressController {
  constructor(private wordpressService: WordpressService) {}

  /**
   * WordPress plugin update check endpoint
   * Called by WordPress sites to check for updates
   */
  @Get('plugin-update')
  async getPluginUpdate(
    @Query('version') currentVersion?: string,
    @Query('slug') slug?: string,
  ) {
    const updateInfo = this.wordpressService.getPluginUpdate();
    
    // Only return update if there's a newer version
    if (currentVersion && this.compareVersions(updateInfo.version, currentVersion) <= 0) {
      return { update_available: false };
    }

    return {
      update_available: true,
      ...updateInfo,
    };
  }

  /**
   * Get plugin information
   */
  @Get('plugin-info')
  async getPluginInfo() {
    return this.wordpressService.getPluginInfo();
  }

  /**
   * Compare version numbers
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }
}

