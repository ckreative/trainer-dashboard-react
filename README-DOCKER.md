# Docker Setup for React + Vite Application

This project includes a complete Docker setup with Hot Module Replacement (HMR) support for development and optimized production builds.

## Quick Start

### Development Mode

1. **Build and start the development container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

## Available Commands

### Development

Start the development server with HMR enabled:
```bash
docker-compose up
```

Rebuild and start (useful after dependency changes):
```bash
docker-compose up --build
```

Run in detached mode (background):
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

### Production

Build the production image:
```bash
docker build --target production -t react-app-prod .
```

Run the production container:
```bash
docker run -p 8080:80 react-app-prod
```

Access the production build at: `http://localhost:8080`

### Cleanup

Stop and remove containers:
```bash
docker-compose down
```

Remove containers and volumes:
```bash
docker-compose down -v
```

Remove all Docker images for this project:
```bash
docker rmi $(docker images -q react-app*)
```

## Features

### Hot Module Replacement (HMR)
- **Instant updates:** Changes to your code are reflected in the browser without a full reload
- **Volume mounting:** Source files are mounted directly into the container
- **Proper networking:** Configured with `VITE_HMR_HOST` and `VITE_HMR_PORT` for Docker environments

### Multi-Stage Builds
- **Development stage:** Full Node.js environment with dev dependencies
- **Build stage:** Optimized build process
- **Production stage:** Lightweight nginx serving static files

### Port Configuration
- **Selected port:** 3000 (automatically detected, no conflicts found)
- **Development:** Accessible at `http://localhost:3000`
- **Production:** Configurable (default example uses port 8080)

### Optimized Docker Setup
- **Small image size:** Using `node:20-alpine` base image
- **Fast builds:** Efficient layer caching with separate dependency installation
- **Clean context:** `.dockerignore` excludes unnecessary files

## File Structure

```
.
├── Dockerfile              # Multi-stage Docker configuration
├── docker-compose.yml      # Development orchestration
├── .dockerignore          # Build context exclusions
└── README-DOCKER.md       # This file
```

## Configuration Details

### Development Environment Variables

The following environment variables are set for HMR:

- `VITE_HMR_HOST=localhost`: Enables HMR to work through Docker networking
- `VITE_HMR_PORT=3000`: Matches the exposed port for WebSocket connections

### Volume Mounts

The following directories are mounted for live updates:

- `./src` → `/app/src`: Source code
- `./public` → `/app/public`: Static assets
- `./index.html` → `/app/index.html`: Entry HTML file
- `./vite.config.ts` → `/app/vite.config.ts`: Vite configuration

**Important:** `node_modules` is preserved in the container (not mounted) to prevent conflicts between host and container dependencies.

## Troubleshooting

### HMR Not Working

If Hot Module Replacement isn't working:

1. Check that environment variables are set:
   ```bash
   docker-compose exec react-app env | grep VITE_HMR
   ```

2. Verify the Vite dev server is running with `--host` flag
3. Ensure ports are properly mapped in `docker-compose.yml`

### Port Conflicts

The setup automatically selected port **3000** (no conflicts detected at setup time).

If you encounter port conflicts later:

1. Check what's using the port:
   ```bash
   lsof -i :3000
   ```

2. Update the port mapping in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change host port (left side)
   ```

3. Update environment variables if needed:
   ```yaml
   environment:
     - VITE_HMR_PORT=3001
   ```

### Permission Issues

If you encounter permission errors:

```bash
docker-compose down -v
docker-compose up --build
```

### Container Not Starting

Check logs for errors:
```bash
docker-compose logs
```

Ensure Docker daemon is running:
```bash
docker ps
```

### Changes Not Reflecting

1. Verify volumes are mounted correctly:
   ```bash
   docker-compose exec react-app ls -la /app/src
   ```

2. Restart the container:
   ```bash
   docker-compose restart
   ```

3. Rebuild if dependencies changed:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## Production Deployment

For production deployments:

1. Build the production image:
   ```bash
   docker build --target production -t myapp:latest .
   ```

2. Test locally:
   ```bash
   docker run -p 8080:80 myapp:latest
   ```

3. Push to registry (if using):
   ```bash
   docker tag myapp:latest registry.example.com/myapp:latest
   docker push registry.example.com/myapp:latest
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Documentation](https://react.dev/)

## Support

For issues specific to this Docker setup, check:
1. Docker daemon is running
2. Ports are available
3. Dependencies are up to date
4. Volume mounts are correct

For application-specific issues, refer to the main project README.
