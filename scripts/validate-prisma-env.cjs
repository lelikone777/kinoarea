function readEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`[env] ${name} is required`);
  }
  return value.trim();
}

function parseDbUrl(label, value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[env] ${label} is not a valid URL`);
  }

  const dbName = parsed.pathname.replace(/^\/+/, "");
  if (!dbName) {
    throw new Error(`[env] ${label} must include database name in path`);
  }

  return {
    label,
    protocol: parsed.protocol,
    host: parsed.hostname,
    port: parsed.port || "",
    dbName,
    user: decodeURIComponent(parsed.username || ""),
  };
}

function normalizeNeonHost(host) {
  return host.replace("-pooler.", ".");
}

function assertCompatible(runtime, direct) {
  if (runtime.protocol !== direct.protocol) {
    throw new Error("[env] DATABASE_URL and DIRECT_URL must use the same protocol");
  }

  const runtimeHost = normalizeNeonHost(runtime.host);
  const directHost = normalizeNeonHost(direct.host);
  if (runtimeHost !== directHost) {
    throw new Error(
      `[env] DATABASE_URL host (${runtime.host}) and DIRECT_URL host (${direct.host}) point to different databases`
    );
  }

  if (runtime.dbName !== direct.dbName) {
    throw new Error(
      `[env] DATABASE_URL database (${runtime.dbName}) and DIRECT_URL database (${direct.dbName}) do not match`
    );
  }

  if (runtime.user && direct.user && runtime.user !== direct.user) {
    throw new Error(
      `[env] DATABASE_URL user (${runtime.user}) and DIRECT_URL user (${direct.user}) do not match`
    );
  }
}

function main() {
  const databaseUrl = parseDbUrl("DATABASE_URL", readEnv("DATABASE_URL"));
  const directUrl = parseDbUrl("DIRECT_URL", readEnv("DIRECT_URL"));
  assertCompatible(databaseUrl, directUrl);
  process.stdout.write("[env] Prisma DB URLs look consistent\n");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
