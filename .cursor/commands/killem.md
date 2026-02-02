Kill all processes related to the backend MCP server.

1. Find the process listening on port 3912 (server port):
   `netstat -ano | findstr :3912`
2. Note the PID in the rightmost column (e.g. LISTENING 32328).
3. Kill that process:
   `taskkill /PID <pid> /F`
   (Request "all" permissions so the kill succeeds.)
4. Optionally confirm port 3912 is free:
   `netstat -ano | findstr :3912`
   (Exit code 1 / no output means nothing is listening.)
