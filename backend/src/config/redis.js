import "dotenv/config";
import IORedis from "ioredis";

const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    });

redisConnection.on("connect", () => {
  console.log("Redis connected successfully");
});

redisConnection.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export default redisConnection;