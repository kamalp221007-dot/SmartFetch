import { createClient } from 'redis'
import { logger } from '../middleware/logger.js'

let redisClient: any = null

export const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    })

    redisClient.on('error', (err: any) => logger.error('Redis error:', err))
    redisClient.on('connect', () => logger.info('Redis connected'))

    await redisClient.connect()
    return redisClient
  } catch (error) {
    logger.warn('Redis connection failed, using in-memory cache', error)
    return null
  }
}

// In-memory fallback cache
const memoryCache = new Map<string, { value: any; expiresAt: number }>()

export const getRedis = () => redisClient

export const cacheSet = async (key: string, value: any, expirySeconds: number) => {
  try {
    if (redisClient) {
      await redisClient.setEx(key, expirySeconds, JSON.stringify(value))
    } else {
      memoryCache.set(key, {
        value,
        expiresAt: Date.now() + expirySeconds * 1000,
      })
    }
  } catch (error) {
    logger.error('Cache set error:', error)
  }
}

export const cacheGet = async (key: string) => {
  try {
    if (redisClient) {
      const value = await redisClient.get(key)
      return value ? JSON.parse(value) : null
    } else {
      const cached = memoryCache.get(key)
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value
      }
      memoryCache.delete(key)
      return null
    }
  } catch (error) {
    logger.error('Cache get error:', error)
    return null
  }
}

export const cacheDel = async (key: string) => {
  try {
    if (redisClient) {
      await redisClient.del(key)
    } else {
      memoryCache.delete(key)
    }
  } catch (error) {
    logger.error('Cache delete error:', error)
  }
}
