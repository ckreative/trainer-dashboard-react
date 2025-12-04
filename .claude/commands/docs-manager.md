# Documentation Manager Skill

## Purpose
Manages all project documentation with proper organization, ensuring consistent structure and discoverability.

## When to Use This Skill
- Creating API documentation
- Writing testing reports
- Documenting deployment procedures
- Creating development guides
- Writing architecture documentation
- Any documentation task

## Documentation Structure

All documentation should follow this standardized structure:

```
docs/
├── api/                          # API documentation
│   ├── endpoints/               # Individual endpoint docs
│   ├── authentication.md        # Auth documentation
│   └── openapi.yaml            # OpenAPI spec
├── backend/                     # Backend-specific docs
│   ├── requirements.md         # Backend API requirements
│   ├── database-schema.md      # Database documentation
│   └── deployment.md           # Backend deployment
├── frontend/                    # Frontend-specific docs
│   ├── components.md           # Component library
│   ├── state-management.md    # State patterns
│   └── styling-guide.md        # UI/styling conventions
├── testing/                     # Testing documentation
│   ├── test-reports/           # Test execution reports
│   │   ├── authentication.md
│   │   └── user-management.md
│   ├── test-strategy.md        # Testing approach
│   └── coverage-reports/       # Coverage data
├── deployment/                  # Deployment documentation
│   ├── docker.md               # Docker setup
│   ├── ci-cd.md               # CI/CD pipeline
│   └── environments.md         # Environment configs
├── development/                 # Development guides
│   ├── getting-started.md      # Setup instructions
│   ├── auth-setup.md          # Auth system setup
│   ├── contributing.md         # Contribution guide
│   └── coding-standards.md     # Code conventions
└── architecture/                # Architecture docs
    ├── system-overview.md      # High-level architecture
    ├── data-flow.md           # Data flow diagrams
    └── decisions/             # Architecture Decision Records (ADRs)
```

## Documentation Placement Rules

### 1. Backend Requirements
**Location**: `docs/backend/requirements.md`
**When**: Creating API specifications for backend developers
**Example**: BACKEND_REQUIREMENTS.md → docs/backend/requirements.md

### 2. Test Reports
**Location**: `docs/testing/test-reports/{feature-name}.md`
**When**: Documenting test results for a specific feature
**Example**: AUTHENTICATION_TEST_REPORT.md → docs/testing/test-reports/authentication.md

### 3. API Documentation
**Location**: `docs/api/endpoints/{resource-name}.md`
**When**: Documenting API endpoints for a specific resource
**Example**: Projects API docs → docs/api/endpoints/projects.md

### 4. Deployment Guides
**Location**: `docs/deployment/{topic}.md`
**When**: Creating deployment instructions
**Example**: README-DOCKER.md → docs/deployment/docker.md

### 5. Development Setup
**Location**: `docs/development/{topic}.md`
**When**: Creating developer onboarding or setup guides
**Example**: AUTH_SETUP.md → docs/development/auth-setup.md

### 6. Architecture Documentation
**Location**: `docs/architecture/{topic}.md`
**When**: Documenting system design decisions
**Example**: Component architecture → docs/architecture/component-structure.md

## Workflow

When Claude needs to create documentation:

1. **Identify document type** (backend, API, testing, deployment, development, architecture)
2. **Determine proper location** using the structure above
3. **Create directory if needed** (e.g., `docs/backend/` if it doesn't exist)
4. **Write documentation** to the correct path
5. **Update README.md** with a link to the new documentation if relevant

## Migration of Existing Docs

If documentation exists in the wrong location:

1. Read the existing file
2. Determine correct location based on content type
3. Create proper directory structure
4. Write file to new location
5. Delete old file (or notify user if uncertain)
6. Update any references in other files

## Documentation Templates

### Backend Requirements Template
```markdown
# {Feature} Backend Requirements

**Project**: Concrete Kreative Management Platform
**Frontend**: React + TypeScript
**Backend**: Laravel (PHP)
**Date**: {Date}
**Status**: {Ready for Implementation | In Progress | Completed}

## Overview
Brief description of what needs to be implemented

## API Endpoints
### 1. {Endpoint Name}
**Endpoint**: `{METHOD} /api/{path}`
**Purpose**: {Description}
**Request Body**: {JSON example}
**Success Response**: {JSON example}
**Error Responses**: {JSON examples}
**Laravel Implementation**: {Code example}
```

### Test Report Template
```markdown
# {Feature} Test Report

**Date**: {Date}
**Status**: {Pass | Fail | Pending}

## Test Summary
- Total Tests: {number}
- Passed: {number}
- Failed: {number}
- Coverage: {percentage}

## Test Results
### {Test Suite Name}
- ✅ Test case 1
- ❌ Test case 2 (reason for failure)

## Issues Found
1. {Issue description}
2. {Issue description}

## Next Steps
- [ ] Task 1
- [ ] Task 2
```

## Integration with Other Skills

### api-docs-generator
When `api-docs-generator` creates API documentation, it should:
- Place endpoint docs in `docs/api/endpoints/`
- Place OpenAPI spec in `docs/api/openapi.yaml`
- Place authentication docs in `docs/api/authentication.md`

### test-generator
When `test-generator` creates test reports, it should:
- Place reports in `docs/testing/test-reports/`
- Update `docs/testing/test-strategy.md` if test approach changes
- Link to coverage reports in `docs/testing/coverage-reports/`

### refactor-assistant
When `refactor-assistant` documents refactoring decisions:
- Place in `docs/architecture/decisions/`
- Use ADR format (Architecture Decision Record)

## Example Usage

**User Request**: "Create backend requirements for the user management API"

**Claude Action**:
1. Identifies this as backend documentation
2. Determines path: `docs/backend/requirements.md` (or `user-management-requirements.md` if requirements.md exists)
3. Creates `docs/backend/` directory if needed
4. Writes comprehensive backend requirements
5. Updates README.md with link to new documentation

**User Request**: "Document the test results for the authentication system"

**Claude Action**:
1. Identifies this as a test report
2. Determines path: `docs/testing/test-reports/authentication.md`
3. Creates directory structure if needed
4. Writes test report using template
5. Links to coverage report if available

## Benefits

1. **Discoverability**: Developers know exactly where to find documentation
2. **Consistency**: All docs follow the same organizational pattern
3. **Scalability**: Structure supports growing documentation needs
4. **Maintainability**: Easy to update and refactor documentation
5. **Professional**: Industry-standard documentation organization

## Notes

- Always create directories before writing files
- Use lowercase with hyphens for file names (e.g., `user-management.md`)
- Keep README.md in project root as the main entry point
- Link from README.md to `docs/` for detailed documentation
- Use relative links within documentation for cross-references
- Add timestamps to test reports and requirements documents
