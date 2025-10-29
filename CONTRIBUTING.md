# Contributing to Evalu8

Thank you for your interest in contributing to Evalu8! We appreciate your help in making this project better.

## 🌟 Why These Guidelines?

Our goal is to create a healthy, inclusive, and collaborative environment for all contributors. Remember that open-source contribution is about collaboration, not competition.

## 📋 General Guidelines

- **One Issue at a Time**: Work on one issue at a time to give others opportunities to contribute
- **Read Repository Guidelines**: Each repository has its own guidelines—always read them first
- **Be Respectful**: Treat all contributors with respect and kindness
- **Stay Updated**: Provide feedback every 24-48 hours if an issue is assigned to you

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

## 🔄 Contribution Workflow

### 1. Get an Issue Assigned

Before starting work:

1. **Find an Issue**: Browse open issues or create a new one
2. **Provide Approach**: Comment with your plan to solve the issue
   - For UI changes: Include mockups/designs (Figma, draw.io, etc.)
   - For features: Describe your implementation approach
3. **Wait for Assignment**: A maintainer will review and assign the issue

> **Note**: Don't ask "Can I work on this?" Instead, provide your approach and wait for assignment.

### 2. Create a Branch

```bash
# Create a new branch from main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Build to ensure no errors
pnpm build

# Test specific app
pnpm build --filter=web
```

### 5. Commit Your Changes

Use meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples
git commit -m "feat: add user profile page"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update installation instructions"
git commit -m "style: format code with prettier"
```

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name
```

Then:
1. Go to the repository on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template with:
   - Clear description of changes
   - Screenshots/recordings (for UI changes)
   - Related issue number (e.g., "Closes #123")

## ✅ Code Quality Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid using `any` type
- Define proper interfaces/types

### Code Style

- Follow existing code patterns
- Use ESLint and Prettier configurations
- Run `pnpm lint` before committing
- Keep functions small and focused

### Testing

Before submitting:

```bash
# Run all checks from root
pnpm check-types 
pnpm lint
pnpm build
```

## 📁 Working with Monorepo

### Build Specific Package

```bash
# Build only web app
pnpm build --filter=web

# Build only WebSocket server
pnpm build --filter=ws-server

# Build only UI package
pnpm build --filter=@repo/ui
```

### Run Specific Package

```bash
# Run only web app
pnpm dev --filter=web

# Run only WebSocket server
pnpm dev --filter=ws-server
```

## 🗃️ Database Changes

If your contribution involves database changes:

```bash
# Navigate to db package
cd packages/db

# Create a migration
pnpm prisma migrate dev --name your_migration_name

# Generate Prisma client
pnpm prisma generate
```

## ❌ Don'ts

- **Don't** comment "Please assign this issue to me" without providing an approach
- **Don't** tag maintainers repeatedly for reviews
- **Don't** submit PRs for unassigned issues
- **Don't** work on multiple issues simultaneously
- **Don't** submit PRs without testing your changes
- **Don't** ignore feedback—respond to review comments

## ✨ Best Practices

- **Communicate Regularly**: Update progress every 24-48 hours
- **Ask Questions**: Don't hesitate to ask for clarification
- **Be Patient**: Reviews may take time
- **Learn from Feedback**: Use review comments to improve
- **Help Others**: Review other PRs, answer questions

## 🐛 Reporting Bugs

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots/error logs if applicable

## 💡 Suggesting Features

When suggesting features:
- Explain the use case
- Describe the expected behavior
- Provide mockups/examples if applicable
- Discuss why it benefits users

## 📚 Resources

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🆘 Getting Help

- Check existing documentation
- Search closed issues
- Ask in issue comments
- Be specific about your problem

Thank you for contributing to Evalu8! 🎉

**Happy Contributing!**
