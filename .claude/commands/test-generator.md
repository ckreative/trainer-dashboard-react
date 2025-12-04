---
description: Generate unit and integration tests for components, services, and contexts
---

# Test Generator Subagent

Automatically generate comprehensive tests for React components, TypeScript services, and Context providers.

## Critical Gap Addressed

**Current Status**: Zero test coverage across 68 TypeScript files
**Goal**: Establish test coverage with automated test generation
**Impact**: 6-8 hours saved per week, catch bugs before production

## When to Use

Use this subagent when:
- Creating new components, services, or contexts
- Adding test coverage to existing code
- Refactoring code and need to maintain test coverage
- Fixing bugs (write test first, then fix)
- Before deploying to production

## Test Framework Setup

### Step 1: Install Testing Dependencies

First, check if testing libraries are installed:

```bash
npm list vitest @testing-library/react @testing-library/jest-dom
```

If not installed, install them:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/ui jsdom
```

### Step 2: Create Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Create Test Setup File

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### Step 4: Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

## Test Generation Patterns

### 1. Component Tests

Generate tests for React components using React Testing Library:

```typescript
// Component: src/components/UserCard.tsx
// Test: src/components/UserCard.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(<UserCard user={mockUser} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(<UserCard user={mockUser} isLoading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <UserCard user={mockUser} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

### 2. Service Tests

Generate tests for API service classes:

```typescript
// Service: src/services/projects.ts
// Test: src/services/projects.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { projectsService } from './projects';

// Mock fetch
global.fetch = vi.fn();

describe('ProjectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('auth_token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('fetches all projects successfully', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', status: 'active' },
        { id: '2', name: 'Project 2', status: 'completed' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockProjects }),
      });

      const result = await projectsService.getAll();

      expect(result).toEqual(mockProjects);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      await expect(projectsService.getAll()).rejects.toThrow('Server error');
    });

    it('includes query parameters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await projectsService.getAll({ search: 'test', status: 'active' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test&status=active'),
        expect.any(Object)
      );
    });
  });

  describe('create', () => {
    it('creates a new project', async () => {
      const newProject = { name: 'New Project', description: 'Test' };
      const createdProject = { id: '3', ...newProject };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createdProject }),
      });

      const result = await projectsService.create(newProject);

      expect(result).toEqual(createdProject);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newProject),
        })
      );
    });
  });

  describe('delete', () => {
    it('deletes a project', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await projectsService.delete('1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
```

### 3. Context Tests

Generate tests for React Context providers:

```typescript
// Context: src/contexts/ProjectsContext.tsx
// Test: src/contexts/ProjectsContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ProjectsProvider, useProjects } from './ProjectsContext';
import { projectsService } from '@/services/projects';
import { ReactNode } from 'react';

// Mock the service
vi.mock('@/services/projects', () => ({
  projectsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProjectsContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ProjectsProvider>{children}</ProjectsProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useProjects());
    }).toThrow('useProjects must be used within a ProjectsProvider');
  });

  it('fetches projects on mount', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ];

    vi.mocked(projectsService.getAll).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(projectsService.getAll).toHaveBeenCalledTimes(1);
  });

  it('creates a new project', async () => {
    const newProject = { name: 'New Project', description: 'Test' };
    const createdProject = { id: '3', ...newProject };

    vi.mocked(projectsService.getAll).mockResolvedValue([]);
    vi.mocked(projectsService.create).mockResolvedValue(createdProject);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.createProject(newProject);

    expect(projectsService.create).toHaveBeenCalledWith(newProject);
    expect(result.current.projects).toContainEqual(createdProject);
  });

  it('updates a project', async () => {
    const initialProjects = [{ id: '1', name: 'Project 1', status: 'active' }];
    const updates = { status: 'completed' };
    const updatedProject = { ...initialProjects[0], ...updates };

    vi.mocked(projectsService.getAll).mockResolvedValue(initialProjects);
    vi.mocked(projectsService.update).mockResolvedValue(updatedProject);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.updateProject('1', updates);

    expect(result.current.projects[0]).toEqual(updatedProject);
  });

  it('deletes a project', async () => {
    const initialProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ];

    vi.mocked(projectsService.getAll).mockResolvedValue(initialProjects);
    vi.mocked(projectsService.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.deleteProject('1');

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].id).toBe('2');
  });

  it('handles errors during fetch', async () => {
    const error = new Error('Network error');
    vi.mocked(projectsService.getAll).mockRejectedValue(error);

    const { result } = renderHook(() => useProjects(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });
});
```

### 4. Form Tests

Generate tests for form components:

```typescript
// Form: src/components/LoginForm.tsx
// Test: src/components/LoginForm.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders form fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
```

## Test Coverage Goals

### Component Tests
- [ ] Rendering with different props
- [ ] User interactions (clicks, form submissions)
- [ ] Loading states
- [ ] Error states
- [ ] Edge cases (empty data, null values)
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Service Tests
- [ ] Successful API calls
- [ ] Error handling
- [ ] Request headers and body
- [ ] Query parameters
- [ ] Authentication token inclusion
- [ ] Response parsing

### Context Tests
- [ ] Initial state
- [ ] Data fetching on mount
- [ ] CRUD operations
- [ ] Error handling
- [ ] State updates
- [ ] Error when used outside provider

### Form Tests
- [ ] Field rendering
- [ ] Validation (required, format, min/max)
- [ ] Submission with valid data
- [ ] Loading states
- [ ] Error display
- [ ] Field interactions (show/hide password, etc.)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
```

## Integration with Existing Skills

### With generate-component
```
"Generate a UserProfile component with tests"
```
This will:
1. Generate the component
2. Generate corresponding test file
3. Include common test cases

### With generate-api-service
```
"Generate a projectsService with tests"
```
This will:
1. Generate the service class
2. Generate test file with mocked fetch
3. Test all CRUD methods

### With generate-context
```
"Generate a ProjectsContext with tests"
```
This will:
1. Generate the context
2. Generate tests with renderHook
3. Test provider and custom hook

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with describe blocks
- Follow Arrange-Act-Assert pattern

### 2. Mocking
- Mock external dependencies (API calls, contexts)
- Use vi.fn() for function mocks
- Clear mocks between tests

### 3. Async Testing
- Use waitFor for async operations
- Test loading states
- Test error states

### 4. User Interactions
- Use userEvent for realistic interactions
- Test keyboard navigation
- Test form submissions

### 5. Accessibility
- Test with screen readers in mind
- Use semantic queries (getByRole, getByLabelText)
- Test keyboard navigation

## Example Usage

**Generate tests for existing component:**
```
"Generate tests for the PostsView component"
```

**Generate component with tests:**
```
"Generate a ProjectCard component with comprehensive tests"
```

**Add missing test coverage:**
```
"Add tests for the authService focusing on error handling"
```

**Test a specific scenario:**
```
"Write a test for the LoginScreen that checks password visibility toggle"
```

## Success Metrics

- [ ] Test coverage above 80%
- [ ] All components have tests
- [ ] All services have tests
- [ ] All contexts have tests
- [ ] Tests run in CI/CD pipeline
- [ ] Tests catch regressions before production

This subagent addresses the critical gap of zero test coverage and establishes a foundation for test-driven development.
