import { Injectable } from '@nestjs/common';

@Injectable()
export class WordpressService {
  
  /**
   * Get current plugin version and update info
   */
  getPluginUpdate() {
    const currentVersion = process.env.WP_PLUGIN_VERSION || '1.2.7';
    
    return {
      name: 'AgentDesk AI Chatbot',
      slug: 'agentdesk-chatbot',
      version: currentVersion,
      download_url: `${process.env.FRONTEND_URL || 'https://agentdesk-frontend-production.up.railway.app'}/downloads/agentdesk-chatbot-v${currentVersion}.zip`,
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
      '1.2.7': `
        <h4>1.2.7 - Critical Hotfix (2025-11-06)</h4>
        <ul>
          <li>🔧 <strong>CRITICAL FIX: Resolved JavaScript syntax error that prevented widget from displaying</strong></li>
          <li>✅ Widget now loads correctly on all WordPress pages</li>
          <li>⚡ Immediate stability and performance fix</li>
        </ul>
      `,
      '1.2.6': `
        <h4>1.2.6 - Complete Dashboard Parity</h4>
        <ul>
          <li>🎯 <strong>Widget now perfectly mirrors Dashboard bot (1:1 sync)</strong></li>
          <li>✨ Multiple welcome messages with typing effect</li>
          <li>🎨 All UI behaviors match Dashboard exactly</li>
          <li>🔧 Fixed welcome message display logic</li>
          <li>💯 Complete feature parity with Dashboard widget</li>
          <li>🚀 Improved user experience and bot personality</li>
        </ul>
        
        <h4>1.2.5 - RTL & Dashboard Sync</h4>
        <ul>
          <li>🎯 <strong>CRITICAL FIX:</strong> Full RTL support for Hebrew</li>
          <li>🎯 <strong>Widget now perfectly mirrors Dashboard bot</strong></li>
          <li>🎨 Auto-detect Hebrew and apply RTL layout</li>
          <li>✍️ Hebrew input placeholder and text alignment</li>
          <li>🔄 Message bubbles properly aligned for RTL</li>
          <li>💯 1:1 match with Dashboard appearance and behavior</li>
        </ul>
        
        <h4>1.2.4 - Visual Consistency Fix</h4>
        <ul>
          <li>🎨 <strong>CRITICAL FIX:</strong> Bot bubble now uses correct color from Dashboard</li>
          <li>🎨 Fixed bubble color not syncing (was green, now uses your color)</li>
          <li>✨ Bubble and chat window now match perfectly</li>
          <li>🎯 Full visual consistency between Dashboard and website</li>
          <li>💎 Professional appearance across all states</li>
        </ul>
        
        <h4>1.2.3 - CRITICAL Bot Loading Fix</h4>
        <ul>
          <li>🔧 <strong>CRITICAL FIX:</strong> Fixed duplicate /api/api URL bug in widget</li>
          <li>🤖 <strong>CRITICAL FIX:</strong> Fixed bot not loading (pink bot issue)</li>
          <li>✅ Widget now correctly loads bot configuration</li>
          <li>🎨 Bot colors and name now display correctly</li>
          <li>⚡ Improved API communication reliability</li>
        </ul>
        
        <h4>1.2.2 - Enhanced Update Checker</h4>
        <ul>
          <li>✨ <strong>NEW:</strong> Manual update check button in plugins page</li>
          <li>📊 <strong>NEW:</strong> Update status display (Up to date / Update available)</li>
          <li>🔄 <strong>NEW:</strong> Real-time update checking with AJAX</li>
          <li>📝 <strong>NEW:</strong> Last checked timestamp</li>
          <li>💡 Enhanced: Better update notifications</li>
        </ul>
        
        <h4>1.2.1 - Critical Widget Fix</h4>
        <ul>
          <li>🔧 <strong>CRITICAL FIX:</strong> Resolved widget blocking page interactions</li>
          <li>🎯 Switched to standalone widget (no iframe) for better performance</li>
          <li>⚡ Improved widget loading and responsiveness</li>
          <li>🐛 Fixed Elementor compatibility issues</li>
          <li>✨ Enhanced page button functionality</li>
        </ul>
        
        <h4>1.2.0 - Enhanced Update System</h4>
        <ul>
          <li>🔄 One-click updates - Update plugin without deactivation</li>
          <li>🔐 Enhanced security and validation</li>
          <li>🌐 Improved multi-language support</li>
          <li>🚀 Performance optimizations</li>
          <li>✅ Full compatibility with WordPress 6.4+</li>
          <li>🔧 Bug fixes and improvements</li>
        </ul>
        
        <h4>1.1.0 - Auto-Update System</h4>
        <ul>
          <li>🚀 Automatic plugin updates</li>
          <li>💓 WordPress heartbeat integration</li>
          <li>🔄 One-click update from WordPress dashboard</li>
        </ul>
        
        <h4>1.0.0 - Initial Release</h4>
        <ul>
          <li>✨ AI Chatbot integration with GPT-4</li>
          <li>🎨 Customizable widget position and colors</li>
          <li>🌍 Multi-language support</li>
        </ul>
      `,
      '1.2.0': `
        <h4>1.2.0 - Enhanced Update System</h4>
        <ul>
          <li>🔄 One-click updates - Update plugin without deactivation</li>
          <li>🔐 Enhanced security and validation</li>
          <li>🌐 Improved multi-language support</li>
          <li>🚀 Performance optimizations</li>
          <li>✅ Full compatibility with WordPress 6.4+</li>
          <li>🔧 Bug fixes and improvements</li>
        </ul>
        
        <h4>1.1.0 - Auto-Update System</h4>
        <ul>
          <li>🚀 Automatic plugin updates</li>
          <li>💓 WordPress heartbeat integration</li>
          <li>🔄 One-click update from WordPress dashboard</li>
        </ul>
        
        <h4>1.0.0 - Initial Release</h4>
        <ul>
          <li>✨ AI Chatbot integration with GPT-4</li>
          <li>🎨 Customizable widget position and colors</li>
          <li>🌍 Multi-language support</li>
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
      version: process.env.WP_PLUGIN_VERSION || '1.2.7',
      author: 'AgentDesk',
      author_profile: 'https://agentdesk.com',
      homepage: 'https://agentdesk.com/wordpress-plugin',
      description: 'Add intelligent AI chatbot to your WordPress site. Trained on your content, powered by GPT-4.',
      short_description: 'AI Chatbot powered by GPT-4 for WordPress',
    };
  }
}

