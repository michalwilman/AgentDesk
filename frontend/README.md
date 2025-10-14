# AgentDesk Frontend

Next.js 14 dashboard for managing AI chatbots.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Copy the environment template:

```bash
cp env.example .env.local
```

Update `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WIDGET_URL=http://localhost:3002
```

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── (auth)/              # Authentication pages
│   ├── login/          # Login page
│   └── register/       # Registration page
├── (dashboard)/        # Dashboard routes (protected)
│   └── dashboard/
│       ├── page.tsx    # Dashboard home (bot list)
│       └── bots/
│           ├── new/    # Create bot
│           └── [id]/   # Bot details
├── layout.tsx          # Root layout
├── page.tsx            # Landing page
└── globals.css         # Global styles

components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
└── dashboard/          # Dashboard components
    └── dashboard-nav.tsx

lib/
├── supabase/          # Supabase clients
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server client
│   └── middleware.ts  # Auth middleware
└── utils.ts           # Utility functions
```

## 🎨 Features

### Landing Page
- Hero section with CTA
- Feature highlights
- Responsive design

### Authentication
- Email/password login
- User registration
- Protected routes with middleware
- Supabase Auth integration

### Dashboard
- Bot list view
- Create new bots
- Bot configuration
- Embed code generation
- API token display

## 🔒 Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Middleware validates session on protected routes
3. User profile created in database
4. Access to dashboard granted

## 🧱 Components

### UI Components

All in `components/ui/`:

- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input**: Form input with label and error support
- **Card**: Content container with header, content, footer

### Dashboard Components

- **DashboardNav**: Top navigation with user menu and logout

## 🎨 Styling

- **Tailwind CSS**: Utility-first styling
- **Responsive**: Mobile-first design
- **Theme**: Customizable via `tailwind.config.ts`

## 🌐 API Integration

### Backend API

All API calls use the backend URL from `NEXT_PUBLIC_API_URL`:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify(data),
})
```

### Supabase Direct

Some operations use Supabase directly:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('bots').select('*')
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy

```bash
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)
- `NEXT_PUBLIC_WIDGET_URL` (your widget URL)

## 🐛 Troubleshooting

### Issue: "Hydration mismatch"
**Solution**: Ensure server and client components are properly separated

### Issue: "Middleware not running"
**Solution**: Check `middleware.ts` matcher configuration

### Issue: "Supabase session not found"
**Solution**: Verify cookies are enabled and CORS is configured

## 📚 Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔗 Related

- [Backend README](../backend/README.md)
- [Widget README](../widget/README.md)
- [Database Schema](../supabase/README.md)

