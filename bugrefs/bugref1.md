# Bugref 1: Port 3912 already in use (EADDRINUSE)

## Issue

`pnpm dev` fails with:

```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3912
```

The server can’t bind to port 3912 because something else is already listening on it. When the server task fails, pnpm stops the whole dev run, so Vite (5173) also goes down. The browser then shows `ERR_CONNECTION_REFUSED` for localhost:5173.

## Solution

1. Find the process using port 3912:

   ```bash
   netstat -ano | findstr :3912
   ```

   Note the PID in the rightmost column.

2. (Optional) Confirm it’s the right process:

   ```bash
   tasklist /fi "PID eq <pid>"
   ```

3. Kill that process:

   ```bash
   taskkill /PID <pid> /F
   ```

4. Run dev again:
   ```bash
   pnpm dev
   ```

## Possible causes

- Another instance of the server was already running
- A previous run didn’t exit cleanly and left a node process alive
- Another app (Node, Docker, etc.) is using 3912
- An IDE or tool started the server in the background
