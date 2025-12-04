---
description: Generate utility functions for data transformation
---

# Generate Utilities Command

Generate utility functions for common data transformation, formatting, and helper operations.

## Usage

When invoked, gather these parameters:
1. **Utility Purpose** - What problem does it solve:
   - Date/time formatting
   - String manipulation
   - Number formatting
   - Array operations
   - Object transformation
   - Validation
   - API data transformation
2. **Input Types** - What data does it accept
3. **Output Type** - What does it return
4. **Pure Function** - Should be side-effect free

## Utility Generation Steps

### 1. Determine File Location

**General utilities:**
```
src/utils/index.ts         # General utilities
src/utils/date.ts          # Date-specific utilities
src/utils/format.ts        # Formatting utilities
src/utils/validation.ts    # Validation utilities
src/utils/api.ts           # API-related utilities
```

### 2. Create Utility Function

```typescript
/**
 * Brief description of what the utility does
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 */
export function utilityName(param1: Type1, param2: Type2): ReturnType {
  // Implementation
  return result;
}
```

## Common Utility Patterns

### 1. Date Formatting Utilities

```typescript
// src/utils/date.ts

import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param formatString - Format pattern (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatString: string = 'MMM dd, yyyy'): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, formatString);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return formatDistance(date, new Date(), { addSuffix: true });
}

/**
 * Format a date for display in a table cell
 * @param dateString - ISO date string
 * @returns Formatted date and time
 */
export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM dd, yyyy h:mm a');
}

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns True if date is in the past
 */
export function isPastDate(dateString: string): boolean {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    return false;
  }
  return date < new Date();
}

/**
 * Get a date range string (e.g., "Jan 1 - Jan 31, 2024")
 * @param startDate - ISO start date string
 * @param endDate - ISO end date string
 * @returns Formatted date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (!isValid(start) || !isValid(end)) {
    return 'Invalid date range';
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  } else if (sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  } else {
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  }
}
```

### 2. Number Formatting Utilities

```typescript
// src/utils/format.ts

/**
 * Format a number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a number as a percentage
 * @param value - Number between 0 and 1 (or 0 to 100 if isDecimal is false)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether value is already a decimal (default: true)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  isDecimal: boolean = true
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format a large number with abbreviations (K, M, B)
 * @param num - Number to format
 * @returns Abbreviated number string
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Format bytes to human-readable file size
 * @param bytes - Number of bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

### 3. String Utilities

```typescript
// src/utils/string.ts

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to title case
 * @param str - String to convert
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Truncate a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 50)
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number = 50, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert a string to kebab-case
 * @param str - String to convert
 * @returns Kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert a string to camelCase
 * @param str - String to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a slug from a string
 * @param str - String to slugify
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### 4. Array Utilities

```typescript
// src/utils/array.ts

/**
 * Group an array of objects by a key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort an array of objects by a key
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order (default: 'asc')
 * @returns Sorted array
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Remove duplicates from an array
 * @param array - Array with potential duplicates
 * @param key - Optional key for objects
 * @returns Array with unique values
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Chunk an array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle an array randomly
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 5. Validation Utilities

```typescript
// src/utils/validation.ts

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a URL
 * @param url - URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a phone number (US format)
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if a string is empty or only whitespace
 * @param str - String to check
 * @returns True if empty
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  // Calculate strength
  if (errors.length === 0) {
    if (password.length >= 14) strength = 'strong';
    else if (password.length >= 10) strength = 'good';
    else strength = 'fair';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}
```

### 6. Object Utilities

```typescript
// src/utils/object.ts

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Check if an object is empty
 * @param obj - Object to check
 * @returns True if empty
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Merge objects deeply
 * @param target - Target object
 * @param source - Source object
 * @returns Merged object
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key] as any, source[key] as any);
    } else {
      output[key] = source[key] as any;
    }
  }

  return output;
}
```

### 7. API Transformation Utilities

```typescript
// src/utils/api.ts

/**
 * Transform Laravel API errors to field-level errors
 * @param apiErrors - Laravel validation errors
 * @returns Field-level error object
 */
export function transformApiErrors(
  apiErrors: Record<string, string[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(apiErrors).forEach(key => {
    errors[key] = apiErrors[key][0]; // Take first error message
  });

  return errors;
}

/**
 * Build query string from params object
 * @param params - Query parameters
 * @returns Query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse API date strings to Date objects
 * @param obj - Object with date strings
 * @param dateKeys - Keys that contain dates
 * @returns Object with parsed dates
 */
export function parseApiDates<T extends Record<string, any>>(
  obj: T,
  dateKeys: (keyof T)[]
): T {
  const result = { ...obj };

  dateKeys.forEach(key => {
    if (result[key] && typeof result[key] === 'string') {
      result[key] = new Date(result[key] as string) as any;
    }
  });

  return result;
}
```

### 8. Class Name Utility (Already exists as cn)

```typescript
// src/lib/utils.ts (typically provided by shadcn/ui)

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Best Practices

### 1. Pure Functions
- No side effects
- Same input always produces same output
- Don't mutate inputs
- Easy to test

### 2. Type Safety
- Use TypeScript for all parameters and return types
- Use generics for reusable utilities
- Avoid `any` type
- Provide JSDoc comments

### 3. Error Handling
- Validate inputs
- Return sensible defaults for invalid inputs
- Document edge cases
- Consider throwing errors for truly exceptional cases

### 4. Performance
- Use memoization for expensive operations
- Avoid unnecessary object creation
- Consider caching for frequently called functions
- Profile if performance is critical

### 5. Documentation
- Add JSDoc comments
- Include usage examples
- Document parameters and return values
- Explain edge cases

### 6. Organization
- Group related utilities in same file
- Export all utilities
- Create index.ts for re-exports
- Keep utilities focused and single-purpose

## File Organization

```
src/utils/
├── index.ts              # Re-export all utilities
├── date.ts               # Date utilities
├── format.ts             # Formatting utilities
├── string.ts             # String manipulation
├── array.ts              # Array operations
├── object.ts             # Object utilities
├── validation.ts         # Validation functions
└── api.ts                # API helpers
```

**src/utils/index.ts:**
```typescript
export * from './date';
export * from './format';
export * from './string';
export * from './array';
export * from './object';
export * from './validation';
export * from './api';
```

## Example Invocations

**Date Formatting:**
"Generate a utility function to format dates for display in tables (formatDateTime)"

**String Manipulation:**
"Generate utilities for truncating strings and generating initials"

**Array Operations:**
"Generate a utility to group array items by a property"

**Validation:**
"Generate email and phone number validation utilities"

**API Helpers:**
"Generate a utility to transform Laravel validation errors to field-level errors"

## After Generation

1. Create utility file in src/utils/
2. Add TypeScript types for all parameters and returns
3. Add JSDoc comments
4. Export from src/utils/index.ts
5. Write unit tests (recommended)
6. Use in components
7. Consider edge cases and handle them
8. Update imports in components to use utilities
