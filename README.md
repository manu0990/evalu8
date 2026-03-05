# Evalu8 - AI-Powered Interview Evaluation Platform

Open-source platform for conducting AI-powered mock interviews with real-time evaluation and analytics.

## 🚀 Quick Start

### Prerequisites

Before contributing, ensure you have:
- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (This project uses pnpm as the package manager)
- **Docker** (Optional, for containerized setup)
- **PostgreSQL** (Optional, if not using Docker)

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/manu0990/evalu8.git
cd evalu8
```

### 2. Set Up Development Environment

Choose one of the following setup methods:

#### Option A: Docker Compose (Recommended for Quick Start)

```bash
# Start all services (postgres, web, and ws-server)
docker compose up

# Start only specific services
docker compose up web          # Only web app (+ postgres)
docker compose up ws-server    # Only WebSocket server (+ postgres)

# Run in detached mode with (background)
docker compose up -d           # All services

# Rebuild and start individual services
docker compose up --build web
docker compose up --build ws-server

# Stop all services
docker compose down
```

> **Note:** When you start `web` or `ws-server`, Docker Compose automatically starts `postgres` as a dependency.

#### Option B: Manual Setup (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/manu0990/evalu8.git
cd evalu8

# Install dependencies
pnpm install

# Get a db connection (install PostgreSQL locally or use a cloud service)
# To use Docker to run PostgreSQL:
docker run -d \
  --name evalu8-db \
  -e POSTGRES_USER=evalu8_user \    
  -e POSTGRES_PASSWORD=evalu8_password \
  -e POSTGRES_DB=evalu8_db \
  -p 5432:5432 \
  postgres:alpine

# Set up environment variables
cp .env.example .env # Edit .env with your actual values

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start all development servers
pnpm dev
```

### 3. Verify Setup

Access the applications:
- Web App: http://localhost:3000
- WebSocket Server: ws://localhost:8080

## 📁 Project Structure

```
evalu8/
├── apps/
│   ├── web/                    # Next.js frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities & configurations
│   │   └── package.json
│   └── ws-server/             # WebSocket server (Port 8080)
│       ├── src/
│       └── package.json
├── docker/
│   ├── Dockerfile.web         # Docker configuration for web app
│   └── Dockerfile.ws          # Docker configuration for WebSocket server
├── packages/
│   ├── db/                    # Prisma ORM & Database
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── migrations/    # Database migrations
│   │   └── package.json
│   ├── ui/                    # Shared UI components (shadcn/ui)
│   ├── eslint-config/         # Shared ESLint configurations
│   ├── typescript-config/     # Shared TypeScript configurations
│   └── tailwind-config/       # Shared Tailwind CSS setup
├── .env.example               # Environment variables template (root)
├── .env                       # Your environment variables (root, git-ignored)
├── docker-compose.dev.yaml    # Docker Compose configuration
├── package.json               # Root package configuration
├── pnpm-workspace.yaml        # pnpm workspace configuration
└── turbo.json                 # Turborepo configuration
```

### Apps

- **`apps/web`** - Next.js 15.4.2 frontend with React 19.1.0
  - AI-powered interview interface and evaluation dashboard
  - NextAuth.js authentication with Google & GitHub
  - Modern UI with Tailwind CSS v4 and shadcn/ui components
  - Theme support (dark/light mode)
  
- **`apps/ws-server`** - WebSocket server for real-time communication
  - Handles real-time interview sessions
  - Built with Node.js and `ws` library (v8.18.3)

### Packages

- **`packages/db`** - Database layer with Prisma ORM 6.13.0
  - PostgreSQL configuration and migrations
  - Type-safe database client
  
- **`packages/ui`** - Shared React component library
  - Reusable components built with Radix UI
  - Consistent styling with Tailwind CSS
  
- **`packages/eslint-config`** - ESLint configurations for code quality
  
- **`packages/typescript-config`** - TypeScript 5.8.2 configurations
  
- **`packages/tailwind-config`** - Shared Tailwind CSS 4.1.5 setup

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with strict type checking.

## 🛠️ Tech Stack

### Frontend
- **Next.js** 15.4.2 with App Router
- **React** 19.1.0 with TypeScript 5.8.3
- **Tailwind CSS** 4.1.5 for styling
- **shadcn/ui** - Custom component library built on Radix UI
- **NextAuth.js** 4.24.11 for authentication

### Backend
- **Node.js** WebSocket server
- **ws** 8.18.3 for WebSocket communication
- **PostgreSQL** database
- **Prisma ORM** 6.13.0

### Development Tools
- **Turborepo** 2.5.6 for monorepo management
- **pnpm** 9.0.0 for package management
- **ESLint** 9.31.0 for code linting
- **Prettier** 3.6.2 for code formatting
- **TypeScript** 5.8.3 with strict mode

### Additional Libraries
- **Axios** 1.11.0 for HTTP requests
- **React Hook Form** + **Zod** for form handling
- **Lucide React** 0.536.0 for icons
- **bcryptjs** for password hashing
- **next-themes** 0.4.6 for theme support

## 🔧 Utilities

This project uses the following development utilities:

- **[TypeScript](https://www.typescriptlang.org/)** 5.8.3 - Static type checking with strict mode
- **[ESLint](https://eslint.org/)** 9.31.0 - Code linting and quality checks
- **[Prettier](https://prettier.io)** 3.6.2 - Automatic code formatting
- **[Turborepo](https://turborepo.com/)** 2.5.6 - Efficient monorepo task management with caching
- **[pnpm](https://pnpm.io/)** 9.0.0 - Fast, disk space efficient package manager
- **[Prisma](https://prisma.io/)** 6.13.0 - Next-generation ORM for database management

## 🚀 Development Commands

### Run All Apps

```bash
# Start all development servers
pnpm dev

# Build all apps and packages
pnpm build

# Lint all code
pnpm lint

# Type check all packages
pnpm check-types

# Format code with Prettier
pnpm format
```

### Build Specific App

Build only a specific application from the root directory:

```bash
# Build only the web app
pnpm build --filter=web

# Build only the WebSocket server
pnpm build --filter=ws-server

# Build only the database package
pnpm build --filter=@repo/db

# Build only the UI package
pnpm build --filter=@repo/ui
```

### Run Specific App

Run a specific app in development mode:

```bash
# Run only the web app
pnpm dev --filter=web

# Run only the WebSocket server
pnpm dev --filter=ws-server
```

### Database Commands

```bash
# Run migrations in development
pnpm db:migrate

# Deploy migrations to production
pnpm db:migrate:deploy

# Generate Prisma client
pnpm db:generate

# Push schema changes directly to database
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database and run all migrations
pnpm db:reset
```

> **Tip**: Use [Turborepo filters](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters) to run commands on specific packages.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│                   http://localhost:3000                     │
└────────────────┬──────────────────────┬─────────────────────┘
                 │                      │
         HTTP/HTTPS Requests    WebSocket Connection
                 │                      │
         ┌───────▼───────┐       ┌──────▼──────┐
         │   Next.js App │       │  WS Server  │
         │   (Port 3000) │       │ (Port 8080) │
         │               │       │             │
         │ - App Router  │       │ - Real-time │
         │ - NextAuth    │       │ - Sessions  │
         │ - API Routes  │       │             │
         └───────┬───────┘       └──────┬──────┘
                 │                      │
                 └───────────┬──────────┘
                             │
                      Prisma Client
                             │
                      ┌──────▼──────┐
                      │ PostgreSQL  │
                      │  Database   │
                      │             │
                      │ - Users     │
                      │ - Sessions  │
                      │ - Meetings  │
                      └─────────────┘

Shared Packages:
┌────────────────────────────────────────────────────────────┐
│  @repo/db  │  @repo/ui  │  @repo/eslint-config  │  etc.   │
└────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Web Application** (`apps/web`)
   - Next.js 15 with App Router
   - Server-side rendering and API routes
   - NextAuth.js for authentication
   - Communicates with PostgreSQL via Prisma

2. **WebSocket Server** (`apps/ws-server`)
   - Real-time bidirectional communication
   - Handles live interview sessions
   - Event-driven architecture

3. **Database Layer** (`packages/db`)
   - Prisma ORM for type-safe queries
   - PostgreSQL for data persistence
   - Centralized schema and migrations

4. **Shared Packages**
   - `@repo/ui` - Reusable React components
   - `@repo/eslint-config` - Code quality rules
   - `@repo/typescript-config` - TS configurations
   - `@repo/tailwind-config` - Styling setup

## ⚙️ Environment Variables 

All environment variables should be defined in the root `.env` file:

```env
# Database Connection
DATABASE_URL="postgresql://evalu8_user:evalu8_password@localhost:5432/evalu8_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# WebSocket Server
WS_PORT=8080

# Environment
NODE_ENV="development"
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption | ✅ Yes |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ For Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ For Google login |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ⚠️ For GitHub login |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | ⚠️ For GitHub login |
| `WS_PORT` | WebSocket server port | ✅ Yes |
| `NODE_ENV` | Environment mode (development/production) | ✅ Yes |

## 🔐 Security Best Practices

- ✅ **Never commit `.env` files** - They are in `.gitignore`
- ✅ **Always commit `.env.example` files** - Templates for other developers
- ✅ **Use strong secrets** - Generate with `openssl rand -base64 32`
- ✅ **Different values per environment** - Dev, staging, and prod should differ
- ✅ **Rotate secrets regularly** - Change secrets periodically

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Read our detailed [Contribution Guidelines](CONTRIBUTING.md) before getting started.

## 📄 License

This project is licensed under the ISC License.

## 🔗 Useful Links

### Documentation
- **[Turborepo](https://turborepo.com/docs)** - Monorepo management
  - [Running Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
  - [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
  - [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- **[Next.js](https://nextjs.org/docs)** - React framework
- **[Prisma](https://www.prisma.io/docs)** - Database ORM
- **[NextAuth.js](https://next-auth.js.org)** - Authentication
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling
- **[shadcn/ui](https://ui.shadcn.com)** - UI components
- **[WebSocket (ws)](https://github.com/websockets/ws)** - Real-time communication
- **[pnpm](https://pnpm.io/motivation)** - Package manager

### Remote Caching (Optional)

Turborepo can use [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share build caches across machines:

```bash
# Authenticate with Vercel (free for all plans)
turbo login

# Link your Turborepo to Remote Cache
turbo link
```
