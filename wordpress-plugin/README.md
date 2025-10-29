# AgentDesk AI Chatbot - WordPress Plugin

![AgentDesk](https://agentdesk.com/images/logo.png)

Add intelligent AI chatbot to your WordPress site. Powered by GPT-4, trained on your content.

[![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-blue)](https://wordpress.org)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple)](https://php.net)
[![License](https://img.shields.io/badge/License-GPLv2-green)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)](https://wordpress.org/plugins/agentdesk-chatbot)

---

## 🚀 Features

- **Smart AI Chatbot** - Powered by OpenAI GPT-4o-mini
- **RAG Technology** - Advanced Retrieval-Augmented Generation
- **Train on Your Content** - Website crawling, document upload
- **Multi-Channel** - Web, WhatsApp, Telegram
- **Zero Code** - Setup in 2 minutes
- **Fully Customizable** - Colors, personality, position
- **Analytics** - Track conversations and satisfaction
- **Multi-language** - 30+ languages supported
- **Mobile Responsive** - Perfect on all devices

---

## 📦 Installation

### Quick Install

1. **Download** the plugin ZIP from [WordPress.org](https://wordpress.org/plugins/agentdesk-chatbot)
2. **Upload** via WordPress Admin → Plugins → Add New → Upload
3. **Activate** the plugin
4. **Configure** at Settings → AgentDesk
5. **Done!** Widget appears on your site

### Detailed Installation

See [INSTALLATION.md](INSTALLATION.md) for complete guide.

---

## ⚙️ Configuration

### 1. Create AgentDesk Account

Visit [AgentDesk.com](https://agentdesk.com/register?utm_source=wordpress) and sign up for free.

### 2. Create Your Bot

1. Click "Create Bot"
2. Choose name and personality
3. Add knowledge (website URL, documents, FAQs)
4. Generate embeddings

### 3. Get API Token

Go to Bot Settings → API Token → Copy

### 4. Configure WordPress

1. Go to Settings → AgentDesk
2. Paste API Token
3. Choose position and display rules
4. Save settings

---

## 🎨 Customization

### Widget Appearance

Customize in AgentDesk dashboard:
- **Colors** - Primary color, text colors
- **Avatar** - Upload bot logo
- **Messages** - Welcome message, personality
- **Language** - Choose from 30+ languages

### Display Rules

Choose where to show the widget:
- All pages (default)
- Homepage only
- Posts only
- Pages only
- Custom page IDs (coming soon)

### Advanced CSS

Add custom styles to your theme:

```css
/* Adjust widget position */
#agentdesk-widget {
    bottom: 20px;
    right: 20px;
}

/* Change widget size */
#agentdesk-widget .widget-container {
    width: 400px;
    height: 600px;
}
```

---

## 🔧 Development

### File Structure

```
agentdesk-chatbot/
├── agentdesk-chatbot.php       # Main plugin file
├── readme.txt                   # WordPress.org readme
├── INSTALLATION.md              # Installation guide
├── includes/
│   ├── class-agentdesk-admin.php   # Admin panel
│   ├── class-agentdesk-widget.php  # Widget embedding
│   └── class-agentdesk-api.php     # API communication
├── assets/
│   ├── css/admin-styles.css     # Admin styles
│   ├── js/admin-scripts.js      # Admin scripts
│   └── images/                  # Plugin images
└── languages/
    ├── agentdesk-chatbot.pot    # Translation template
    └── agentdesk-chatbot-he_IL.po # Hebrew translation
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/agentdesk/wordpress-plugin.git
cd wordpress-plugin

# Install dependencies (if any)
# npm install  # Not required for v1.0

# Package plugin
chmod +x package.sh
./package.sh

# Output: dist/agentdesk-chatbot-1.0.0.zip
```

### Testing

```bash
# Install on local WordPress
wp plugin install dist/agentdesk-chatbot-1.0.0.zip --activate

# Or manually
unzip dist/agentdesk-chatbot-1.0.0.zip
mv agentdesk-chatbot /path/to/wordpress/wp-content/plugins/
wp plugin activate agentdesk-chatbot
```

### Code Standards

- Follows [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- PHP CodeSniffer compatible
- Tested with WordPress 5.8 - 6.4
- Tested with PHP 7.4 - 8.2

---

## 📚 Documentation

- **User Guide**: [INSTALLATION.md](INSTALLATION.md)
- **API Docs**: [https://agentdesk.com/docs/api](https://agentdesk.com/docs/api)
- **Video Tutorials**: [YouTube](https://youtube.com/@agentdesk)
- **Knowledge Base**: [https://agentdesk.com/docs](https://agentdesk.com/docs)

---

## 🐛 Bug Reports & Feature Requests

### Report Bugs

- **WordPress.org**: [Support Forum](https://wordpress.org/support/plugin/agentdesk-chatbot)
- **GitHub**: [Issues](https://github.com/agentdesk/wordpress-plugin/issues)
- **Email**: support@agentdesk.com

### Request Features

Submit feature requests via:
- [GitHub Discussions](https://github.com/agentdesk/wordpress-plugin/discussions)
- [AgentDesk Feedback](https://agentdesk.com/feedback)

---

## 🤝 Contributing

We welcome contributions!

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines

- Follow WordPress coding standards
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📝 Changelog

### Version 1.0.0 (2025-10-28)

**Initial Release**

- ✅ Core plugin functionality
- ✅ API token authentication
- ✅ Automatic widget embedding
- ✅ Admin settings panel
- ✅ Position control (bottom-right/left)
- ✅ Display rules (all/homepage/posts/pages)
- ✅ Enable/disable toggle
- ✅ Hebrew translation
- ✅ Security features
- ✅ WordPress 5.8+ compatibility
- ✅ PHP 7.4+ compatibility

---

## 📄 License

This plugin is licensed under the GPLv2 (or later).

```
AgentDesk AI Chatbot WordPress Plugin
Copyright (C) 2025 AgentDesk

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
```

Full license: [LICENSE](LICENSE)

---

## 🌟 Credits

### Built With

- [WordPress](https://wordpress.org) - CMS Platform
- [OpenAI GPT-4](https://openai.com) - AI Model
- [PHP](https://php.net) - Backend Language
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Frontend Logic

### Maintainers

- **AgentDesk Team** - [GitHub](https://github.com/agentdesk)

### Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for full list.

---

## 💬 Support

### Free Support

- **Forum**: [WordPress.org Support](https://wordpress.org/support/plugin/agentdesk-chatbot)
- **Docs**: [AgentDesk Documentation](https://agentdesk.com/docs)
- **Videos**: [YouTube Tutorials](https://youtube.com/@agentdesk)

### Premium Support

- **Email**: support@agentdesk.com (paid plans)
- **Live Chat**: [AgentDesk.com](https://agentdesk.com)
- **Phone**: Business/Enterprise plans

---

## 🔗 Links

- **Website**: [https://agentdesk.com](https://agentdesk.com)
- **WordPress Plugin**: [https://wordpress.org/plugins/agentdesk-chatbot](https://wordpress.org/plugins/agentdesk-chatbot)
- **Documentation**: [https://agentdesk.com/docs](https://agentdesk.com/docs)
- **API Docs**: [https://agentdesk.com/docs/api](https://agentdesk.com/docs/api)
- **GitHub**: [https://github.com/agentdesk](https://github.com/agentdesk)
- **Twitter**: [@AgentDeskAI](https://twitter.com/agentdeskai)
- **LinkedIn**: [AgentDesk](https://linkedin.com/company/agentdesk)

---

## ⭐ Show Your Support

If you find this plugin useful, please:
- ⭐ Star this repository
- 🌟 Rate on [WordPress.org](https://wordpress.org/support/plugin/agentdesk-chatbot/reviews/)
- 📣 Share on social media
- 🤝 Contribute to development

---

**Made with ❤️ by the AgentDesk Team**

[Get Started](https://agentdesk.com/register?utm_source=github) | [View Demo](https://demo.agentdesk.com) | [Contact Us](https://agentdesk.com/contact)

