const parseRedisUrl = (rawUrl: string) => {
  // Defensive: strip accidental "REDIS_URL=" prefix and trailing whitespace
  let url = rawUrl.trim();
  if (url.startsWith("REDIS_URL=")) {
    url = url.substring("REDIS_URL=".length).trim();
  }
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    username: parsed.username && parsed.username !== "default" ? parsed.username : undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
};

export const redisConnection: any = process.env.REDIS_URL
  ? parseRedisUrl(process.env.REDIS_URL)
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null,
    };