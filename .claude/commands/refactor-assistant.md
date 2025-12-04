---
description: Identify and refactor code smells, improve patterns, and maintain consistency
---

# Refactor Assistant Subagent

Identify code smells, technical debt, and opportunities for refactoring while maintaining established patterns and improving code quality.

## Gap Addressed

**Current Issues**:
- Large components (ProfileSettings.tsx: 20KB, App.tsx: 367 lines)
- No .gitignore file (security risk!)
- Duplicate patterns across components
- Hardcoded data in components
- Technical debt accumulating

**Goal**: Clean, maintainable, DRY codebase following established patterns
**Impact**: 3-4 hours saved per week, reduced technical debt, easier maintenance

## When to Use

Use this subagent when:
- Components exceed 300 lines
- Duplicate code appears across files
- Complex state management in components
- Hardcoded data should be extracted
- Before major feature additions
- During code reviews
- When onboarding patterns

## Refactoring Patterns

### 1. Extract Large Components

**Problem**: Component too large (>300 lines)

**Example - App.tsx (367 lines)**:

Before:
```typescript
// App.tsx - 367 lines with embedded state
function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([/* 60 lines of hardcoded data */]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([/* more data */]);

  // 20+ handler functions
  const handleAddTemplate = (template: Template) => { /* ... */ };
  const handleUpdateTemplate = (template: Template) => { /* ... */ };
  // ... many more handlers

  return (
    <div>
      {/* 200+ lines of JSX */}
    </div>
  );
}
```

After:
```typescript
// src/data/defaultTemplates.ts
export const defaultTemplates: Template[] = [
  // Extracted template data
];

// src/data/defaultPosts.ts
export const defaultPosts: ScheduledPost[] = [
  // Extracted post data
];

// src/hooks/useTemplates.ts
export function useTemplates(initialTemplates: Template[]) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);

  const addTemplate = useCallback((template: Template) => {
    setTemplates(prev => [...prev, template]);
  }, []);

  const updateTemplate = useCallback((updatedTemplate: Template) => {
    setTemplates(prev =>
      prev.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  return { templates, addTemplate, updateTemplate, deleteTemplate };
}

// App.tsx - Now ~100 lines
import { defaultTemplates } from '@/data/defaultTemplates';
import { useTemplates } from '@/hooks/useTemplates';

function Dashboard() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplates(defaultTemplates);
  const { posts, addPost, updatePost, deletePost } = usePosts(defaultPosts);

  return <div>{/* Cleaner JSX */}</div>;
}
```

### 2. Create Custom Hooks

**Problem**: Repeated logic across components

**Example - Filter/Sort Logic**:

Before (duplicated in PostsView, TemplateManager):
```typescript
// PostsView.tsx
const [filter, setFilter] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState('date');

const filteredPosts = useMemo(() => {
  return posts
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => /* sorting logic */);
}, [posts, filter, searchQuery, sortBy]);

// TemplateManager.tsx - SAME LOGIC DUPLICATED
```

After:
```typescript
// src/hooks/useFilterSort.ts
export function useFilterSort<T extends Record<string, any>>(
  items: T[],
  filterKey: keyof T,
  searchKeys: (keyof T)[]
) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof T>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    return items
      .filter(item =>
        filter === 'all' || item[filterKey] === filter
      )
      .filter(item =>
        searchKeys.some(key =>
          String(item[key]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (!sortBy) return 0;
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const order = sortOrder === 'asc' ? 1 : -1;
        return aVal < bVal ? -order : aVal > bVal ? order : 0;
      });
  }, [items, filter, searchQuery, sortBy, sortOrder, filterKey, searchKeys]);

  return {
    filtered,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

// PostsView.tsx - Much cleaner
const { filtered, filter, setFilter, searchQuery, setSearchQuery } =
  useFilterSort(posts, 'status', ['templateName', 'textContent']);
```

### 3. Extract Reusable Components

**Problem**: Similar UI patterns duplicated

**Example - Table with Filters**:

Before (similar code in PostsView, TemplateManager):
```typescript
// Duplicated table header with search and filter
<div className="flex items-center justify-between mb-4">
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <Select value={filter} onValueChange={setFilter}>
    {/* Options */}
  </Select>
</div>
<Table>
  {/* Table content */}
</Table>
```

After:
```typescript
// src/components/FilterableTable.tsx
interface FilterableTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  filterOptions?: Array<{ value: string; label: string }>;
  onRowClick?: (row: T) => void;
}

export function FilterableTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  filterOptions,
  onRowClick,
}: FilterableTableProps<T>) {
  const { filtered, searchQuery, setSearchQuery, filter, setFilter } =
    useFilterSort(data, /* ... */);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filterOptions && (
            <Select value={filter} onValueChange={setFilter}>
              {filterOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={onRowClick}
        />
      </CardContent>
    </Card>
  );
}

// Usage - PostsView.tsx
<FilterableTable
  data={posts}
  columns={postColumns}
  searchPlaceholder="Search posts..."
  filterOptions={statusOptions}
  onRowClick={handlePostClick}
/>
```

### 4. Standardize Error Handling

**Problem**: Inconsistent error handling across services

Before:
```typescript
// Different error handling in each service method
try {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
} catch (err) {
  console.error(err);
  throw err;
}
```

After:
```typescript
// src/utils/api-client.ts
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An error occurred',
      }));

      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      } as ApiError;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
);

// Services now use standardized client
export class ProjectsService {
  async getAll(params?: GetProjectsParams): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/api/projects', params);
    return response.data;
  }
}
```

### 5. Extract Configuration Files

**Problem**: No .gitignore, environment config scattered

**Solution**:

Create `.gitignore`:
```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary
*.tmp
.cache/

# Package manager
.npm
.yarn/
.pnpm-debug.log*
```

Create `.env.example`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# Upload Configuration
VITE_MAX_UPLOAD_SIZE=5242880

# Social Media
VITE_FACEBOOK_APP_ID=
VITE_TWITTER_API_KEY=
```

Create `src/config/app.ts`:
```typescript
export const appConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 30000,
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
  upload: {
    maxSize: Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5242880, // 5MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
} as const;

export type AppConfig = typeof appConfig;
```

### 6. Break Down Large Files

**Problem**: ProfileSettings.tsx is 20KB

Strategy:
1. Identify logical sections
2. Extract to separate components
3. Create barrel export
4. Maintain single responsibility

```
src/components/settings/
├── ProfileSettings.tsx         # Main coordinator (50 lines)
├── AccountSection.tsx          # Account settings
├── SecuritySection.tsx         # Password, 2FA
├── PreferencesSection.tsx      # UI preferences
├── NotificationsSection.tsx    # Notification settings
├── BillingSection.tsx          # Billing info
└── index.ts                    # Barrel export
```

### 7. Standardize Loading/Error States

**Problem**: Different loading patterns across components

Create standard patterns:

```typescript
// src/components/common/LoadingState.tsx
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// src/components/common/ErrorState.tsx
export function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// src/components/common/EmptyState.tsx
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center py-8">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

// Usage
if (isLoading) return <LoadingState message="Loading projects..." />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
if (data.length === 0) return <EmptyState title="No projects yet" action={<Button>Create Project</Button>} />;
```

## Refactoring Checklist

### Before Refactoring
- [ ] Understand existing code fully
- [ ] Check if tests exist
- [ ] Identify all usages
- [ ] Plan refactoring steps
- [ ] Consider breaking changes

### During Refactoring
- [ ] Make small, incremental changes
- [ ] Keep tests passing
- [ ] Maintain existing behavior
- [ ] Follow project conventions
- [ ] Document complex changes

### After Refactoring
- [ ] Verify all tests pass
- [ ] Check TypeScript compilation
- [ ] Test affected features manually
- [ ] Update documentation
- [ ] Code review

## Code Smells to Watch For

### 1. Large Components (>300 lines)
**Solution**: Extract sub-components, custom hooks, data files

### 2. Duplicate Code
**Solution**: Create reusable components, utility functions, custom hooks

### 3. Complex Conditions
**Solution**: Extract to named functions, use early returns

### 4. God Objects
**Solution**: Split responsibilities, use composition

### 5. Magic Numbers/Strings
**Solution**: Extract to constants file

### 6. Nested Callbacks
**Solution**: Use async/await, extract functions

### 7. Long Parameter Lists
**Solution**: Use options object, builder pattern

### 8. Inconsistent Naming
**Solution**: Standardize naming conventions

## Integration with Existing Skills

### With generate-component
```
"Generate a refactored version of ProfileSettings as smaller components"
```

### With test-generator
```
"Refactor PostsView and generate tests for new structure"
```

### With ui-verify
```
"Refactor the dashboard layout and verify it renders correctly"
```

## Example Usage

**Identify refactoring opportunities:**
```
"Analyze App.tsx for refactoring opportunities"
```

**Refactor specific component:**
```
"Refactor ProfileSettings into smaller, focused components"
```

**Extract common patterns:**
```
"Extract the filter and search pattern into a reusable hook"
```

**Standardize error handling:**
```
"Standardize error handling across all service files"
```

**Create configuration files:**
```
"Create .gitignore and .env.example files"
```

## Success Metrics

- [ ] No files over 300 lines
- [ ] DRY - no significant code duplication
- [ ] Consistent patterns across codebase
- [ ] .gitignore and .env.example exist
- [ ] Standardized error handling
- [ ] Reusable components extracted
- [ ] Custom hooks for common logic
- [ ] Configuration centralized

This subagent helps maintain code quality and prevents technical debt from accumulating.
