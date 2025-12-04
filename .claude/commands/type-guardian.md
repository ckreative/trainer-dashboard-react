---
description: Improve TypeScript type safety and eliminate unsafe patterns
---

# Type Guardian Subagent

Enhance TypeScript type safety, eliminate `any` types, add runtime validation, and ensure type contracts match API reality.

## Gap Addressed

**Current Issues**:
- Using React 19 (bleeding edge) with complex type requirements
- Large component props need better typing
- API responses need stronger type contracts
- No runtime type validation (TypeScript only compile-time)

**Goal**: Strong, safe typing throughout the application
**Impact**: 2-3 hours/week saved, prevents runtime errors, better IDE support

## When to Use

Use this subagent when:
- Adding new API endpoints
- Creating complex data structures
- Refactoring components
- Adding form validation
- Debugging type errors
- Preparing for production
- Onboarding new developers

## Type Safety Patterns

### 1. Eliminate `any` Types

**Problem**: Using `any` bypasses type safety

Before:
```typescript
function handleData(data: any) {
  return data.someProperty; // No type checking!
}

const config: any = {
  // Could be anything
};
```

After:
```typescript
interface Data {
  someProperty: string;
  otherProperty: number;
}

function handleData(data: Data): string {
  return data.someProperty; // Type-safe!
}

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
  };
}

const config: AppConfig = {
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
  },
  features: {
    analytics: false,
  },
};
```

### 2. Use Discriminated Unions

**Problem**: Template type isn't type-safe

Before:
```typescript
interface Template {
  id: string;
  name: string;
  type: string; // Could be anything!
  imageUrl: string;
  carouselImages?: string[]; // Sometimes present, sometimes not
}

// Unsafe usage
if (template.type === 'carousel') {
  // carouselImages might be undefined!
  template.carouselImages.map(/* ... */);
}
```

After:
```typescript
interface BaseTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  textZones: TextZone[];
  createdAt: string;
  updatedAt: string;
}

interface SingleTemplate extends BaseTemplate {
  type: 'single';
  // Single-specific properties (none currently)
}

interface CarouselTemplate extends BaseTemplate {
  type: 'carousel';
  carouselImages: string[]; // Always present for carousel
}

type Template = SingleTemplate | CarouselTemplate;

// Type-safe usage
function renderTemplate(template: Template) {
  if (template.type === 'carousel') {
    // TypeScript knows carouselImages exists!
    return template.carouselImages.map(/* ... */);
  }
  // TypeScript knows this is SingleTemplate
  return <div>{template.imageUrl}</div>;
}
```

### 3. Add Runtime Validation with Zod

**Problem**: TypeScript types only exist at compile-time

Install Zod:
```bash
npm install zod
```

Create schemas:
```typescript
// src/schemas/project.ts
import { z } from 'zod';

export const ProjectStatusSchema = z.enum(['active', 'archived', 'completed']);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string(),
  status: ProjectStatusSchema,
  ownerId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: ProjectStatusSchema.default('active'),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// Infer TypeScript types from schemas
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
```

Use in API service:
```typescript
// src/services/projects.ts
import { ProjectSchema, CreateProjectSchema } from '@/schemas/project';

export class ProjectsService {
  async create(data: unknown): Promise<Project> {
    // Validate input at runtime
    const validatedData = CreateProjectSchema.parse(data);

    const response = await apiClient.post<ApiResponse<unknown>>(
      '/api/projects',
      validatedData
    );

    // Validate response at runtime
    const validatedProject = ProjectSchema.parse(response.data);
    return validatedProject;
  }

  async getById(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/projects/${id}`
    );

    // Validate API response matches expected shape
    const validatedProject = ProjectSchema.parse(response.data);
    return validatedProject;
  }
}
```

Use in forms:
```typescript
// src/components/ProjectForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema } from '@/schemas/project';

export function ProjectForm({ onSubmit }: ProjectFormProps) {
  const form = useForm({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  });

  // Form will have type-safe validation!
  const handleSubmit = form.handleSubmit(async (data) => {
    // data is fully validated and typed
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Fields automatically validated by schema */}
    </form>
  );
}
```

### 4. Strict Null Checking

Ensure `strictNullChecks` is enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Handle nulls explicitly:
```typescript
// Before - Unsafe
function getUserName(user: User) {
  return user.name.toUpperCase(); // Crashes if name is null!
}

// After - Safe
function getUserName(user: User | null): string {
  if (!user) {
    return 'Guest';
  }
  return user.name?.toUpperCase() ?? 'Unknown';
}

// Or use type guards
function isUser(value: User | null): value is User {
  return value !== null && 'name' in value;
}

if (isUser(user)) {
  // TypeScript knows user is not null here
  console.log(user.name);
}
```

### 5. Generic Type Safety

Create type-safe generic utilities:

```typescript
// src/types/api.ts

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

// Generic error type
export interface ApiError<T = Record<string, string[]>> {
  message: string;
  status?: number;
  errors?: T;
}

// Type-safe API client
export class TypedApiClient {
  async get<TResponse>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<TResponse> {
    // Implementation
  }

  async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest
  ): Promise<TResponse> {
    // Implementation
  }
}

// Usage
const projects = await apiClient.get<PaginatedResponse<Project>>('/api/projects');
// projects.data is typed as Project[]
// projects.meta is typed correctly
```

### 6. Branded Types

Prevent mixing similar primitive types:

```typescript
// Problem: Easy to mix up IDs
function deleteProject(id: string) { /* ... */ }
function deleteUser(id: string) { /* ... */ }

const projectId = 'proj_123';
const userId = 'user_456';

deleteProject(userId); // Oops! Wrong ID but TypeScript allows it

// Solution: Branded types
type ProjectId = string & { readonly __brand: 'ProjectId' };
type UserId = string & { readonly __brand: 'UserId' };

function createProjectId(id: string): ProjectId {
  return id as ProjectId;
}

function createUserId(id: string): UserId {
  return id as UserId;
}

function deleteProject(id: ProjectId) { /* ... */ }
function deleteUser(id: UserId) { /* ... */ }

const projectId = createProjectId('proj_123');
const userId = createUserId('user_456');

deleteProject(userId); // TypeScript error! Type mismatch
```

### 7. Exhaustive Type Checking

Ensure all cases are handled:

```typescript
// PostStatus type
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

// Exhaustive check helper
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function getStatusColor(status: PostStatus): string {
  switch (status) {
    case 'draft':
      return 'gray';
    case 'scheduled':
      return 'blue';
    case 'published':
      return 'green';
    case 'failed':
      return 'red';
    default:
      // If we add a new status and forget to handle it,
      // TypeScript will error here!
      return assertNever(status);
  }
}

// If PostStatus gets a new value, TypeScript forces us to handle it
```

### 8. Const Assertions

Use `as const` for literal types:

```typescript
// Before - Widened types
const colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  danger: '#ef4444',
};
// colors.primary has type: string

// After - Exact literal types
const colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  danger: '#ef4444',
} as const;
// colors.primary has type: '#3b82f6'

type ColorName = keyof typeof colors; // 'primary' | 'secondary' | 'danger'
type ColorValue = (typeof colors)[ColorName]; // '#3b82f6' | '#8b5cf6' | '#ef4444'

// Array with literal types
const statuses = ['draft', 'published', 'archived'] as const;
type Status = (typeof statuses)[number]; // 'draft' | 'published' | 'archived'
```

### 9. Type Predicates

Create custom type guards:

```typescript
// src/utils/type-guards.ts

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// Usage
function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string
    return value.toUpperCase();
  }

  if (isNumber(value)) {
    // TypeScript knows value is number
    return value.toFixed(2);
  }

  return null;
}

// Check API responses
function validateUser(data: unknown): User | null {
  if (!hasProperty(data, 'id') || !isString(data.id)) {
    return null;
  }

  if (!hasProperty(data, 'name') || !isString(data.name)) {
    return null;
  }

  if (!hasProperty(data, 'email') || !isString(data.email)) {
    return null;
  }

  // Now we know data has the right shape
  return data as User;
}
```

### 10. Readonly and Immutability

Prevent accidental mutations:

```typescript
// Readonly array
const statuses: readonly string[] = ['draft', 'published', 'archived'];
statuses.push('new'); // TypeScript error!

// Readonly object
interface ReadonlyProject {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
}

const project: ReadonlyProject = {
  id: '1',
  name: 'Project',
  createdAt: new Date(),
};

project.name = 'New Name'; // TypeScript error!

// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

const config: DeepReadonly<AppConfig> = {
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
  },
};

config.api.timeout = 5000; // TypeScript error!
```

## Type Safety Checklist

- [ ] No `any` types (use `unknown` instead)
- [ ] Strict null checks enabled
- [ ] Discriminated unions for variant types
- [ ] Runtime validation with Zod
- [ ] Type guards for unknown values
- [ ] Branded types for domain IDs
- [ ] Exhaustive switch statements
- [ ] Const assertions for literals
- [ ] Generic types properly constrained
- [ ] Readonly where appropriate

## Integration with Existing Skills

### With generate-interfaces
```
"Generate Project interfaces with Zod schemas for runtime validation"
```

### With generate-api-service
```
"Generate projectsService with type-safe API responses and Zod validation"
```

### With generate-form
```
"Generate registration form with Zod validation schema"
```

### With test-generator
```
"Generate tests that verify type safety at runtime"
```

## Example Usage

**Audit existing types:**
```
"Audit the Template interface and add discriminated unions"
```

**Add runtime validation:**
```
"Add Zod schemas for all API service types"
```

**Eliminate any types:**
```
"Find and replace all 'any' types with proper TypeScript types"
```

**Add type guards:**
```
"Create type guards for validating API responses"
```

## Success Metrics

- [ ] Zero `any` types in codebase
- [ ] All API responses validated with Zod
- [ ] All forms use Zod for validation
- [ ] Type guards for external data
- [ ] Discriminated unions for variant types
- [ ] No TypeScript errors or warnings
- [ ] Runtime type errors caught before crashes

This subagent ensures type safety at both compile-time and runtime, preventing bugs and improving developer experience.
