import { PrismaClient } from "@prisma/client";
// The default client's Node runtime (runtime/library.js) calls eval(), which
// Cloudflare Workers forbids at request time. The wasm runtime is eval-free and
// is what the Hyperdrive/driver-adapter path must use on the Worker.
import { PrismaClient as PrismaClientWasm } from "@prisma/client/wasm";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function normalizeDatabaseUrl(value?: string) {
  if (!value) return value;

  let normalized = value.trim();

  if (normalized.startsWith("DATABASE_URL=")) {
    normalized = normalized.slice("DATABASE_URL=".length).trim();
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

const logLevels: ("error" | "warn")[] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

type CloudflareEnv = {
  HYPERDRIVE?: { connectionString?: string };
};

/**
 * Read the Hyperdrive binding, which only exists while a request is being
 * handled on Cloudflare Workers. Returns undefined everywhere else (local
 * `next dev`, `next build`, CI), so the Node path is used instead.
 */
function getCloudflareEnv(): CloudflareEnv | undefined {
  try {
    // Imported lazily: this module is only resolvable inside the Workers build.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    return getCloudflareContext()?.env as CloudflareEnv | undefined;
  } catch {
    return undefined;
  }
}

/** Workers: route Prisma through Hyperdrive with the pg driver adapter (wasm engine). */
function createWorkersClient(connectionString: string): PrismaClient {
  // Hyperdrive already pools on Cloudflare's side, so keep the local pool small
  // and scoped to this request.
  const pool = new Pool({ connectionString, max: 5 });
  // Cast: the wasm client is API-compatible with PrismaClient but has its own
  // (structurally identical) constructor type.
  return new PrismaClientWasm({ adapter: new PrismaPg(pool), log: logLevels }) as unknown as PrismaClient;
}

/** Node (local dev, build, any non-Workers host): plain client over DATABASE_URL. */
function createNodeClient(): PrismaClient {
  const url = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (url) process.env.DATABASE_URL = url;
  return new PrismaClient({ log: logLevels });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// One client per in-flight Cloudflare request. Workers forbids reusing a socket
// opened by a previous request, so the client must not be cached across them.
const clientsByRequest = new WeakMap<object, PrismaClient>();

function getClient(): PrismaClient {
  const env = getCloudflareEnv();
  const connectionString = env?.HYPERDRIVE?.connectionString;

  if (env && connectionString) {
    const cached = clientsByRequest.get(env as object);
    if (cached) return cached;

    const client = createWorkersClient(connectionString);
    clientsByRequest.set(env as object, client);
    return client;
  }

  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createNodeClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/**
 * Lazy client. The real PrismaClient is built on first property access so that,
 * on Workers, the Hyperdrive binding is available by then. Call sites keep using
 * `prisma.user.findUnique(...)` unchanged.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  }
}) as PrismaClient;
