# Contributing to ShareTrading UI MVP

Thank you for your interest in contributing to ShareTrading UI MVP! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/sharetrading-ui-mvp.git
   cd sharetrading-ui-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for complex functions

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow the established folder structure
- Ensure responsive design (mobile-first)
- Add proper accessibility attributes
- Use Framer Motion for animations consistently

### Commit Messages
Follow conventional commit format:
```
type(scope): description

feat(auth): add split-screen authentication
fix(charts): resolve data loading issue
docs(readme): update installation instructions
style(ui): improve button hover animations
refactor(hooks): optimize useNavigation hook
test(components): add Button component tests
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding tests

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Writing Tests
- Write unit tests for all new components
- Include accessibility tests
- Test error states and edge cases
- Use React Testing Library best practices
- Maintain test coverage above 80%

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Add screenshots for UI changes

### Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design verified
- [ ] Accessibility tested
- [ ] Performance impact considered

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots or videos if applicable
- Console errors (if any)

## 💡 Feature Requests

For feature requests, please provide:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach
- Mockups or examples (if applicable)

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### Design System
- Follow existing component patterns
- Use established color palette
- Maintain consistent spacing
- Ensure accessibility compliance

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Provide constructive feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to ShareTrading UI MVP! 🚀