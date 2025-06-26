import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  try {
    console.log('Testing NICO Redis connection...')
    console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL)
    console.log('Redis Token exists:', !!process.env.UPSTASH_REDIS_REST_TOKEN)

    // Try explicit initialization
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    console.log('Redis instance created, testing ping...')
    const pingResult = await redis.ping()
    console.log('Ping result:', pingResult)

    // Test set/get
    const testKey = 'nico-test-key'
    const testValue = { message: 'NICO test', timestamp: Date.now() }
    
    console.log('Setting test value...')
    await redis.set(testKey, testValue)
    
    console.log('Getting test value...')
    const retrievedValue = await redis.get(testKey)
    
    console.log('Cleaning up test key...')
    await redis.del(testKey)

    return NextResponse.json({
      success: true,
      message: 'NICO Redis test successful',
      data: {
        ping: pingResult,
        testValue: retrievedValue,
        url: process.env.UPSTASH_REDIS_REST_URL,
        hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
      }
    })
  } catch (error) {
    console.error('NICO Redis test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'NICO Redis test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: process.env.UPSTASH_REDIS_REST_URL,
      hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
    }, { status: 500 })
  }
}