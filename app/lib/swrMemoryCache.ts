type CacheEntry = {
  value: unknown;
  expiresAt: number;
  staleUntil: number;
};

type ErrorCacheEntry = {
  error: Error;
  expiresAt: number;
};

type GetOrSetInput<T> = {
  key: string;
  ttlMs: number;
  load: () => Promise<T>;
  shouldCacheError?: (error: unknown) => boolean;
};

type SwrMemoryCacheOptions = {
  maxEntries?: number;
  errorTtlMs?: number;
  staleFactor?: number;
  maxStaleMs?: number;
  staleOnErrorExtendMs?: number;
};

export function createSwrMemoryCache(options: SwrMemoryCacheOptions = {}) {
  const maxEntries = options.maxEntries ?? 700;
  const errorTtlMs = options.errorTtlMs ?? 45_000;
  const staleFactor = options.staleFactor ?? 3;
  const maxStaleMs = options.maxStaleMs ?? 7 * 24 * 60 * 60 * 1000;
  const staleOnErrorExtendMs = options.staleOnErrorExtendMs ?? 30_000;

  const values = new Map<string, CacheEntry>();
  const errors = new Map<string, ErrorCacheEntry>();
  const inFlight = new Map<string, Promise<unknown>>();

  const trim = () => {
    while (values.size > maxEntries) {
      const oldestKey = values.keys().next().value;
      if (!oldestKey) {
        break;
      }
      values.delete(oldestKey);
    }
  };

  const touch = (key: string, entry: CacheEntry) => {
    values.delete(key);
    values.set(key, entry);
  };

  const getCachedError = (key: string) => {
    const entry = errors.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      errors.delete(key);
      return null;
    }
    return entry.error;
  };

  const rememberError = (key: string, error: Error) => {
    errors.set(key, { error, expiresAt: Date.now() + errorTtlMs });
  };

  const getStaleMs = (ttlMs: number) => {
    const calculated = Math.max(ttlMs * staleFactor, ttlMs + 60_000);
    return Math.min(maxStaleMs, calculated);
  };

  const saveValue = (key: string, value: unknown, ttlMs: number) => {
    const now = Date.now();
    values.set(key, {
      value,
      expiresAt: now + ttlMs,
      staleUntil: now + ttlMs + getStaleMs(ttlMs),
    });
    trim();
    errors.delete(key);
  };

  async function getOrSet<T>(input: GetOrSetInput<T>): Promise<T> {
    const { key, ttlMs, load, shouldCacheError } = input;
    const now = Date.now();
    const cached = values.get(key);

    if (cached && cached.expiresAt > now) {
      touch(key, cached);
      return cached.value as T;
    }

    if (cached && cached.staleUntil > now) {
      touch(key, cached);
      if (!inFlight.has(key)) {
        const backgroundRefresh = load()
          .then((value) => {
            saveValue(key, value, ttlMs);
            return value;
          })
          .catch((error) => {
            if (cached.staleUntil <= Date.now() + staleOnErrorExtendMs) {
              cached.staleUntil = Date.now() + staleOnErrorExtendMs;
              values.set(key, cached);
            }
            if (!shouldCacheError || shouldCacheError(error)) {
              rememberError(key, error instanceof Error ? error : new Error(String(error)));
            }
          })
          .finally(() => {
            inFlight.delete(key);
          });

        inFlight.set(key, backgroundRefresh);
      }

      return cached.value as T;
    }

    const cachedError = getCachedError(key);
    if (cachedError) {
      throw cachedError;
    }

    const existingRequest = inFlight.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    const request = load()
      .then((value) => {
        saveValue(key, value, ttlMs);
        return value;
      })
      .catch((error) => {
        if (cached) {
          return cached.value as T;
        }
        if (!shouldCacheError || shouldCacheError(error)) {
          rememberError(key, error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      })
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, request);
    return request;
  }

  return {
    getOrSet,
  };
}
