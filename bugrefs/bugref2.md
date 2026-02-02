# Bugref 2: GET /api/agents/:id/brain 404 (Not Found)

## Issue

In the browser console:

```
GET http://localhost:5173/api/agents/buggy/brain 404 (Not Found)
```

The webapp (Vite on 5173) proxies `/api` to the backend (3912). The request reaches the server, but the server responds with 404 and a body like:

```json
{
  "message": "Route GET:/api/agents/buggy/brain not found",
  "error": "Not Found",
  "statusCode": 404
}
```

So the **backend** doesn’t have that route registered—not a missing agent or wrong URL.

## Solution

1. **Confirm the server on 3912 is the current code.** An old Node process may still be bound to 3912 (e.g. from an earlier run or from MCP/IDE starting the server with an older build).

2. **Find and stop the process on port 3912:**

   ```bash
   netstat -ano | findstr :3912
   ```

   Note the PID in the rightmost column (e.g. `30984`).

3. **Kill that process:**

   ```bash
   taskkill /PID <pid> /F
   ```

4. **Start the backend from the repo (current code):**

   ```bash
   pnpm dev:server
   ```

5. **Verify the route:**  
   Open or curl `http://localhost:3912/api/agents/buggy/brain`. You should get `200` and a JSON array (e.g. `[]`), not 404.

6. **Refresh the browser.** The console 404 should stop.

## Possible causes

- An older build of the server was left running on 3912 (before brain routes were added).
- The server was started from a different directory or with cached/old `dist` or tooling.
- MCP or another tool started the server in the background with a different code path or version.
- Port 3912 was never restarted after pulling or changing routes (e.g. `/api/agents/:id/brain`).
