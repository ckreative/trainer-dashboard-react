---
description: Generate TypeScript interfaces from data structures
---

# Generate Interfaces Command

Generate TypeScript interfaces for type-safe data structures across the application.

## Usage

When invoked, gather these parameters:
1. **Interface Purpose** - What data does it represent:
   - API response data
   - Component props
   - Form data
   - Application state
   - Configuration
2. **Data Source** - Where does the data come from:
   - Laravel API response
   - User input
   - Third-party API
   - Internal state
3. **Location** - Where should the interface be defined:
   - Inline with component (for component-specific props)
   - Service file (for API types)
   - Shared types file (src/types/)
4. **Properties** - List of fields with types and optionality

## Interface Generation Steps

### 1. Determine Location

**Component Props Interface:**
- Define in same file as component, above the component
```typescript
// src/components/UserCard.tsx
interface UserCardProps {
  user: User;
  onEdit?: () => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // Component implementation
}
```

**API/Service Types:**
- Define in service file or dedicated types file
```typescript
// src/services/users.ts
export interface User {
  id: string;
  name: string;
  email: string;
  // ...
}

// src/types/api.ts (for shared types)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
}
```

**Shared Application Types:**
- Create in src/types/ directory
```typescript
// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
```

### 2. Define Interface Structure

**Basic Interface:**
```typescript
export interface {InterfaceName} {
  // Required properties
  id: string;
  name: string;
  createdAt: string; // ISO date string from API

  // Optional properties
  description?: string;
  metadata?: Record<string, any>;
}
```

**With Nested Objects:**
```typescript
export interface Project {
  id: string;
  name: string;
  owner: User; // Reference to another interface
  settings: ProjectSettings;
  tags: string[];
}

export interface ProjectSettings {
  isPublic: boolean;
  allowComments: boolean;
  theme: 'light' | 'dark';
}
```

**With Union Types:**
```typescript
export interface Post {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  type: PostType;
}

export type PostType = 'article' | 'video' | 'gallery';
```

**With Discriminated Unions:**
```typescript
export interface Template {
  id: string;
  name: string;
  type: 'single' | 'carousel';
  imageUrl: string;
}

export interface SingleTemplate extends Template {
  type: 'single';
  // Single-specific properties
}

export interface CarouselTemplate extends Template {
  type: 'carousel';
  carouselImages: string[];
  // Carousel-specific properties
}

export type AnyTemplate = SingleTemplate | CarouselTemplate;
```

### 3. Add JSDoc Comments

For complex interfaces, add JSDoc comments:

```typescript
/**
 * Represents a scheduled social media post
 */
export interface ScheduledPost {
  /** Unique identifier for the post */
  id: string;

  /** Reference to the template used */
  templateId: string;

  /** Post content as key-value pairs matching template text zones */
  textContent: Record<string, string>;

  /**
   * When the post should be published
   * @format ISO 8601 date-time string
   */
  scheduledDate: Date;

  /** Current status of the post */
  status: PostStatus;
}

/**
 * Possible states for a scheduled post
 */
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
```

### 4. Create Related Request/Response Types

**For API endpoints:**

```typescript
// The main resource
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'archived' | 'completed';

// Create request (subset of Project)
export interface CreateProjectRequest {
  name: string;
  description: string;
  status?: ProjectStatus; // Optional with default
}

// Update request (all fields optional)
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// API response wrapper
export interface ProjectResponse {
  data: Project;
  message?: string;
}

export interface ProjectsListResponse {
  data: Project[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
}
```

### 5. Extend HTML/React Types When Needed

**For UI Components:**

```typescript
import * as React from 'react';

// Extend HTML button attributes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Extend HTML div attributes
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

// For polymorphic components
export interface BoxProps<T extends React.ElementType = 'div'> {
  as?: T;
  children: React.ReactNode;
}
```

### 6. Use Generics for Reusable Types

```typescript
// Generic API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
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

// Generic form field
export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
}

// Usage
const userResponse: ApiResponse<User> = await fetchUser();
const projectsList: PaginatedResponse<Project> = await fetchProjects();
```

## Common Interface Patterns

### 1. Component Props Interface

```typescript
// Basic props
interface ComponentProps {
  title: string;
  description?: string;
  onSave: (data: FormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Props with discriminated union
interface BaseProps {
  title: string;
  mode: 'view' | 'edit';
}

interface ViewModeProps extends BaseProps {
  mode: 'view';
  // view-specific props
}

interface EditModeProps extends BaseProps {
  mode: 'edit';
  onSave: (data: FormData) => void;
  // edit-specific props
}

type ComponentProps = ViewModeProps | EditModeProps;
```

### 2. Form Data Interface

```typescript
// Registration form
export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeToTerms: boolean;
}

// With validation errors
export interface FormErrors<T> {
  [K in keyof T]?: string;
}

// Usage
const errors: FormErrors<RegistrationFormData> = {
  email: 'Invalid email address',
  password: 'Password too short',
};
```

### 3. API Error Interface

```typescript
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Laravel validation errors
  status?: number;
  code?: string;
}

// Or as a class for instanceof checks
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 4. Configuration Interface

```typescript
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    maxUploadSize: number;
  };
}

// Read from environment
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.MODE as AppConfig['environment'],
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: true,
    maxUploadSize: 5 * 1024 * 1024, // 5MB
  },
};
```

### 5. State Interface

```typescript
// For Context or reducer state
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  settings: UserSettings;
}

// Reducer action types
export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };
```

## Type Utilities

### 1. Utility Types

```typescript
// Make all properties optional
type PartialProject = Partial<Project>;

// Make all properties required
type RequiredProject = Required<Project>;

// Pick specific properties
type ProjectPreview = Pick<Project, 'id' | 'name' | 'status'>;

// Omit specific properties
type ProjectWithoutDates = Omit<Project, 'createdAt' | 'updatedAt'>;

// Record type
type StatusCounts = Record<ProjectStatus, number>;
// Results in: { active: number; archived: number; completed: number }
```

### 2. Creating Types from Interfaces

```typescript
// Extract keys as union type
type ProjectKey = keyof Project;
// Results in: 'id' | 'name' | 'description' | ...

// Extract value types
type ProjectValues = Project[keyof Project];

// Array of specific type
type Projects = Project[];

// Or
type Projects = Array<Project>;
```

### 3. Readonly Types

```typescript
// Immutable interface
export interface ReadonlyProject {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

// Or use Readonly utility
type ReadonlyProject = Readonly<Project>;
```

## Best Practices

### 1. Naming Conventions
- Use PascalCase for interfaces: `User`, `Project`, `ApiResponse`
- Use "I" prefix sparingly (not common in TypeScript)
- Suffix with purpose: `UserProps`, `CreateUserRequest`, `UserResponse`
- Use descriptive names: `UserRole` not `Role`

### 2. Organization
- Co-locate component props interfaces with components
- Group related API types in service files
- Create shared types file for cross-cutting types
- Keep types close to where they're used

### 3. Type Safety
- Avoid `any` type - use `unknown` if type is truly unknown
- Use union types instead of generic strings
- Prefer interfaces over types for objects (can be extended)
- Use types for unions, primitives, tuples

### 4. Documentation
- Add JSDoc comments for complex interfaces
- Document format requirements (ISO dates, URLs, etc.)
- Explain business logic in comments
- Link to related interfaces

### 5. Reusability
- Use generics for reusable patterns
- Extract common patterns to utility types
- Extend base interfaces for variants
- Use discriminated unions for polymorphic data

### 6. API Types
- Match backend response structure exactly
- Create separate Request/Response types
- Handle nullable/optional fields correctly
- Type validation errors from backend

## File Organization Examples

```
src/
├── types/
│   ├── index.ts           # Re-export all types
│   ├── api.ts             # Generic API types
│   ├── user.ts            # User-related types
│   └── project.ts         # Project-related types
├── services/
│   ├── auth.ts            # Auth types + service
│   └── projects.ts        # Project types + service
└── components/
    ├── UserCard.tsx       # UserCardProps inline
    └── ProjectList.tsx    # ProjectListProps inline
```

**src/types/index.ts:**
```typescript
// Re-export all types for easy imports
export * from './api';
export * from './user';
export * from './project';
```

**Usage in components:**
```typescript
import { User, Project, ApiResponse } from '@/types';
```

## Example Invocations

**API Resource:**
"Generate interfaces for a Project resource with id, name, description, status, owner, and timestamps. Include CreateProjectRequest and UpdateProjectRequest types."

**Component Props:**
"Generate a ProjectCardProps interface with project, onEdit, onDelete, and isLoading properties"

**Form Data:**
"Generate interfaces for a user registration form with name, email, password, password confirmation, and validation errors"

**API Response:**
"Generate a generic ApiResponse interface that wraps data with optional message and errors"

**Discriminated Union:**
"Generate Template interfaces with a discriminated union for single and carousel types"

## After Generation

1. Review generated types for completeness
2. Add JSDoc comments if needed
3. Ensure types match API/backend exactly
4. Verify optional vs required properties
5. Test that components using the types type-check correctly
6. Consider creating utility types if patterns repeat
7. Export types for use across application
