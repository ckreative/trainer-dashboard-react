---
description: Generate React Hook Form with shadcn/ui Form components
---

# Generate Form Command

Generate a React Hook Form integrated with shadcn/ui Form components, following established patterns from the authentication screens.

## Usage

When invoked, gather these parameters:
1. **Form Name** (PascalCase, e.g., UserRegistrationForm, ProjectEditForm)
2. **Form Fields** - List of fields with types:
   - text (Input)
   - email (Input with type="email")
   - password (Input with type="password")
   - textarea (Textarea)
   - select (Select)
   - checkbox (Checkbox)
   - radio (RadioGroup)
   - date (date picker if available)
3. **Validation Requirements** - Required fields, min/max length, patterns, custom validation
4. **Submit Action** - What happens on submit (API call, context method, callback)
5. **Additional Features**:
   - Loading states
   - Success/error toast notifications
   - Password strength indicator (for password fields)
   - Confirmation fields (e.g., password confirmation)
   - Show/hide password toggle

## Form Generation Steps

### 1. Import Required Dependencies

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
// Add other UI component imports as needed based on fields
```

### 2. Define Form Interface

```typescript
interface {FormName}Props {
  onSubmit: (data: FormData) => Promise<void> | void;
  onCancel?: () => void;
  initialData?: Partial<FormData>;
  isLoading?: boolean;
}

interface FormData {
  // Define fields based on requirements
  [fieldName]: string | number | boolean;
}
```

### 3. Create Form Component Structure

**Basic Pattern (for simple forms without React Hook Form library):**

```typescript
export function {FormName}({
  onSubmit,
  onCancel,
  initialData,
  isLoading: externalLoading
}: {FormName}Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for each field
  const [fieldName, setFieldName] = useState(initialData?.fieldName ?? '');

  const loading = externalLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!fieldName.trim()) {
      newErrors.fieldName = 'Field is required';
    }

    // Add more validation as needed

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        fieldName,
        // other fields
      });
      toast.success('Form submitted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{Form Title}</CardTitle>
        <CardDescription>{Form description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields here */}

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 4. Generate Form Fields

**Text Input Field:**
```typescript
<div className="space-y-2">
  <Label htmlFor="fieldName">Field Label</Label>
  <Input
    id="fieldName"
    type="text"
    value={fieldName}
    onChange={(e) => setFieldName(e.target.value)}
    placeholder="Enter field value"
    disabled={loading}
    className={errors.fieldName ? 'border-destructive' : ''}
  />
  {errors.fieldName && (
    <p className="text-sm text-destructive">{errors.fieldName}</p>
  )}
</div>
```

**Email Input Field:**
```typescript
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    disabled={loading}
    className={errors.email ? 'border-destructive' : ''}
  />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email}</p>
  )}
</div>
```

**Password Field with Show/Hide Toggle:**
```typescript
const [showPassword, setShowPassword] = useState(false);

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter password"
      disabled={loading}
      className={errors.password ? 'border-destructive' : ''}
    />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={() => setShowPassword(!showPassword)}
      disabled={loading}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  </div>
  {errors.password && (
    <p className="text-sm text-destructive">{errors.password}</p>
  )}
</div>
```

**Password Field with Strength Indicator:**
```typescript
const getPasswordStrength = (pass: string) => {
  if (pass.length === 0) return { strength: 0, label: '', color: 'bg-gray-200' };
  if (pass.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
  if (pass.length < 10) return { strength: 50, label: 'Fair', color: 'bg-orange-500' };
  if (pass.length < 14) return { strength: 75, label: 'Good', color: 'bg-yellow-500' };
  return { strength: 100, label: 'Strong', color: 'bg-green-500' };
};

const passwordStrength = getPasswordStrength(password);

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Create a strong password"
    disabled={loading}
  />
  {password && (
    <div className="space-y-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${passwordStrength.color}`}
          style={{ width: `${passwordStrength.strength}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: {passwordStrength.label}
      </p>
    </div>
  )}
</div>
```

**Textarea Field:**
```typescript
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea
    id="description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Enter description"
    disabled={loading}
    rows={4}
    className={errors.description ? 'border-destructive' : ''}
  />
  {errors.description && (
    <p className="text-sm text-destructive">{errors.description}</p>
  )}
</div>
```

**Checkbox Field:**
```typescript
<div className="flex items-center space-x-2">
  <Checkbox
    id="rememberMe"
    checked={rememberMe}
    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
    disabled={loading}
  />
  <Label
    htmlFor="rememberMe"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Remember me
  </Label>
</div>
```

**Select Field (if needed):**
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<div className="space-y-2">
  <Label htmlFor="category">Category</Label>
  <Select value={category} onValueChange={setCategory} disabled={loading}>
    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
      <SelectValue placeholder="Select a category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3">Option 3</SelectItem>
    </SelectContent>
  </Select>
  {errors.category && (
    <p className="text-sm text-destructive">{errors.category}</p>
  )}
</div>
```

### 5. Add Validation Logic

**Common Validation Patterns:**

```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Required field
  if (!fieldName.trim()) {
    newErrors.fieldName = 'This field is required';
  }

  // Email validation
  if (!email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!password) {
    newErrors.password = 'Password is required';
  } else if (password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }

  // Password confirmation
  if (password !== passwordConfirmation) {
    newErrors.passwordConfirmation = 'Passwords do not match';
  }

  // Min/max length
  if (fieldName.length < 3) {
    newErrors.fieldName = 'Must be at least 3 characters';
  }
  if (fieldName.length > 50) {
    newErrors.fieldName = 'Must be no more than 50 characters';
  }

  // URL validation
  if (url && !/^https?:\/\/.+/.test(url)) {
    newErrors.url = 'Please enter a valid URL';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  // Continue with submission
};
```

### 6. Add Success/Error Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  setIsLoading(true);
  try {
    await onSubmit(formData);
    toast.success('Form submitted successfully');
    // Optionally reset form
    // resetForm();
  } catch (error) {
    if (error instanceof Error) {
      // Check for field-specific errors from API
      if ('errors' in error && typeof error.errors === 'object') {
        setErrors(error.errors as Record<string, string>);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('An unexpected error occurred');
    }
  } finally {
    setIsLoading(false);
  }
};
```

## Form Patterns

### 1. Standalone Form Component
Use when form is the main focus of a page or dialog.

### 2. Inline Form (within another component)
Keep form logic in parent component, create smaller field components.

### 3. Multi-step Form
Use state to track current step, conditional rendering for each step.

### 4. Dialog Form
Wrap form in Dialog component for modal editing.

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Form Title</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  </DialogContent>
</Dialog>
```

## Best Practices

### 1. Validation
- Validate on submit, not on every keystroke (for better UX)
- Show field-level errors below each field
- Clear errors when user starts typing in a field
- Support both client-side and server-side validation errors

### 2. Loading States
- Disable all inputs and buttons during submission
- Show loading text on submit button
- Prevent form resubmission

### 3. Error Display
- Use toast notifications for general success/error messages
- Use field-level error messages for validation errors
- Use `text-destructive` color for errors
- Add `border-destructive` to invalid fields

### 4. Accessibility
- Always use Label with htmlFor matching input id
- Include placeholder text for guidance
- Maintain logical tab order
- Support keyboard navigation

### 5. User Experience
- Provide clear feedback on submission
- Reset form on success if appropriate
- Handle API errors gracefully
- Show password toggle for password fields
- Show password strength for new password fields
- Auto-focus first field when form opens

## Example Invocations

**Registration Form:**
"Generate a UserRegistrationForm with fields: name, email, password, password confirmation. Include password strength indicator and email validation."

**Edit Form:**
"Generate a ProjectEditForm with fields: title, description (textarea), status (select). Support initial data and include cancel button."

**Login Form:**
"Generate a LoginForm with email and password fields, remember me checkbox, and show/hide password toggle."

**Contact Form:**
"Generate a ContactForm with name, email, subject, and message (textarea). Include validation and toast notifications."

## After Generation

1. Review generated validation logic
2. Test form submission with valid and invalid data
3. Verify error messages display correctly
4. Test loading states
5. Ensure toast notifications appear
6. Verify form integrates with parent component or API service
7. Test in browser using Chrome DevTools MCP
