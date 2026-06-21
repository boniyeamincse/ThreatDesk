# Contributing to ThreatDesk

Thank you for your interest in contributing to ThreatDesk! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to make participation in our project and our community a harassment-free experience for everyone.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing opinions and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 11+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)
- Git

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ThreatDesk.git
   cd ThreatDesk
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/threatdesk/ThreatDesk.git
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Start Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers
docker ps | grep threatdesk
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Create database schema
npx prisma db push

# Seed test data (optional)
npm run prisma:seed
```

### 4. Environment Configuration

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env as needed

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > frontend/.env.local
```

### 5. Start Development Servers

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Access frontend at: http://localhost:3002

---

## Making Changes

### Create a Branch

```bash
# Keep main clean
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions
- `chore/` - Maintenance tasks

Example: `feature/alert-correlation-engine`

### Work on Your Changes

1. Make focused changes addressing single concerns
2. Follow existing code style
3. Write or update tests
4. Update documentation if needed
5. Run tests locally before pushing

---

## Submitting Changes

### Before You Submit

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test locally**:
   ```bash
   npm run typecheck --workspace=backend
   npm run build --workspace=backend
   npm run test --workspace=backend
   ```

3. **Review your changes**:
   ```bash
   git diff HEAD~1
   ```

4. **Check code style**:
   ```bash
   npm run lint --workspace=backend
   npm run lint --workspace=frontend
   ```

### Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Create Pull Request

Use the PR template:
- Clear title (50 chars max)
- Detailed description
- Link related issues
- Include test results
- Mention breaking changes

---

## Coding Standards

### TypeScript/JavaScript

- Strict type checking enabled
- No `any` types without justification
- Use const/let, avoid var
- Prefer arrow functions
- Use async/await over promises
- Add JSDoc for public APIs

### File Organization

```
src/
├── modules/           # Feature modules
│   ├── module-name/
│   │   ├── module.controller.ts
│   │   ├── module.service.ts
│   │   ├── module.module.ts
│   │   └── dto/
├── config/            # Configuration
├── middleware/        # Express middleware
├── guards/            # Auth guards
└── utils/             # Utilities
```

### Naming Conventions

- Classes: PascalCase (e.g., `AlertService`)
- Functions: camelCase (e.g., `calculatePriority`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)
- Files: kebab-case (e.g., `alert.service.ts`)

### Error Handling

```typescript
// ✅ Good
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  throw new BadRequestException('Unable to process request');
}

// ❌ Avoid
try {
  return await operation();
} catch (e) {
  console.log(e);
}
```

---

## Commit Message Guidelines

### Format

```
type(scope): subject

body

footer
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build, dependencies, tooling

### Examples

```
feat(alerts): add correlation engine for alert grouping

- Implement clustering algorithm for similar alerts
- Add correlation score calculation
- Update alert schema with correlation metadata
- Add tests for correlation logic

Closes #123
```

```
fix(auth): validate JWT expiry before issuing token

JWT tokens were not properly checking expiration time,
allowing expired tokens to remain valid.

Fixes #456
```

---

## Pull Request Process

1. **Title**: Clear, descriptive, <50 chars
2. **Description**: Why, not just what
3. **Testing**: Describe test coverage
4. **Breaking Changes**: Clearly mark
5. **Reviewers**: Tag relevant maintainers
6. **Labels**: Add appropriate labels
7. **Status Checks**: All must pass

### PR Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Added tests
- [ ] Manual testing done
- [ ] No new warnings

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tests pass locally
```

---

## Testing

### Backend Tests

```bash
cd backend
npm run test
npm run test:watch
npm run test -- --coverage
```

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:watch
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Requirements

- New features: 80%+ coverage
- Bug fixes: 100% of changed code
- Refactors: Maintain existing coverage

---

## Documentation

### Docs Structure

```
docs/
├── getting-started.md      # First-time setup
├── architecture.md         # System design
├── api-guide.md           # API documentation
├── development.md         # Dev workflow
├── database.md            # Schema & queries
└── deployment.md          # Production setup
```

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep docs in sync with code
- Link to related docs
- Update when changing features

### API Documentation

```typescript
/**
 * Fetches alerts with optional filtering
 * 
 * @param skip - Number of records to skip
 * @param take - Number of records to return
 * @param filters - Optional filter criteria
 * @returns Promise resolving to paginated alerts
 * @throws BadRequestException if parameters invalid
 * 
 * @example
 * const alerts = await alertService.findAll(0, 20, { severity: 'high' });
 */
async findAll(skip: number, take: number, filters?: FilterCriteria) {
  // ...
}
```

---

## Community

### Getting Help

- **GitHub Issues**: Bug reports & features
- **Discussions**: Questions & ideas
- **Discord**: Real-time chat (link in README)
- **Email**: security@threatdesk.dev

### Reporting Issues

Use issue template:
1. Clear title
2. Reproduction steps
3. Expected vs actual behavior
4. Environment details
5. Relevant logs

### Discussions

For:
- Feature ideas
- Best practices questions
- Architecture discussions
- Use case sharing

---

## Review Process

### What Reviewers Look For

- Code correctness
- Style consistency
- Test coverage
- Documentation accuracy
- Performance impact
- Security concerns
- Breaking changes

### Approval Process

- 1 approval required for merges
- 2 approvals for major changes
- All CI checks must pass
- Documentation must be updated

---

## Release Process

### Versioning

Semantic versioning: MAJOR.MINOR.PATCH

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Steps

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Build release artifacts
5. Publish to npm/Docker Hub
6. Announce release

---

## Common Workflows

### Adding a Feature

1. Create issue with feature proposal
2. Discuss approach with maintainers
3. Create feature branch
4. Implement with tests
5. Submit PR
6. Respond to review feedback
7. Merge when approved

### Fixing a Bug

1. Create issue with reproduction steps
2. Create fix branch
3. Write test demonstrating bug
4. Implement fix
5. Verify test passes
6. Submit PR
7. Reference issue in PR

### Updating Documentation

1. Create docs branch
2. Make changes
3. Preview locally
4. Submit PR
5. Get review
6. Merge

---

## Questions?

- Check existing issues & discussions
- Read documentation
- Ask in discussions forum
- Contact maintainers

## Thank You!

Your contributions make ThreatDesk better for everyone.

---

**Last Updated**: 2026-06-21
**Version**: 1.0.0
