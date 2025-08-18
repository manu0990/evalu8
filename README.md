# 🎯 Evalu8 - AI-Powered Interview Evaluation Platform

A modern web application that helps evaluate users' interview capabilities by conducting mock interviews with AI. Built with TypeScript, Next.js, and real-time features, this platform provides comprehensive interview assessment tools for both candidates and recruiters.

## 🚀 Features

- **AI-Powered Mock Interviews**: Conduct realistic interview sessions with AI
- **Real-time Evaluation**: Instant feedback and assessment during interviews
- **Interactive Whiteboard**: Drawing tools for technical interviews and problem-solving
  - Rectangle, ellipse, arrow, line, freedraw, and text tools
  - Real-time collaborative drawing capabilities
- **Database Integration**: PostgreSQL with Prisma ORM for data persistence
- **WebSocket Communication**: Real-time features for live interview sessions
- **Modern UI**: Built with React 19, Next.js 15, and Tailwind CSS
- **Type Safety**: 100% TypeScript across the entire codebase
- **Theme Support**: Dark/light mode with next-themes

## 📁 Project Structure

This Turborepo monorepo includes the following apps and packages:

### Apps

- **`apps/web`**: Main Next.js frontend application for the interview platform
  - AI-powered interview interface and evaluation dashboard
  - Interactive whiteboard component with drawing tools for technical interviews
  - Modern UI with custom Google Fonts (Handlee, EB Garamond, Space Mono)
  - Theme support with next-themes integration
  - TypeScript with strict type checking
- **`apps/ws-server`**: WebSocket server for real-time communication
  - Handles real-time interview sessions
  - Built with Node.js and the `ws` library
  - Integrates with the database for session persistence

### Packages

- **`packages/db`**: Database layer with Prisma ORM
  - PostgreSQL database configuration
  - User management and interview session models
  - Generated Prisma client for type-safe database queries
- **`packages/ui`**: Shared React component library
  - Reusable UI components (alerts, buttons, etc.)
  - Consistent styling with Tailwind CSS and shadcn/ui components
  - Shared across all applications
- **`packages/eslint-config`**: ESLint configurations
  - Base configuration for consistent code style
  - Next.js specific rules and React internal configurations
  - Includes Prettier integration
- **`packages/typescript-config`**: TypeScript configurations
  - Base TypeScript configuration
  - Next.js specific settings
  - React library configurations
- **`packages/tailwind-config`**: Shared Tailwind CSS configuration
  - Consistent styling across all apps
  - PostCSS configuration and shared styles

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with strict type checking enabled.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS 4.x, Lucide React icons, Custom Google Fonts
- **Backend**: Node.js, WebSocket (ws library)
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo**: Turborepo with pnpm workspaces
- **Development**: ESLint, Prettier, TypeScript strict mode
- **HTTP Client**: Axios for API communication
- **Themes**: next-themes for dark/light mode support

## 🏗️ Utilities

This Turborepo has the following tools configured:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Turborepo](https://turborepo.com/) for efficient monorepo management
- [pnpm](https://pnpm.io/) as the package manager
- [Prisma](https://prisma.io/) for database ORM and migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm 9.0.0 or later
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/manu0990/drawligent.git
cd evalu8
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
# Create .env files in apps/web and packages/db
cp apps/web/.env.example apps/web/.env
# Add your DATABASE_URL and other required variables
```

4. Set up your database:

```bash
# Navigate to the database package and run migrations
cd packages/db
pnpm prisma migrate dev
pnpm prisma generate
```

5. Start development servers:

```bash
# From the root directory
pnpm dev
```

This will start:

- Web app on `http://localhost:3000` (Main interview platform)
- WebSocket server on the configured `WS_PORT` (Real-time communication)

## 🎨 Whiteboard Features

The platform includes an interactive whiteboard for technical interviews with support for:

- **Drawing Tools**: Select, rectangle, ellipse, arrow, line, freedraw, text, and delete
- **Customization**: Stroke color, fill color, and stroke width options
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **History Management**: Undo/redo functionality with state history
- **Shape Management**: Select, move, and modify drawn elements

### Build

To build all apps and packages, run the following command:

```bash
cd evalu8

# With global turbo installed (recommended)
turbo build

# Without global turbo, use pnpm
pnpm build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
# Build only the web app
turbo build --filter=web

# Build only the WebSocket server
turbo build --filter=@repo/ws-server
```

### Development

To develop all apps and packages, run the following command:

```bash
cd evalu8

# Start all development servers
pnpm dev

# Or with global turbo
turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
# Develop only the web app
turbo dev --filter=web

# Develop only the WebSocket server
turbo dev --filter=@repo/ws-server
```

## 🗃️ Database Management

This project uses Prisma with PostgreSQL. Here are common database commands:

```bash
# Navigate to the database package
cd packages/db

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Reset database
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

## 📝 Available Scripts

From the root directory:

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

## 🧩 Architecture

```
┌─ apps/
│  ├─ web/                    # Next.js frontend app
│  │  ├─ app/                # Next.js app router
│  │  │  ├─ layout.tsx       # Root layout with fonts
│  │  │  ├─ page.tsx         # Home page
│  │  │  └─ globals.css      # Global styles import
│  │  ├─ components/         # React components (empty - ready for development)
│  │  ├─ types/              # TypeScript type definitions
│  │  │  └─ whiteboard.ts    # Whiteboard and drawing types
│  │  └─ public/             # Static assets
│  └─ ws-server/             # WebSocket server
│     └─ src/                # Server source code
├─ packages/
│  ├─ db/                    # Database layer
│  │  ├─ prisma/             # Schema and migrations
│  │  │  └─ schema.prisma    # User model and database config
│  │  └─ generated/          # Generated Prisma client
│  ├─ ui/                    # Shared UI components
│  │  └─ src/components/     # Reusable React components
│  ├─ tailwind-config/       # Tailwind CSS configuration
│  │  └─ shared-styles.css   # Design system with CSS variables
│  ├─ eslint-config/         # ESLint configurations
│  └─ typescript-config/     # TypeScript configurations
└─ turbo.json               # Turborepo configuration
```

## ⚙️ Environment Variables

Make sure to set up the following environment variables:

```bash
# packages/db/.env or apps/web/.env
DATABASE_URL="postgresql://username:password@localhost:5432/evalu8"

# WebSocket Server Configuration
WS_PORT=8080

# Next.js Configuration
NODE_ENV=development
NEXT_PUBLIC_WS_URL="ws://localhost:8080"

# Additional configuration for AI features (when implemented)
# OPENAI_API_KEY="your-openai-api-key"
# AI_MODEL="gpt-4"
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode requirements
- Use the existing ESLint and Prettier configurations
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🗺️ Roadmap

- [ ] Complete AI interview integration
- [ ] Enhanced whiteboard features (shapes library, templates)
- [ ] Video/audio recording for interview sessions
- [ ] Analytics dashboard for interview performance
- [ ] Multi-language support
- [ ] Mobile responsive design improvements

## 📄 License

This project is licensed under the ISC License.

### Remote Caching

### Remote Caching (Optional)

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

To enable Remote Caching:

```bash
# Authenticate with Vercel
turbo login

# Link your Turborepo to Remote Cache
turbo link
```

## 🔗 Useful Links

Learn more about the technologies used in this project:

- **Turborepo**: [Documentation](https://turborepo.com/docs)
  - [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
  - [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
  - [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
  - [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- **Next.js**: [Documentation](https://nextjs.org/docs)
- **Prisma**: [Documentation](https://www.prisma.io/docs)
- **WebSocket**: [ws library](https://github.com/websockets/ws)
- **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
