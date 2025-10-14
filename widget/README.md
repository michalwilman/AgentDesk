# AgentDesk Chat Widget

Embeddable AI chatbot widget for websites.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
npm run dev
```

Widget will be available at http://localhost:3002

### Build

```bash
npm run build
npm start
```

## 📦 Embedding the Widget

### Method 1: Script Tag (Recommended)

Add this code before the closing `</body>` tag:

```html
<script src="https://your-domain.com/widget.js" data-bot-token="bot_xxxxx"></script>
```

Replace `bot_xxxxx` with your actual bot API token from the dashboard.

### Method 2: Direct iframe

```html
<iframe 
  src="https://your-widget-domain.com?botToken=bot_xxxxx"
  style="position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; border: none; z-index: 999999; pointer-events: none;"
  allow="clipboard-read; clipboard-write"
></iframe>
```

## 🎨 Widget Features

### Visual Features
- Floating chat button (bottom-right)
- Expandable chat window
- Message history
- Typing indicator
- Smooth animations

### Functionality
- Real-time messaging
- Session management
- Message persistence
- Error handling
- Responsive design

## 🔧 Customization

Widget appearance can be customized through bot settings in the dashboard:

- **Primary Color**: Chat window header and user messages
- **Position**: Bottom-right or bottom-left
- **Welcome Message**: First message shown
- **Avatar**: Bot avatar image

## 📱 Responsive Design

Widget adapts to different screen sizes:

- **Desktop**: 384px width, 500px height
- **Mobile**: Full screen when opened
- **Tablet**: Optimized for touch interactions

## 🔌 API Integration

Widget communicates with backend via REST API:

```typescript
POST /api/chat/message
Headers:
  X-Bot-Token: bot_xxxxx
Body:
  {
    "sessionId": "session_xxxxx",
    "message": "User message",
    "visitorMetadata": {
      "userAgent": "...",
      "timestamp": "..."
    }
  }
```

## 🧱 Component Structure

```
components/
└── chat-widget.tsx    # Main widget component

app/
├── layout.tsx         # Root layout
├── page.tsx          # Widget page
└── globals.css       # Styles

public/
└── widget.js         # Embed script
```

## 🎨 Styling

Widget uses Tailwind CSS for styling:

- Minimal external dependencies
- Scoped styles (no conflicts with parent site)
- Customizable theme colors

## 🔐 Security

### Token Validation
- Bot token required for all requests
- Token validated on backend
- Invalid tokens rejected

### Rate Limiting
- Per-bot rate limits
- Configurable in dashboard
- Prevents abuse

### Data Privacy
- Messages stored securely
- User metadata minimal
- GDPR compliant

## 📊 Analytics

Widget automatically tracks:
- Message count
- Session duration
- User interactions
- Response times

View analytics in dashboard.

## 🐛 Troubleshooting

### Issue: Widget not loading
**Solutions**:
- Verify bot token is correct
- Check CORS configuration
- Ensure backend is running
- Check browser console for errors

### Issue: Messages not sending
**Solutions**:
- Verify API URL is correct
- Check bot is active
- Ensure bot is trained
- Check network tab for API errors

### Issue: Styling conflicts
**Solutions**:
- Widget uses iframe isolation
- Styles are scoped
- Use iframe method for better isolation

## 🚢 Deployment

### Static Hosting

Build and deploy to any static hosting:

```bash
npm run build
```

Upload `out/` directory to:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### CDN Distribution

For best performance:
1. Build widget
2. Upload to CDN
3. Update embed script URL
4. Enable caching

### CORS Configuration

Backend must allow widget origin:

```env
CORS_ORIGIN=https://your-widget-domain.com
```

## 📈 Performance

### Optimizations
- Code splitting
- Lazy loading
- Minimal bundle size
- Fast initial load

### Metrics
- Initial load: < 50KB
- Interactive: < 1s
- Message send: < 500ms

## 🔗 Related

- [Backend API](../backend/README.md)
- [Frontend Dashboard](../frontend/README.md)
- [Database Schema](../supabase/README.md)

## 📝 License

MIT License - See main README for details

