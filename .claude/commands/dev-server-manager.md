# Development Server Manager Skill

## Purpose
Manages development server operations with reliable port detection, startup verification, and status monitoring.

## When to Use This Skill
- Starting the development server
- Verifying server is running
- Detecting the correct port
- Checking server health
- Before UI verification tasks
- Before browser automation tasks

## Port Detection Algorithm

### 1. Check vite.config.ts (or similar config file)
```typescript
// Read vite.config.ts and extract port from:
server: {
  port: 3000,  // ← Extract this value
  // ...
}
```

### 2. Check package.json scripts
```json
{
  "scripts": {
    "dev": "vite --port 3000"  // ← Extract port from CLI flag
  }
}
```

### 3. Check .env files
```
VITE_PORT=3000
PORT=3000
```

### 4. Check Running Processes
```bash
# Check what ports are actually in use
lsof -i :3000 -i :5173 -i :8080
# Or check all node processes
ps aux | grep "vite\|webpack\|next"
```

### 5. Parse Server Output
```bash
# Look for patterns in dev server output:
"Local:   http://localhost:3000"
"ready in 234 ms"
"VITE v6.3.5  ready in 234 ms"
```

### 6. Default Fallback
If all above fail, use framework defaults:
- Vite: 5173
- Next.js: 3000
- Create React App: 3000
- Vue CLI: 8080

## Workflow

### Starting the Dev Server

```typescript
interface DevServerInfo {
  port: number;
  url: string;
  isRunning: boolean;
  framework: 'vite' | 'next' | 'cra' | 'other';
  startCommand: string;
}

async function startDevServer(): Promise<DevServerInfo> {
  // 1. Detect configuration
  const configuredPort = await detectConfiguredPort();

  // 2. Check if already running
  const runningPort = await checkRunningServer(configuredPort);

  if (runningPort) {
    return {
      port: runningPort,
      url: `http://localhost:${runningPort}`,
      isRunning: true,
      framework: detectFramework(),
      startCommand: getStartCommand()
    };
  }

  // 3. Start the server
  await executeCommand(getStartCommand());

  // 4. Wait for server to be ready
  await waitForServer(configuredPort);

  // 5. Verify port
  const actualPort = await verifyServerPort(configuredPort);

  return {
    port: actualPort,
    url: `http://localhost:${actualPort}`,
    isRunning: true,
    framework: detectFramework(),
    startCommand: getStartCommand()
  };
}
```

### Port Detection Steps (Detailed)

#### Step 1: Read vite.config.ts
```bash
# Check if vite.config.ts exists
if [ -f "vite.config.ts" ]; then
  # Extract port using grep/sed
  PORT=$(grep -A 5 "server:" vite.config.ts | grep "port:" | sed 's/[^0-9]//g')
fi
```

#### Step 2: Check package.json
```bash
# Extract port from dev script
PORT=$(grep '"dev"' package.json | grep -o -- '--port [0-9]*' | awk '{print $2}')
```

#### Step 3: Check Running Processes
```bash
# Check if server is already running on common ports
for port in 3000 5173 8080; do
  if lsof -i :$port -t > /dev/null 2>&1; then
    echo "Server running on port $port"
    RUNNING_PORT=$port
    break
  fi
done
```

#### Step 4: Parse Server Output
```bash
# Start server in background and capture output
npm run dev > server.log 2>&1 &
PID=$!

# Wait a few seconds for server to start
sleep 3

# Parse the output for port
PORT=$(grep -o "localhost:[0-9]*" server.log | head -1 | cut -d: -f2)
```

## Integration with Other Skills

### ui-verify
Before verifying UI, ui-verify should:
1. Call dev-server-manager to get server info
2. Use the detected port for browser navigation
3. Verify server is responsive before taking screenshots

**Updated ui-verify workflow**:
```markdown
1. Detect dev server port using dev-server-manager
2. Ensure dev server is running
3. Navigate to http://localhost:{detected_port}/{route}
4. Take screenshots and verify
```

### docker-setup-react
When setting up Docker, check:
- Host port mapping (e.g., 3000:5173 maps host 3000 to container 5173)
- Container internal port (Vite default 5173)
- Expose the correct port in Dockerfile

## Error Handling

### Port Already in Use
```bash
# If configured port is occupied, check what's using it
if lsof -i :3000 -t > /dev/null 2>&1; then
  echo "Port 3000 is in use by:"
  lsof -i :3000
  # Options:
  # 1. Kill the process: kill $(lsof -i :3000 -t)
  # 2. Use a different port
  # 3. Ask user what to do
fi
```

### Server Not Starting
```bash
# Common issues:
# 1. Dependencies not installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# 2. Port conflict
# See above

# 3. Configuration error
# Check logs for syntax errors in config files
```

### Wrong Port Detected
```bash
# If detection fails, fall back to asking user
echo "Could not reliably detect port. Checking common ports..."
for port in 3000 5173 8080 4200 8000; do
  if curl -s "http://localhost:$port" > /dev/null 2>&1; then
    echo "Found server on port $port"
    DETECTED_PORT=$port
    break
  fi
done
```

## Configuration Priority

The port detection follows this priority order:

1. **Explicit CLI flag** in package.json script (highest priority)
   - Example: `"dev": "vite --port 3000"`

2. **Config file** (vite.config.ts, next.config.js, etc.)
   - Example: `server: { port: 3000 }`

3. **Environment variable** (.env, .env.local)
   - Example: `PORT=3000` or `VITE_PORT=3000`

4. **Running process** (already started)
   - Check `lsof` or `netstat`

5. **Framework default** (lowest priority)
   - Vite: 5173
   - Next.js: 3000
   - CRA: 3000

## Example Usage

### Example 1: Before UI Verification
```
User: "Verify the authentication page looks correct"

Claude:
1. Uses dev-server-manager to detect port
   - Reads vite.config.ts → finds port: 3000
2. Checks if server is running
   - Runs: lsof -i :3000 → server is running
3. Returns: http://localhost:3000
4. Navigates to http://localhost:3000/auth/login
5. Takes screenshots and verifies
```

### Example 2: Starting Server
```
User: "Start the dev server and show me the dashboard"

Claude:
1. Uses dev-server-manager
   - Reads vite.config.ts → port: 3000
   - Checks lsof → no server running
2. Starts server: npm run dev
3. Waits for "ready" message in output
4. Verifies server responds at http://localhost:3000
5. Navigates to http://localhost:3000/dashboard
6. Takes screenshot
```

### Example 3: Port Conflict
```
User: "The dev server won't start"

Claude uses dev-server-manager:
1. Detects configured port: 3000
2. Checks if port is in use: lsof -i :3000
3. Finds another process using port 3000
4. Reports to user:
   "Port 3000 is already in use by [process name] (PID: 12345)"
5. Offers solutions:
   - Kill the process
   - Change port in vite.config.ts
   - Use alternate port via CLI
```

## Health Check

Before using the server, always verify it's healthy:

```bash
# Check if server responds
check_server_health() {
  local port=$1
  local max_attempts=10
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "http://localhost:$port" > /dev/null 2>&1; then
      echo "Server is healthy on port $port"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done

  echo "Server failed health check on port $port"
  return 1
}
```

## Server Status Report

dev-server-manager can generate a status report:

```markdown
# Dev Server Status

**Framework**: Vite 6.3.5
**Configured Port**: 3000 (vite.config.ts)
**Running**: Yes
**URL**: http://localhost:3000
**Process ID**: 12345
**Start Command**: npm run dev
**Health**: ✅ Responding to requests

## Configuration Sources
- vite.config.ts: server.port = 3000
- package.json: "dev": "vite"

## Open Routes
- http://localhost:3000/
- http://localhost:3000/dashboard
- http://localhost:3000/auth/login
```

## Benefits

1. **Reliable Port Detection**: Never assume wrong port again
2. **Health Monitoring**: Verify server is ready before using it
3. **Error Prevention**: Catch port conflicts early
4. **Better DX**: Clear status reporting
5. **Integration Ready**: Other skills can depend on accurate server info

## Notes

- Always check configuration files first (most reliable)
- Running processes can be misleading (old servers still running)
- Wait for server readiness before attempting requests
- Framework defaults should be last resort
- Docker environments may have different port mappings (host vs container)
- HMR (Hot Module Replacement) may need a few seconds to initialize

## Common Ports by Framework

| Framework | Default Port | Config File |
|-----------|--------------|-------------|
| Vite | 5173 | vite.config.ts |
| Next.js | 3000 | next.config.js |
| Create React App | 3000 | .env (PORT=3000) |
| Vue CLI | 8080 | vue.config.js |
| Angular | 4200 | angular.json |
| Webpack Dev Server | 8080 | webpack.config.js |

## Related Skills

- **ui-verify**: Uses dev-server-manager for port detection
- **docker-setup-react**: Needs to know port mappings
- **test-generator**: May need dev server for E2E tests
