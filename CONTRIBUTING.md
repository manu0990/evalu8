# Contributing

Thank you for your interest in contributing to Evalu8. To ensure a smooth and collaborative environment, please follow these guidelines. Before contributing, set up the project locally using the steps outlined in [README.md](README.md).

## Why these guidelines?

Our goal is to create a healthy and inclusive space for contributions. Remember that open-source contribution is a collaborative effort, not a competition.

## General guidelines

- Work only on one issue at a time since it will provide an opportunity for others to contribute as well.
- Note that each open-source repository generally has its own guidelines, similar to these. Always read them before starting your contributions.

## How to get an issue assigned

To get an issue assigned, provide a small description as to how you are planning to tackle this issue.

**Example:** If the issue is about UI changes, you should create a design showing how you want it to look on the UI (make it using Figma, draw.io, etc.)

This will allow multiple contributors to discuss their approach to tackle the issue. The maintainer will then assign the issue.

## After getting the issue assigned

- Create your own branch instead of working directly on the main branch.
- Provide feedback every 24-48 hours if an issue is assigned to you. Otherwise, it may be reassigned.
- When submitting a pull request, please provide a screenshot or a screen-recording showcasing your work.

## Don't while contributing

- Avoid comments like "Please assign this issue to me" or "can I work on this issue?"
- Refrain from tagging the maintainer to assign issues or review pull requests.
- Don't make any pull request for issues you are not assigned to. It will be closed without merging.

## Development Setup

Choose one of the three methods to set up your development environment:

### Method 1: Docker Compose (Recommended)
```bash
# Start all services
docker-compose -f docker-compose.dev.yaml up
```

### Method 2: Traditional Docker Setup
```bash
# Start PostgreSQL
docker run -d \
  --name evalu8-db \
  -e POSTGRES_USER=evalu8_user \
  -e POSTGRES_PASSWORD=evalu8_password \
  -e POSTGRES_DB=evalu8_db \
  -p 5432:5432 \
  postgres:alpine

# Install dependencies and run
pnpm install
pnpm db:migrate
pnpm db:generate
pnpm dev
```

### Method 3: Manual Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up your local PostgreSQL database
# Update DATABASE_URL in .env.local

# Run migrations and start
pnpm db:migrate
pnpm db:generate
pnpm dev
```

## Code Style Guidelines

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Run `pnpm lint` and `pnpm check-types` before submitting
- Use meaningful commit messages following conventional commits format

## Testing Your Changes

Before submitting a pull request:

```bash
# Check types
pnpm check-types

# Run linting
pnpm lint

# Test the build
pnpm build
```

**Happy Contributing!**
