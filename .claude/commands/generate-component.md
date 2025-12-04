---
description: Generate React component following project patterns
---

# Generate Component Command

Generate a new React component following established project patterns with TypeScript, shadcn/ui integration, and proper error handling.

## Usage

When invoked, gather these parameters:
1. **Component Name** (PascalCase, e.g., UserProfile, PostEditor)
2. **Component Type**:
   - `page` - Full page component (goes in src/components/)
   - `feature` - Feature component (goes in src/components/)
   - `ui` - UI primitive (goes in src/components/ui/)
   - `auth` - Authentication screen (goes in src/components/auth/)
   - `form` - Form component (goes in src/components/)
3. **Include Options**:
   - State management (useState, useEffect)
   - Context integration (specify context name)
   - Service integration (specify service name)
   - Loading states
   - Error handling

## Component Generation Steps

### 1. Determine File Location
```
page/feature/form → src/components/{ComponentName}.tsx
ui → src/components/ui/{component-name}.tsx (kebab-case)
auth → src/components/auth/{ComponentName}.tsx
```

### 2. Generate TypeScript Interface
```typescript
interface {ComponentName}Props {
  // Props based on component requirements
  // Always include children?: React.ReactNode if it's a wrapper
  // Include callback props with proper typing: onSave?: (data: T) => void
}
```

### 3. Create Component Structure

**For Page/Feature Components:**
```typescript
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Other shadcn/ui imports as needed

interface {ComponentName}Props {
  // Props definition
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Event handlers
  const handleAction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Action logic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{Component Title}</CardTitle>
          <CardDescription>{Component description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Component content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**For UI Components:**
```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

interface {ComponentName}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Extend HTML attributes when appropriate
}

const {ComponentName} = React.forwardRef<HTMLDivElement, {ComponentName}Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("base-classes", className)}
      {...props}
    />
  )
);
{ComponentName}.displayName = "{ComponentName}";

export { {ComponentName} };
```

**For Auth Components:**
```typescript
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface {ComponentName}Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function {ComponentName}({ onSuccess, onCancel }: {ComponentName}Props) {
  const { /* auth methods */ } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Auth logic
      toast.success('Success message');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{Title}</CardTitle>
          <CardDescription>{Description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Add Context Integration (if requested)
```typescript
import { use{ContextName} } from '@/contexts/{ContextName}Context';

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  const { /* context values */ } = use{ContextName}();
  // Use context values in component
}
```

### 5. Add Service Integration (if requested)
```typescript
import { {serviceName}Service } from '@/services/{serviceName}';

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  const fetchData = async () => {
    try {
      const data = await {serviceName}Service.method();
      // Handle data
    } catch (error) {
      // Handle error
    }
  };
}
```

## Best Practices to Follow

### 1. TypeScript
- Define interface before component
- Use proper types for all props and state
- Avoid `any` type
- Use discriminated unions for variant types

### 2. shadcn/ui Components
- Import from `@/components/ui/`
- Use Card for containers
- Use Button with proper variants (default, outline, ghost, destructive)
- Use proper spacing with Tailwind classes

### 3. State Management
- Use `useState` for local state
- Use `useEffect` for side effects with proper dependencies
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed as props

### 4. Error Handling
- Always use try/catch for async operations
- Display errors with toast notifications (sonner)
- Provide error states in UI
- Include loading states for async operations

### 5. Styling
- Use Tailwind utility classes
- Use `cn()` helper for conditional classes
- Follow spacing conventions: `space-y-6` for vertical, `gap-4` for flex/grid
- Use semantic color classes: `text-muted-foreground`, `bg-destructive`, etc.

### 6. Accessibility
- Include proper ARIA labels
- Use semantic HTML elements
- Ensure keyboard navigation works
- Add loading states for screen readers

## Example Invocations

**Simple Page Component:**
"Generate a UserProfile page component with state management and error handling"

**Auth Component:**
"Generate a ChangePassword auth component that integrates with AuthContext"

**UI Component:**
"Generate a StatusBadge ui component that displays different statuses with colors"

**Feature with Service:**
"Generate a ProjectList feature component that uses projectService to fetch data"

## After Generation

1. Review the generated component for completeness
2. Add any missing imports
3. Update parent component to import and use the new component
4. If it's a page component, update App.tsx routing if needed
5. Test the component in the browser using Chrome DevTools MCP
