---
description: Generate and maintain API documentation for Laravel backend endpoints
---

# API Documentation Generator Subagent

Automatically generate comprehensive API documentation for Laravel backend endpoints with request/response examples, TypeScript interfaces, and integration guides.

## Gap Addressed

**Current Status**: Only 1 service file (auth.ts) with limited inline documentation
**Goal**: Comprehensive API documentation for all endpoints
**Impact**: 4-5 hours saved per week, better team collaboration, reduced integration errors

## When to Use

Use this subagent when:
- Creating new API endpoints
- Adding new service classes
- Documenting existing undocumented APIs
- Updating API contracts
- Onboarding new team members
- Preparing for API versioning

## Documentation Formats

### 1. Markdown Documentation (Recommended)

**IMPORTANT**: Use the `docs-manager` skill to ensure proper documentation placement.

Create comprehensive markdown docs for each service:

**File**: `docs/api/endpoints/projects.md` (per docs-manager structure)

```markdown
# Projects API Documentation

Base URL: `${VITE_API_BASE_URL}/api/projects`

## Authentication

All endpoints require Bearer token authentication.

```http
Authorization: Bearer {token}
```

## Endpoints

### List Projects

Get a paginated list of projects with optional filtering.

**Endpoint**: `GET /api/projects`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| per_page | integer | No | Items per page (default: 15) |
| search | string | No | Search in name and description |
| status | string | No | Filter by status: `active`, `archived`, `completed` |
| sort_by | string | No | Sort field: `name`, `created_at`, `updated_at` |
| sort_order | string | No | Sort direction: `asc`, `desc` |

**Request Example**:

```http
GET /api/projects?page=1&per_page=10&status=active&sort_by=created_at&sort_order=desc
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": "proj_123",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "status": "active",
      "owner_id": "user_456",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-20T14:22:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 47
  }
}
```

**TypeScript Interface**:

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface ProjectsListResponse {
  data: Project[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

**Error Responses**:

`401 Unauthorized`:
```json
{
  "message": "Unauthenticated"
}
```

`422 Unprocessable Entity`:
```json
{
  "message": "The given data was invalid",
  "errors": {
    "status": ["Invalid status value"]
  }
}
```

---

### Get Project

Get a single project by ID.

**Endpoint**: `GET /api/projects/{id}`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Project ID |

**Request Example**:

```http
GET /api/projects/proj_123
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response** `200 OK`:

```json
{
  "data": {
    "id": "proj_123",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "owner_id": "user_456",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:22:00Z"
  }
}
```

**Error Responses**:

`404 Not Found`:
```json
{
  "message": "Project not found"
}
```

---

### Create Project

Create a new project.

**Endpoint**: `POST /api/projects`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Project name (max 255 chars) |
| description | string | Yes | Project description |
| status | string | No | Initial status (default: `active`) |

**TypeScript Interface**:

```typescript
interface CreateProjectRequest {
  name: string;
  description: string;
  status?: 'active' | 'archived' | 'completed';
}
```

**Request Example**:

```http
POST /api/projects
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "name": "Mobile App",
  "description": "New mobile application project",
  "status": "active"
}
```

**Response** `201 Created`:

```json
{
  "data": {
    "id": "proj_789",
    "name": "Mobile App",
    "description": "New mobile application project",
    "status": "active",
    "owner_id": "user_456",
    "created_at": "2025-01-22T09:15:00Z",
    "updated_at": "2025-01-22T09:15:00Z"
  },
  "message": "Project created successfully"
}
```

**Error Responses**:

`422 Unprocessable Entity`:
```json
{
  "message": "The given data was invalid",
  "errors": {
    "name": ["The name field is required"],
    "description": ["The description field is required"]
  }
}
```

---

### Update Project

Update an existing project.

**Endpoint**: `PUT /api/projects/{id}`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Project ID |

**Request Body** (all fields optional):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Project name |
| description | string | No | Project description |
| status | string | No | Project status |

**TypeScript Interface**:

```typescript
interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'archived' | 'completed';
}
```

**Request Example**:

```http
PUT /api/projects/proj_123
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "status": "completed"
}
```

**Response** `200 OK`:

```json
{
  "data": {
    "id": "proj_123",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "completed",
    "owner_id": "user_456",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-22T10:45:00Z"
  },
  "message": "Project updated successfully"
}
```

---

### Delete Project

Delete a project.

**Endpoint**: `DELETE /api/projects/{id}`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Project ID |

**Request Example**:

```http
DELETE /api/projects/proj_123
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response** `200 OK`:

```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses**:

`403 Forbidden`:
```json
{
  "message": "You are not authorized to delete this project"
}
```

`404 Not Found`:
```json
{
  "message": "Project not found"
}
```

---

## Frontend Integration

### Service Implementation

```typescript
// src/services/projects.ts
import { projectsService } from '@/services/projects';

// Get all projects
const projects = await projectsService.getAll({
  page: 1,
  perPage: 10,
  status: 'active'
});

// Get single project
const project = await projectsService.getById('proj_123');

// Create project
const newProject = await projectsService.create({
  name: 'New Project',
  description: 'Project description'
});

// Update project
const updated = await projectsService.update('proj_123', {
  status: 'completed'
});

// Delete project
await projectsService.delete('proj_123');
```

### Error Handling

```typescript
try {
  const project = await projectsService.create(data);
  toast.success('Project created successfully');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.errors) {
      // Field-level validation errors
      setFieldErrors(error.errors);
    } else {
      // General error
      toast.error(error.message);
    }
  }
}
```

---

## Rate Limiting

All API endpoints are rate limited to:
- **60 requests per minute** for authenticated users
- **10 requests per minute** for unauthenticated users

When rate limit is exceeded:

```json
{
  "message": "Too Many Attempts.",
  "retry_after": 42
}
```

---

## Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/` (implicitly v1). Future versions will use `/api/v2/` prefix.

---

## Changelog

### 2025-01-22
- Added `sort_by` and `sort_order` parameters to list endpoint
- Added pagination meta information

### 2025-01-15
- Initial release
- CRUD operations for projects
```

### 2. OpenAPI/Swagger Specification

Generate OpenAPI 3.0 spec for automatic API client generation:

**File**: `docs/api/openapi.yaml` (per docs-manager structure)

```yaml
openapi: 3.0.3
info:
  title: Social Media Management API
  description: API for managing social media posts, templates, and schedules
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com

servers:
  - url: http://localhost:8000/api
    description: Development server
  - url: https://api.example.com/api
    description: Production server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
          example: "proj_123"
        name:
          type: string
          example: "Website Redesign"
        description:
          type: string
          example: "Complete redesign of company website"
        status:
          type: string
          enum: [active, archived, completed]
          example: "active"
        owner_id:
          type: string
          example: "user_456"
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    CreateProjectRequest:
      type: object
      required:
        - name
        - description
      properties:
        name:
          type: string
          maxLength: 255
        description:
          type: string
        status:
          type: string
          enum: [active, archived, completed]
          default: "active"

    ApiError:
      type: object
      properties:
        message:
          type: string
        errors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string

paths:
  /projects:
    get:
      summary: List projects
      tags: [Projects]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 15
        - name: search
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, archived, completed]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
                  meta:
                    type: object
                    properties:
                      current_page:
                        type: integer
                      last_page:
                        type: integer
                      per_page:
                        type: integer
                      total:
                        type: integer

    post:
      summary: Create project
      tags: [Projects]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProjectRequest'
      responses:
        '201':
          description: Project created
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Project'
                  message:
                    type: string
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
```

### 3. Postman Collection

Generate Postman collection for manual API testing:

**File**: `docs/api/postman_collection.json`

```json
{
  "info": {
    "name": "Social Media Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Projects",
      "item": [
        {
          "name": "List Projects",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/projects?page=1&per_page=10&status=active",
              "host": ["{{base_url}}"],
              "path": ["api", "projects"],
              "query": [
                { "key": "page", "value": "1" },
                { "key": "per_page", "value": "10" },
                { "key": "status", "value": "active" }
              ]
            }
          }
        },
        {
          "name": "Create Project",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/projects",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"New Project\",\n  \"description\": \"Project description\",\n  \"status\": \"active\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "auth_token",
      "value": ""
    }
  ]
}
```

## Integration with Existing Skills

### With generate-api-service

When generating a new service:

```
"Generate a projectsService with API documentation"
```

This will:
1. Generate the service class
2. Generate markdown API docs
3. Generate TypeScript interfaces
4. Include request/response examples

### With generate-interfaces

```
"Generate Project interfaces with API documentation"
```

This will:
1. Generate TypeScript interfaces
2. Document each field
3. Include validation rules
4. Link to API endpoint docs

## Documentation Structure

```
docs/
└── api/
    ├── README.md                    # API overview and getting started
    ├── authentication.md            # Auth flow and token management
    ├── errors.md                    # Error codes and handling
    ├── rate-limiting.md             # Rate limit details
    ├── pagination.md                # Pagination conventions
    ├── projects.md                  # Projects API
    ├── posts.md                     # Posts API
    ├── templates.md                 # Templates API
    ├── users.md                     # Users API
    ├── openapi.yaml                 # OpenAPI specification
    └── postman_collection.json      # Postman collection
```

## Best Practices

### 1. Keep Docs in Sync
- Update docs when API changes
- Include version in docs
- Document breaking changes

### 2. Provide Examples
- Request examples for all endpoints
- Response examples for success and errors
- Code examples in TypeScript

### 3. Document Edge Cases
- Empty responses
- Pagination limits
- Rate limiting behavior
- Authentication failures

### 4. Include TypeScript Types
- Match interfaces to API responses exactly
- Document optional vs required fields
- Include discriminated unions

### 5. Error Documentation
- Document all error codes
- Provide error messages
- Include field-level validation errors

## Example Usage

**Document new API:**
```
"Generate API documentation for the posts service"
```

**Update existing docs:**
```
"Update the projects API docs to include new archive endpoint"
```

**Generate OpenAPI spec:**
```
"Generate OpenAPI specification for all endpoints"
```

**Create Postman collection:**
```
"Create Postman collection for manual API testing"
```

## Success Metrics

- [ ] All API endpoints documented
- [ ] OpenAPI spec generated
- [ ] Postman collection created
- [ ] TypeScript interfaces match API responses
- [ ] Frontend integration examples provided
- [ ] Docs are up to date
- [ ] Team uses docs for reference

This subagent ensures all API endpoints are well-documented, reducing integration errors and improving team collaboration.
