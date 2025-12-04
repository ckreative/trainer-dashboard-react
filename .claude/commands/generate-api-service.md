---
description: Generate API service for Laravel backend integration
---

# Generate API Service Command

Generate a TypeScript service class for Laravel backend API integration, following the established pattern from `src/services/auth.ts`.

## Usage

When invoked, gather these parameters:
1. **Service Name** (e.g., auth, projects, posts, templates, users)
2. **API Endpoints** - List of endpoints to implement:
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - Endpoint path
   - Request payload structure
   - Response structure
3. **Authentication Required** - Whether endpoints need Bearer token
4. **Resource Type** - The main data type being managed (User, Project, Post, etc.)

## Service Generation Steps

### 1. Define TypeScript Interfaces

Create interfaces for the data structures:

```typescript
// Response types
export interface {Resource} {
  id: string;
  // Resource properties based on API response
  createdAt?: Date;
  updatedAt?: Date;
}

// Request types
export interface Create{Resource}Request {
  // Properties needed to create resource
}

export interface Update{Resource}Request {
  // Properties needed to update resource
}

// API response wrapper (if Laravel uses one)
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Error type
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

### 2. Create Service Class Structure

```typescript
class {ServiceName}Service {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  // Private helper methods
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An error occurred',
      }));

      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        errors: errorData.errors,
      } as ApiError;
    }

    return response.json();
  }

  // Public API methods go here
}

// Export singleton instance
export const {serviceName}Service = new {ServiceName}Service();
```

### 3. Implement CRUD Methods

**GET All (List/Index):**
```typescript
async getAll(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{Resource}[]> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.perPage) queryParams.append('per_page', params.perPage.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);

  const queryString = queryParams.toString();
  const url = `${this.baseURL}/api/{resources}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: this.getAuthHeaders(),
  });

  const data = await this.handleResponse<ApiResponse<{Resource}[]>>(response);
  return data.data;
}
```

**GET One (Show):**
```typescript
async getById(id: string): Promise<{Resource}> {
  const response = await fetch(`${this.baseURL}/api/{resources}/${id}`, {
    method: 'GET',
    headers: this.getAuthHeaders(),
  });

  const data = await this.handleResponse<ApiResponse<{Resource}>>(response);
  return data.data;
}
```

**POST (Create):**
```typescript
async create(data: Create{Resource}Request): Promise<{Resource}> {
  const response = await fetch(`${this.baseURL}/api/{resources}`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await this.handleResponse<ApiResponse<{Resource}>>(response);
  return result.data;
}
```

**PUT/PATCH (Update):**
```typescript
async update(id: string, data: Update{Resource}Request): Promise<{Resource}> {
  const response = await fetch(`${this.baseURL}/api/{resources}/${id}`, {
    method: 'PUT', // or 'PATCH' for partial updates
    headers: this.getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await this.handleResponse<ApiResponse<{Resource}>>(response);
  return result.data;
}
```

**DELETE:**
```typescript
async delete(id: string): Promise<void> {
  const response = await fetch(`${this.baseURL}/api/{resources}/${id}`, {
    method: 'DELETE',
    headers: this.getAuthHeaders(),
  });

  await this.handleResponse<void>(response);
}
```

### 4. Add Custom Endpoints

For endpoints that don't follow REST conventions:

```typescript
async customAction(id: string, payload: any): Promise<any> {
  const response = await fetch(`${this.baseURL}/api/{resources}/${id}/custom-action`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return this.handleResponse(response);
}
```

### 5. Add Utility Methods

```typescript
// Check if user has auth token
isAuthenticated(): boolean {
  return this.getAuthToken() !== null;
}

// Store auth token (for auth service)
private setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Remove auth token (for auth service)
private removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}
```

## Complete Service Example

```typescript
// src/services/projects.ts

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status?: 'active' | 'archived' | 'completed';
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ProjectsService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'An error occurred',
      }));

      throw {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        errors: errorData.errors,
      } as ApiError;
    }

    return response.json();
  }

  async getAll(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
  }): Promise<Project[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('per_page', params.perPage.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `${this.baseURL}/api/projects${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<Project[]>>(response);
    return data.data;
  }

  async getById(id: string): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await this.handleResponse<ApiResponse<Project>>(response);
    return data.data;
  }

  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return result.data;
  }

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return result.data;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse<void>(response);
  }

  async archive(id: string): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}/archive`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);
    return result.data;
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }
}

export const projectsService = new ProjectsService();
```

## Authentication Service Pattern

For authentication-specific services, include these additional methods:

```typescript
class AuthService {
  // ... other methods ...

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<{ token: string; user: User }>(response);
    this.setAuthToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse<void>(response);
    this.removeAuthToken();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }
}
```

## File Upload Support

For services that need to upload files:

```typescript
async uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const token = this.getAuthToken();
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Note: Don't set Content-Type for FormData, browser sets it automatically

  const response = await fetch(`${this.baseURL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return this.handleResponse<{ url: string }>(response);
}
```

## Best Practices

### 1. Type Safety
- Define interfaces for all request/response types
- Use TypeScript generics for reusable methods
- Avoid `any` type

### 2. Error Handling
- Always use try/catch in components when calling service methods
- Provide meaningful error messages
- Handle different HTTP status codes appropriately
- Support Laravel validation error format (errors object)

### 3. Token Management
- Store tokens in localStorage (or httpOnly cookies for production)
- Include Bearer token in Authorization header for authenticated requests
- Remove token on logout

### 4. API Configuration
- Use environment variable for base URL
- Support different environments (dev, staging, prod)
- Centralize API configuration

### 5. Request/Response Handling
- Set proper Content-Type and Accept headers
- Parse JSON responses correctly
- Handle empty responses (204 No Content)
- Support query parameters for filtering/pagination

### 6. Singleton Pattern
- Export single instance for easy imports
- Maintain consistent state across app
- Share authentication state

## Using the Service in Components

```typescript
import { projectsService } from '@/services/projects';
import { toast } from 'sonner';

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getAll({ status: 'active' });
        setProjects(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await projectsService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  };

  // Component JSX
}
```

## Environment Configuration

Ensure `.env` file contains:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Example Invocations

**Basic CRUD Service:**
"Generate a projectsService for managing projects with CRUD operations"

**Custom Endpoints:**
"Generate a postsService with standard CRUD plus a publish endpoint and schedule endpoint"

**With File Upload:**
"Generate a templatesService with CRUD operations and image upload support"

**Related Resources:**
"Generate a commentsService that supports getting comments by post ID and creating nested comments"

## After Generation

1. Create the service file in `src/services/`
2. Define all TypeScript interfaces at the top
3. Implement the service class
4. Export singleton instance
5. Test with actual Laravel backend
6. Update components to use the service
7. Handle API errors appropriately in UI
8. Consider creating a Context provider if needed for global state
