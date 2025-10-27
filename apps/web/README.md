<h1 align="center">Evalu8</h1>
<p align="center">AI-Powered Interview Evaluation Platform</p>

<p align="center">
  <img width="1920" height="1080" alt="Screenshot_20251027_185053" src="https://github.com/user-attachments/assets/bcabe849-9663-4f2a-a18c-9d8d77c90cee" />
</p>


## Overview

This is the web interface built with Next.js 15.4.2 and React 19.1.0, providing an AI-powered interview platform with real-time evaluation and analytics.

## Features

- 🎯 **AI-Powered Interviews** - Conduct mock interviews with AI evaluation
- 📊 **Analytics Dashboard** - Track interview performance and metrics
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🔐 **Authentication** - Secure auth with NextAuth.js and Prisma adapter
- 🌗 **Theme Support** - Dark/light mode with next-themes
- 📱 **Responsive Design** - Mobile-first approach with modern typography
- 🚀 **Fast Development** - Turbopack-powered development server

## Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (custom component library)
- **Authentication**: NextAuth.js v4.24.11
- **Database ORM**: Prisma (via @repo/db workspace package)
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner
- **HTTP Client**: Axios
- **Password Hashing**: bcryptjs

## Typography

The application uses multiple Google Fonts for rich typography:
- **Inter** - Primary UI font
- **EB Garamond** - Serif display font
- **Space Mono** - Monospace font
- **Roboto** - Sans-serif alternative
- **Poppins** - Modern sans-serif
- **Playfair Display** - Elegant serif

## Getting Started

> **Note**: This app is part of a Turborepo monorepo. Run commands from the **root directory**.

### Prerequisites

- Node.js >= 18
- pnpm 9.0.0
- PostgreSQL database (or use Docker)

### Development

From the **root directory** of the monorepo:

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start the development server (runs all apps)
pnpm dev
```

The web app will be available at [http://localhost:3000](http://localhost:3000)

### App-Specific Commands

To run commands only for the web app:

```bash
# Development
pnpm --filter web dev

# Build
pnpm --filter web build

# Start production server
pnpm --filter web start

# Lint
pnpm --filter web lint

# Type checking
pnpm --filter web check-types
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (root)/            # Protected routes
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── dashboard/     # Main dashboard
│   │   ├── meetings/      # Meeting management
│   │   └── settings/      # User settings
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth API routes
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   └── signup/        # Sign up page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── app-layout/        # Dashboard components
│   ├── landing/           # Landing page components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   └── authOptions.ts     # NextAuth configuration
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware

```

## Environment Variables

Create a `.env.local` file in the web app directory or root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/evalu8_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Add other required environment variables
```

## Available Routes

- `/` - Landing page with features and pricing
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Main dashboard (protected)
- `/analytics` - Analytics dashboard (protected)
- `/meetings` - Meeting management (protected)
- `/settings` - User settings (protected)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

This project is part of the Evalu8 monorepo. See the root LICENSE file for details.
