import { Injectable } from '@nestjs/common';

@Injectable()
export class WordpressService {
  
  /**
   * Get current plugin version and update info
   */
  getPluginUpdate() {
    const currentVersion = process.env.WP_PLUGIN_VERSION || '1.0.0';
    
    return {
      name: 'AgentDesk AI Chatbot',
      slug: 'agentdesk-chatbot',
      version: currentVersion,
      download_url: `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/downloads/agentdesk-chatbot.zip`,
      requires: '5.8',
      requires_php: '7.4',
      tested: '6.4',
      last_updated: new Date().toISOString(),
      sections: {
        description: 'Add intelligent AI chatbot to your WordPress site. Trained on your content, powered by GPT-4.',
        changelog: this.getChangelog(currentVersion),
      },
      banners: {
        low: `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/images/banner-772x250.png`,
        high: `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/images/banner-1544x500.png`,
      },
      icons: {
        '1x': `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/images/icon-128x128.png`,
        '2x': `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/images/icon-256x256.png`,
      },
    };
  }

  /**
   * Get changelog for specific version
   */
  private getChangelog(version: string): string {
    const changelogs = {
      '1.0.0': `
        <h4>1.0.0 - Initial Release</h4>
        <ul>
          <li>✨ AI Chatbot integration with GPT-4</li>
          <li>🎨 Customizable widget position and colors</li>
          <li>🌍 Multi-language support (Hebrew & English)</li>
          <li>📊 Analytics and conversation tracking</li>
          <li>🔧 Easy bot token configuration</li>
          <li>✅ Real-time bot validation</li>
          <li>💬 Beautiful welcome messages</li>
        </ul>
      `,
      '1.1.0': `
        <h4>1.1.0 - Auto-Update System</h4>
        <ul>
          <li>🚀 Automatic plugin updates</li>
          <li>🔄 One-click update from WordPress dashboard</li>
          <li>✅ Settings preserved during updates</li>
          <li>📝 Changelog display in WordPress</li>
        </ul>
        
        <h4>1.0.0 - Initial Release</h4>
        <ul>
          <li>✨ AI Chatbot integration with GPT-4</li>
          <li>🎨 Customizable widget position and colors</li>
          <li>🌍 Multi-language support (Hebrew & English)</li>
        </ul>
      `,
    };

    return changelogs[version] || changelogs['1.0.0'];
  }

  /**
   * Get plugin info for WordPress
   */
  getPluginInfo() {
    return {
      name: 'AgentDesk AI Chatbot',
      slug: 'agentdesk-chatbot',
      version: process.env.WP_PLUGIN_VERSION || '1.0.0',
      author: 'AgentDesk',
      author_profile: 'https://agentdesk.com',
      homepage: 'https://agentdesk.com/wordpress-plugin',
      description: 'Add intelligent AI chatbot to your WordPress site. Trained on your content, powered by GPT-4.',
      short_description: 'AI Chatbot powered by GPT-4 for WordPress',
    };
  }
}

