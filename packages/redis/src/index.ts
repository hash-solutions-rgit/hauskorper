import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_DATABASE_URL!);

export { redisClient };
