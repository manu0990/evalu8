# Evalu8 - AI-Powered Interview Evaluation Platform

Open source platform for conducting AI-powered mock interviews and real-time evaluation.

## Running Locally

> **Note**
> 
> This project uses pnpm only as a package manager.

**Clone the repository:**
```bash
git clone https://github.com/manu0990/evalu8.git
```

**Navigate to the project directory:**
```bash
cd evalu8
```

## Instant Docker Setup

> **Note**
> 
> Your Docker Daemon should be online

**One-command setup using Docker Compose:**
```bash
# Start all services (PostgreSQL, Web App, WebSocket Server)
docker-compose -f docker-compose.dev.yaml up
```

**To run in detached mode:**
```bash
docker-compose -f docker-compose.dev.yaml up -d
```

**To stop all services:**
```bash
docker-compose -f docker-compose.dev.yaml down
```

## Traditional Docker Setup

**(Optional) Start PostgreSQL database using Docker:**
```bash
docker run -d \
  --name evalu8-db \
  -e POSTGRES_USER=evalu8_user \
  -e POSTGRES_PASSWORD=evalu8_password \
  -e POSTGRES_DB=evalu8_db \
  -p 5432:5432 \
  postgres:alpine
```

**Create a .env file:**
- Copy `.env.example` and rename it to `.env.local`

**Install dependencies:**
```bash
pnpm install
```

**Run database migrations:**
```bash
pnpm db:migrate
```

**Generate Prisma client:**
```bash
pnpm db:generate
```

**Start the development server:**
```bash
pnpm dev
```

## Usage

**Access the applications in your browser:**
- Web Application: http://localhost:3000
- WebSocket Server: http://localhost:8080

## Project Structure

This Turborepo monorepo includes the following apps and packages:

### Apps

- **`apps/web`**: Main Next.js frontend application for the interview platform
  - AI-powered interview interface and evaluation dashboard
  - Modern UI with custom Google Fonts (Handlee, EB Garamond, Space Mono)
  - Theme support with next-themes integration
  - TypeScript with strict type checking
  - Built with Next.js 15.4.2, React 19.1.0, and Turbopack for fast development
- **`apps/ws-server`**: WebSocket server for real-time communication
  - Handles real-time interview sessions
  - Built with Node.js and the `ws` library (v8.18.3)
  - Integrates with the database for session persistence
  - TypeScript support with ESM modules

### Packages

- **`packages/db`**: Database layer with Prisma ORM
  - PostgreSQL database configuration
  - User management and interview session models
  - Generated Prisma client (v6.13.0) for type-safe database queries
  - Database migrations with initial User model (id, username, email, password)
- **`packages/ui`**: Shared React component library
  - Reusable UI components (alerts, buttons, etc.) built with Radix UI
  - Consistent styling with Tailwind CSS and shadcn/ui components
  - Class Variance Authority for component variants
  - Shared across all applications with TypeScript support
- **`packages/eslint-config`**: ESLint configurations
  - Base configuration for consistent code style
  - Next.js specific rules and React internal configurations
  - Includes Prettier integration with ESLint 9.31.0
- **`packages/typescript-config`**: TypeScript configurations
  - Base TypeScript configuration (v5.8.2)
  - Next.js specific settings
  - React library configurations
- **`packages/tailwind-config`**: Shared Tailwind CSS configuration
  - Consistent styling across all apps with Tailwind CSS 4.1.5
  - PostCSS configuration and shared styles
  - CSS animation support with tw-animate-css

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with strict type checking enabled.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.2, React 19.1.0, TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.1.5, Lucide React icons 0.536.0
- **Backend**: Node.js, WebSocket (ws 8.18.3)
- **Database**: PostgreSQL with Prisma ORM 6.13.0
- **Monorepo**: Turborepo 2.5.6 with pnpm 9.0.0 workspaces
- **Development**: ESLint 9.31.0, Prettier 3.6.2, TypeScript strict mode
- **HTTP Client**: Axios 1.11.0 for API communication
- **Themes**: next-themes 0.4.6 for dark/light mode support
- **UI Components**: Radix UI, Class Variance Authority, tailwind-merge, clsx

## 🏗️ Utilities

This Turborepo has the following tools configured:

- [TypeScript](https://www.typescriptlang.org/) 5.8.3 for static type checking
- [ESLint](https://eslint.org/) 9.31.0 for code linting
- [Prettier](https://prettier.io) 3.6.2 for code formatting
- [Turborepo](https://turborepo.com/) 2.5.6 for efficient monorepo management
- [pnpm](https://pnpm.io/) 9.0.0 as the package manager
- [Prisma](https://prisma.io/) 6.13.0 for database ORM and migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm 9.0.0 or later
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/manu0990/evalu8.git
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

- Web app on `http://localhost:3000` (Main interview platform with Turbopack)
- WebSocket server on the configured `WS_PORT` (default: 8080 for real-time communication)

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

- `pnpm dev` - Start all development servers (uses Turborepo)
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps with ESLint
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking across all packages

### Database Management Scripts

- `pnpm db:migrate` - Run Prisma migrations in development
- `pnpm db:migrate:deploy` - Deploy migrations to production
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes directly to database
- `pnpm db:studio` - Open Prisma Studio for database management
- `pnpm db:reset` - Reset database and run all migrations

## 🧩 Architecture

```
┌─ apps/
│  ├─ web/                    # Next.js frontend app (v15.4.2)
│  │  ├─ app/                # Next.js app router
│  │  │  ├─ layout.tsx       # Root layout with custom Google Fonts
│  │  │  ├─ page.tsx         # Home page
│  │  │  └─ globals.css      # Global styles import
│  │  ├─ components/         # React components (ready for development)
│  │  ├─ types/              # TypeScript type definitions
│  │  └─ public/             # Static assets
│  └─ ws-server/             # WebSocket server (ws v8.18.3)
│     └─ src/                # Server source code with TypeScript
├─ packages/
│  ├─ db/                    # Database layer (Prisma v6.13.0)
│  │  ├─ prisma/             # Schema and migrations
│  │  │  ├─ schema.prisma    # User model and database config
│  │  │  └─ migrations/      # Database migration files
│  │  ├─ generated/          # Generated Prisma client
│  │  └─ src/                # Database exports and client setup
│  ├─ ui/                    # Shared UI components (React 19.1.0)
│  │  └─ src/components/     # Reusable React components with Radix UI
│  │     ├─ alert.tsx        # Alert component with variants
│  │     ├─ button.tsx       # Button component with CVA
│  │     └─ lib/utils.ts     # Utility functions (clsx, tailwind-merge)
│  ├─ tailwind-config/       # Tailwind CSS configuration (v4.1.5)
│  │  ├─ shared-styles.css   # Design system with CSS variables
│  │  └─ postcss.config.js   # PostCSS configuration
│  ├─ eslint-config/         # ESLint configurations (v9.31.0)
│  └─ typescript-config/     # TypeScript configurations (v5.8.2)
└─ turbo.json               # Turborepo configuration with TUI
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

### Global Environment Variables (Turborepo)

The following environment variables are configured as global in `turbo.json`:
- `NODE_ENV` - Environment mode (development/production)
- `WS_PORT` - WebSocket server port

## Contributing

We welcome contributions from the community! There are many ways to contribute to Evalu8. Code is just one possible means of contribution.

**To contribute follow these steps:**

**Fork the repository.**

**Clone the fork to your local machine:**
```bash
git clone https://github.com/<your username>/evalu8.git
cd evalu8
```

**Create a new branch:**
```bash
git checkout -b feature/fooBar
```

**Make your changes and commit them:**
```bash
git commit -am 'Add some fooBar'
```

**Push to the branch:**
```bash
git push origin feature/fooBar
```

**Go to the repository and make a Pull Request.**

For major changes, please open an issue first to discuss what you would like to change.

Read our [contribution guidelines](CONTRIBUTING.md) for more details.

## 🗺️ Roadmap

### Current Status
- ✅ Monorepo setup with Turborepo and pnpm workspaces
- ✅ Next.js 15 frontend with React 19 and TypeScript
- ✅ WebSocket server for real-time communication
- ✅ Database layer with Prisma ORM and PostgreSQL
- ✅ Shared UI component library with Radix UI
- ✅ Development tooling (ESLint, Prettier, TypeScript)

### Upcoming Features
- [ ] Complete AI interview integration
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
