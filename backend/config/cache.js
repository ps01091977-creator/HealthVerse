import { createClient } from 'redis';

let redisClient = null;
const memoryCache = new Map();

// Initialize Redis if config is present
const initCache = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    redisClient = createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: false
      }
    });
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis Client Error, falling back to Memory Cache:', err.message);
      redisClient = null;
    });

    await redisClient.connect();
    console.log('🚀 Redis Cache Connected successfully');
  } catch (err) {
    console.warn('⚠️ Redis connection failed. Operating in in-memory cache mode.');
    redisClient = null;
  }
};

// Start initialization
initCache();

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const stringValue = JSON.stringify(value);
    if (redisClient) {
      await redisClient.set(key, stringValue, {
        EX: ttlSeconds,
      });
    } else {
      memoryCache.set(key, {
        value: stringValue,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

export const cacheGet = async (key) => {
  try {
    if (redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      const cached = memoryCache.get(key);
      if (!cached) return null;
      if (Date.now() > cached.expiresAt) {
        memoryCache.delete(key);
        return null;
      }
      return JSON.parse(cached.value);
    }
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

export const cacheDelete = async (key) => {
  try {
    if (redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};

export const cacheClearPattern = async (pattern) => {
  try {
    if (redisClient) {
      // Find and delete matching keys
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Memory cache clear matching keys
      const regex = new RegExp(pattern.replace('*', '.*'));
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (err) {
    console.error('Cache clear pattern error:', err);
  }
};
