# Evalu8 Web App

<p align="center">
  <img width="1920" height="1080" alt="Evalu8 Screenshot" src="https://github.com/user-attachments/assets/bcabe849-9663-4f2a-a18c-9d8d77c90cee" />
</p>

AI-powered interview evaluation platform built with Next.js 15 and React 19.

## Overview

The web application provides an intuitive interface for conducting AI-powered mock interviews with real-time evaluation and comprehensive analytics dashboards.

## ✨ Features

- 🎯 **AI-Powered Interviews** - Conduct mock interviews with intelligent evaluation
- 📊 **Analytics Dashboard** - Track performance metrics and insights
- 🔐 **Authentication** - Secure NextAuth.js with Google & GitHub OAuth
- 🎨 **Modern UI** - Beautiful components with shadcn/ui and Tailwind CSS
- 🌗 **Theme Support** - Dark/light mode with next-themes
- 📱 **Responsive Design** - Mobile-first approach
- 🚀 **Fast Development** - Turbopack-powered hot reload

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI)
- **Authentication**: NextAuth.js v4.24.11
- **Database**: Prisma ORM (via `@repo/db`)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner

## 📋 Prerequisites

> **Note**: This app is part of a Turborepo monorepo. Run all commands from the **root directory** unless specified otherwise.

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- PostgreSQL database (or Docker)

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Docker (optional, for containerized development)
- Git installed and configured

### Setup Instructions

For detailed setup instructions, please refer to the [Quick Start section in README.md](./README.md#-quick-start).

**Quick summary:**
1. Fork and clone the repository
2. Choose setup method (Docker Compose or Manual)
3. Install dependencies and configure environment variables
4. Run database migrations
5. Start development servers

Access the applications:
- Web App: http://localhost:3000
- WebSocket Server: ws://localhost:8080

## 📦 App-Specific Commands

Run these from the **root directory** using filters:

```bash
# Development
pnpm dev --filter=web

# Build for production
pnpm build --filter=web

# Start production server
pnpm start --filter=web

# Linting
pnpm lint --filter=web

# Type checking
pnpm check-types --filter=web
```

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (root)/            # Protected routes (requires auth)
│   │   │   ├── layout.tsx     # Protected layout wrapper
│   │   │   ├── analytics/     # Analytics & reports
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── meetings/      # Meeting management
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes
│   │   │   └── auth/          # NextAuth endpoints
│   │   ├── auth/              # Authentication pages
│   │   │   ├── signin/        # Sign in page
│   │   │   └── signup/        # Sign up page
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── app-layout/        # Dashboard-specific components
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   └── NewMeetingForm.tsx
│   │   ├── landing/           # Landing page components
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Footer.tsx
│   │   └── providers/         # Context providers
│   │       ├── SessionProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── FontProvider.tsx
│   ├── lib/                   # Utilities & configurations
│   │   └── authOptions.ts     # NextAuth configuration
│   ├── types/                 # TypeScript definitions
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   └── middleware.ts          # Route protection middleware
├── public/                    # Static assets
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint configuration
└── package.json              # Dependencies & scripts

# Note: Environment variables are in the root .env file
# (not in this directory)
```

## 🗺️ Available Routes

### Public Routes
- `/` - Landing page with features and pricing
- `/auth/signin` - Sign in page (email + OAuth)
- `/auth/signup` - Sign up page

### Protected Routes (Requires Authentication)
- `/dashboard` - Main dashboard with overview
- `/analytics` - Performance analytics and insights
- `/meetings` - Meeting history and management
- `/settings` - User profile and preferences

## 🎨 Typography

The application uses Google Fonts for rich typography:
- **Inter** - Primary UI font
- **EB Garamond** - Serif display font
- **Space Mono** - Monospace font
- **Roboto** - Sans-serif alternative
- **Poppins** - Modern sans-serif
- **Playfair Display** - Elegant serif

## 🔧 Configuration

### NextAuth.js Setup

OAuth providers are configured in `src/lib/authOptions.ts`. To enable:

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add to `.env`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **GitHub OAuth**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create OAuth App
   - Add to `.env`: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### Database Models

The app uses Prisma models from `@repo/db`:
- User
- Account (for OAuth)
- Session
- VerificationToken

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📄 License

Part of the Evalu8 monorepo. See the root LICENSE file for details.
