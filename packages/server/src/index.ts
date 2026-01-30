import path from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { JsonFileStore } from "./store.js";
import { registerRoutes } from "./routes.js";
import { runMcpServer } from "./mcp.js";

const storePath =
  process.env.AGENT_ZOO_STORE_PATH ??
  path.join(
    process.env.HOME ?? process.env.USERPROFILE ?? ".",
    ".agent-zoo",
    "agents.json",
  );
const port = Number(process.env.PORT ?? "3912");

const store = new JsonFileStore(storePath);

async function main() {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/819f9191-901f-4000-bcbe-3eb79b13befa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/server/src/index.ts:20",
      message: "main entry",
      data: {
        portEnv: process.env.PORT ?? null,
        resolvedPort: port,
        storePath,
        pid: process.pid,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H2",
    }),
  }).catch(() => {});
  // #endregion
  // Logger must write to stderr (not stdout) because MCP uses stdio transport
  const app = Fastify({ logger: { level: "info", stream: process.stderr } });
  await app.register(cors, { origin: true });
  await registerRoutes(app, store);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/819f9191-901f-4000-bcbe-3eb79b13befa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/server/src/index.ts:26",
      message: "before listen",
      data: { host: "0.0.0.0", port },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H1",
    }),
  }).catch(() => {});
  // #endregion
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    const error = err as Error & { code?: unknown };
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/819f9191-901f-4000-bcbe-3eb79b13befa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "packages/server/src/index.ts:32",
        message: "listen failed",
        data: {
          host: "0.0.0.0",
          port,
          code: error?.code ?? null,
          errorMessage: error?.message ?? String(err),
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/819f9191-901f-4000-bcbe-3eb79b13befa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/server/src/index.ts:38",
      message: "listen succeeded",
      data: { host: "0.0.0.0", port },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H3",
    }),
  }).catch(() => {});
  // #endregion
  console.error(`[agent-zoo] HTTP API listening on http://localhost:${port}`);

  runMcpServer(store).catch((err) => {
    console.error("[agent-zoo] MCP server failed to start");
    console.error(err);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
