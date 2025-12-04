---
description: Generate React Context with Provider and custom hook
---

# Generate Context Command

Generate a React Context provider with custom hook for global state management, following the pattern established in `src/contexts/AuthContext.tsx`.

## Usage

When invoked, gather these parameters:
1. **Context Name** (e.g., Auth, Theme, Projects, Templates)
2. **State Data** - What data should be stored:
   - Simple values (strings, numbers, booleans)
   - Complex objects (user, settings, data collections)
   - Loading/error states
3. **Actions** - Methods to expose:
   - CRUD operations
   - State updates
   - API calls
4. **Initial State** - Default values
5. **Persistence** - Should state persist in localStorage?
6. **Service Integration** - Does it need to call API service?

## Context Generation Steps

### 1. Define Context Type Interface

```typescript
export interface {ContextName}ContextType {
  // State values
  data: {DataType} | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetch{Data}: () => Promise<void>;
  create{Data}: (data: Create{Data}Request) => Promise<void>;
  update{Data}: (id: string, data: Update{Data}Request) => Promise<void>;
  delete{Data}: (id: string) => Promise<void>;
  refresh: () => Promise<void>;

  // Other methods as needed
}
```

### 2. Create Context with Default Value

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const {ContextName}Context = createContext<{ContextName}ContextType | undefined>(undefined);
```

### 3. Create Provider Component

```typescript
interface {ContextName}ProviderProps {
  children: ReactNode;
}

export function {ContextName}Provider({ children }: {ContextName}ProviderProps) {
  // State
  const [data, setData] = useState<{DataType} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load from localStorage if persistence enabled
      const cached = localStorage.getItem('{context_name}_data');
      if (cached) {
        setData(JSON.parse(cached));
      }

      // Or fetch from API
      // const result = await {service}.getData();
      // setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Actions
  const fetch{Data} = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch data from API
      const result = await {service}.getAll();
      setData(result);

      // Persist if needed
      localStorage.setItem('{context_name}_data', JSON.stringify(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const create{Data} = async (newData: Create{Data}Request) => {
    try {
      const created = await {service}.create(newData);
      // Update local state
      setData(prevData => prevData ? [...prevData, created] : [created]);
    } catch (err) {
      throw err;
    }
  };

  const update{Data} = async (id: string, updates: Update{Data}Request) => {
    try {
      const updated = await {service}.update(id, updates);
      // Update local state
      setData(prevData =>
        prevData
          ? prevData.map(item => item.id === id ? updated : item)
          : null
      );
    } catch (err) {
      throw err;
    }
  };

  const delete{Data} = async (id: string) => {
    try {
      await {service}.delete(id);
      // Update local state
      setData(prevData =>
        prevData ? prevData.filter(item => item.id !== id) : null
      );
    } catch (err) {
      throw err;
    }
  };

  const refresh = async () => {
    await fetch{Data}();
  };

  const value: {ContextName}ContextType = {
    data,
    isLoading,
    error,
    fetch{Data},
    create{Data},
    update{Data},
    delete{Data},
    refresh,
  };

  return (
    <{ContextName}Context.Provider value={value}>
      {children}
    </{ContextName}Context.Provider>
  );
}
```

### 4. Create Custom Hook

```typescript
export function use{ContextName}() {
  const context = useContext({ContextName}Context);

  if (context === undefined) {
    throw new Error('use{ContextName} must be used within a {ContextName}Provider');
  }

  return context;
}
```

## Complete Context Example

```typescript
// src/contexts/ProjectsContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectsService, Project, CreateProjectRequest, UpdateProjectRequest } from '@/services/projects';

export interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  refresh: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

interface ProjectsProviderProps {
  children: ReactNode;
}

export function ProjectsProvider({ children }: ProjectsProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (data: CreateProjectRequest) => {
    try {
      const created = await projectsService.create(data);
      setProjects(prev => [...prev, created]);
    } catch (err) {
      throw err;
    }
  };

  const updateProject = async (id: string, data: UpdateProjectRequest) => {
    try {
      const updated = await projectsService.update(id, data);
      setProjects(prev =>
        prev.map(project => project.id === id ? updated : project)
      );
    } catch (err) {
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsService.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const refresh = async () => {
    await fetchProjects();
  };

  const value: ProjectsContextType = {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refresh,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }

  return context;
}
```

## Context Patterns

### 1. Simple State Context (No API)

For UI state like theme or settings:

```typescript
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 2. Authentication Context

Special pattern for auth with token management:

```typescript
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token invalid, clear it
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await authService.login(email, password);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. Filtered/Computed State Context

Context with derived/computed values:

```typescript
export interface TasksContextType {
  tasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  isLoading: boolean;
  // ... actions
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const completedTasks = useMemo(() =>
    tasks.filter(task => task.status === 'completed'),
    [tasks]
  );

  const pendingTasks = useMemo(() =>
    tasks.filter(task => task.status === 'pending'),
    [tasks]
  );

  const value: TasksContextType = {
    tasks,
    completedTasks,
    pendingTasks,
    isLoading,
    // ... actions
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}
```

### 4. Nested Contexts

For complex apps, contexts can depend on each other:

```typescript
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Depends on AuthContext

  useEffect(() => {
    if (user) {
      // Subscribe to notifications for this user
    }
  }, [user]);

  // Rest of provider
}
```

## Integrating Context in App

### 1. Wrap App with Provider

```typescript
// App.tsx or main.tsx
import { AuthProvider } from './contexts/AuthContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProjectsProvider>
          {/* Your app components */}
        </ProjectsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 2. Use in Components

```typescript
import { useProjects } from '@/contexts/ProjectsContext';
import { toast } from 'sonner';

function ProjectsList() {
  const { projects, isLoading, deleteProject } = useProjects();

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          {project.name}
          <button onClick={() => handleDelete(project.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Context Organization
- One context per domain/feature (Auth, Projects, Settings, etc.)
- Keep contexts focused and single-purpose
- Avoid creating one giant "App Context"

### 2. Performance Optimization
- Use `useMemo` for computed values
- Use `useCallback` for action functions if they're used as dependencies
- Consider splitting large contexts if only parts are used

### 3. Error Handling
- Always include error state in context
- Let components handle displaying errors
- Throw errors from actions for component try/catch

### 4. Type Safety
- Always define TypeScript interface for context type
- Export interfaces for use in components
- Avoid `any` type

### 5. Initial Loading
- Include `isLoading` state
- Check auth or load data on mount
- Show loading UI while initializing

### 6. localStorage Integration
- Persist important state (theme, preferences)
- Clear localStorage on logout
- Handle JSON parse errors

### 7. Custom Hook Pattern
- Always create a custom `use{ContextName}` hook
- Throw error if used outside provider
- Makes the API cleaner for consumers

## Testing Contexts

Consider adding test utilities:

```typescript
// For testing
export function {ContextName}ProviderMock({
  children,
  mockData,
}: {
  children: ReactNode;
  mockData?: Partial<{ContextName}ContextType>;
}) {
  const value: {ContextName}ContextType = {
    data: mockData?.data || [],
    isLoading: mockData?.isLoading || false,
    error: mockData?.error || null,
    // ... mock all required functions
  };

  return (
    <{ContextName}Context.Provider value={value}>
      {children}
    </{ContextName}Context.Provider>
  );
}
```

## Example Invocations

**Resource Management:**
"Generate a ProjectsContext that manages projects with CRUD operations using projectsService"

**Simple State:**
"Generate a ThemeContext for managing light/dark theme with localStorage persistence"

**Authentication:**
"Generate an AuthContext with login, logout, and user state management"

**Settings:**
"Generate a SettingsContext for user preferences with localStorage persistence"

**Filtered Data:**
"Generate a TasksContext with computed properties for completed and pending tasks"

## After Generation

1. Create context file in `src/contexts/`
2. Import and wrap App with Provider in App.tsx or main.tsx
3. Use custom hook in components
4. Test context actions work correctly
5. Verify error states display properly
6. Check loading states work as expected
7. Test localStorage persistence if applicable
