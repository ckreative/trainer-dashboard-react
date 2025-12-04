---
description: Manage environment variables and configuration files
---

# Environment Configuration Manager Subagent

Manage environment variables, create config files, and ensure proper environment setup.

## Critical Gap Addressed

**Current Issues**:
- No .gitignore file (SECURITY RISK!)
- Only basic .env file (63 bytes)
- No .env.example template
- Environment variables not validated
- Docker setup needs proper env management

**Impact**: Prevents environment bugs, improves security, saves 1-2 hours/week

## Immediate Actions Required

### 1. Create .gitignore (CRITICAL!)

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

# Environment - NEVER COMMIT THESE
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

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

# Temporary
*.tmp
.cache/

# Package manager
.npm
.yarn/
.pnpm-debug.log*
```

### 2. Create .env.example

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# Upload Configuration
VITE_MAX_UPLOAD_SIZE=5242880

# Social Media (Optional)
VITE_FACEBOOK_APP_ID=
VITE_TWITTER_API_KEY=
VITE_INSTAGRAM_CLIENT_ID=

# Sentry (Optional)
VITE_SENTRY_DSN=
```

### 3. Create Environment Config

```typescript
// src/config/env.ts
interface EnvConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    debug: boolean;
  };
  upload: {
    maxSize: number;
    acceptedTypes: string[];
  };
  social?: {
    facebookAppId?: string;
    twitterApiKey?: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
    timeout: 30000,
  },
  features: {
    analytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    debug: getEnvVar('VITE_ENABLE_DEBUG', 'true') === 'true',
  },
  upload: {
    maxSize: parseInt(getEnvVar('VITE_MAX_UPLOAD_SIZE', '5242880')),
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  social: {
    facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID,
    twitterApiKey: import.meta.env.VITE_TWITTER_API_KEY,
  },
};

// Validate on startup
if (env.api.baseUrl.includes('undefined')) {
  console.error('API URL is not configured correctly!');
}
```

### 4. Environment-Specific Configs

```
.env                     # Never commit - local dev
.env.local              # Never commit - local overrides
.env.development        # Can commit - dev defaults
.env.staging            # Can commit - staging config
.env.production         # Can commit - prod config (no secrets!)
.env.example            # Must commit - template
```

### 5. Docker Environment

Update `docker-compose.yml`:
```yaml
services:
  react-app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    env_file:
      - .env.development
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}
      - NODE_ENV=development
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - /app/node_modules
```

### 6. Validation Script

```typescript
// scripts/validate-env.ts
import { env } from '../src/config/env';

function validateEnv() {
  const errors: string[] = [];

  // Required vars
  if (!env.api.baseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  }

  // URL format
  try {
    new URL(env.api.baseUrl);
  } catch {
    errors.push('VITE_API_BASE_URL must be a valid URL');
  }

  // Max upload size
  if (env.upload.maxSize < 0 || env.upload.maxSize > 10485760) {
    errors.push('VITE_MAX_UPLOAD_SIZE must be between 0 and 10MB');
  }

  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✓ Environment variables validated');
}

validateEnv();
```

Add to package.json:
```json
{
  "scripts": {
    "validate:env": "tsx scripts/validate-env.ts",
    "dev": "npm run validate:env && vite",
    "build": "npm run validate:env && vite build"
  }
}
```

## Best Practices

1. **Never commit secrets** - Use .gitignore
2. **Provide .env.example** - Template for team
3. **Validate on startup** - Fail fast if misconfigured
4. **Use TypeScript** - Type-safe access
5. **Document variables** - Comments in .env.example
6. **Prefix client vars** - VITE_ prefix for Vite
7. **Separate concerns** - Different files for different envs

## Integration with docker-setup-react

```
"Use env-config-manager to set up environment files for Docker"
```

## Success Metrics

- [ ] .gitignore exists and is comprehensive
- [ ] .env.example documented
- [ ] Environment validation on startup
- [ ] Type-safe env access
- [ ] No hardcoded URLs/keys
- [ ] Docker env configured
- [ ] Team onboarding easier

This subagent ensures secure, maintainable environment configuration.
