---
description: Set up Docker for React/Vite project with HMR support and automatic port conflict detection
---

You are setting up Docker for a React project with Vite. Follow these steps carefully:

## Step 1: Port Conflict Detection

1. Read the current Vite configuration to get the default port (usually 3000)
2. Check for port conflicts using bash commands:
   - Use `lsof -i :PORT` to check if the port is in use by any process
   - Use `docker ps --format '{{.Ports}}'` to check running Docker containers
3. Start from port 3000 and increment until you find an available port
4. Store the selected port for use in all configuration files
5. Inform the user which port was selected

## Step 2: Analyze Project Structure

1. Read `vite.config.ts` to understand the build configuration
2. Read `package.json` to understand dependencies and scripts
3. Check if Docker files already exist (warn before overwriting)

## Step 3: Create Dockerfile

Create a `Dockerfile` with multi-stage builds:

**Development Stage:**
- Use `node:20-alpine` as base
- Set working directory to `/app`
- Copy package files and install dependencies
- Expose the selected unique port
- Configure for HMR with proper Vite environment variables
- CMD to run `npm run dev -- --host`

**Production Stage:**
- Build optimized production bundle
- Use nginx:alpine to serve static files
- Copy build output to nginx html directory
- Expose port 80
- Efficient layer caching

## Step 4: Create docker-compose.yml

Create `docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  react-app:
    build:
      context: .
      target: development
    ports:
      - "[SELECTED_PORT]:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./index.html:/app/index.html
      - ./vite.config.ts:/app/vite.config.ts
      - /app/node_modules
    environment:
      - VITE_HMR_HOST=localhost
      - VITE_HMR_PORT=[SELECTED_PORT]
    stdin_open: true
    tty: true
```

Replace `[SELECTED_PORT]` with the unique port you detected.

## Step 5: Create .dockerignore

Create `.dockerignore` to optimize build context:

```
node_modules
npm-debug.log
.git
.gitignore
.DS_Store
build
dist
.env
.env.local
.vscode
.idea
*.md
!README.md
coverage
.cache
```

## Step 6: Create README-DOCKER.md

Create `README-DOCKER.md` with:

1. **Quick Start** section:
   - `docker-compose up --build` to build and start
   - Access URL with the selected port: `http://localhost:[PORT]`
   - `docker-compose down` to stop

2. **Available Commands** section:
   - Development: `docker-compose up`
   - Production build: `docker build --target production -t react-app-prod .`
   - Run production: `docker run -p 8080:80 react-app-prod`

3. **Features** section:
   - Hot Module Replacement (HMR) enabled
   - Volume mounting for instant code updates
   - Multi-stage builds for optimization
   - Port conflict detection (explain the assigned port)

4. **Troubleshooting** section:
   - HMR not working? Check VITE_HMR_* environment variables
   - Port conflicts? The command automatically selected port [PORT]
   - Permission issues? Use `docker-compose down -v` to reset

## Step 7: Summary Output

After creating all files, provide a summary:

```
✅ Docker setup complete!

Files created:
- Dockerfile (multi-stage: dev + production)
- docker-compose.yml (HMR enabled)
- .dockerignore (optimized build context)
- README-DOCKER.md (usage guide)

🔧 Port Configuration:
- Selected port: [PORT] (no conflicts detected)
- Your app will run at: http://localhost:[PORT]

🚀 Next steps:
1. docker-compose up --build
2. Open http://localhost:[PORT]
3. Start coding with HMR!

📝 See README-DOCKER.md for more details.
```

## Important Notes

- Always check for port conflicts before assigning ports
- Preserve HMR functionality with proper volume mounting
- Use `--host` flag in Vite dev server for Docker networking
- Set VITE_HMR_* environment variables for proper HMR in containers
- Warn if files already exist before overwriting
- Use Node 20-alpine for smaller image size
- Exclude node_modules from volume mounting (use named volume instead)
