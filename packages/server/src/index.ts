import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { JsonFileStore } from "./store.js";
import { registerRoutes } from "./routes.js";
import { runMcpServer } from "./mcp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath =
  process.env.AGENT_ZOO_STORE_PATH ??
  path.join(process.env.HOME ?? process.env.USERPROFILE ?? ".", ".agent-zoo", "agents.json");
const port = Number(process.env.PORT ?? "3912");

const store = new JsonFileStore(storePath);

async function main() {
  const app = Fastify({ logger: { level: "info" } });
  await app.register(cors, { origin: true });
  await registerRoutes(app, store);

  await app.listen({ port, host: "0.0.0.0" });
  console.error(`[agent-zoo] HTTP API listening on http://localhost:${port}`);

  await runMcpServer(store);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
