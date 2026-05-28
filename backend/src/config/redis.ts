export const redisConnection: any = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    };