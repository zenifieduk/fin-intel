import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// Initialize Redis
const redis = Redis.fromEnv()

export const POST = async () => {
  try {
    // Fetch data from Redis
    const result = await redis.get("test-item")
    
    if (!result) {
      // Set a test item if it doesn't exist
      await redis.set("test-item", { message: "Hello from Upstash Redis!", timestamp: Date.now() })
      const newResult = await redis.get("test-item")
      
      // Return the result in the response
      return NextResponse.json({ 
        success: true, 
        data: newResult, 
        status: 'created',
        message: 'Redis connection successful - test item created'
      })
    }
    
    // Return the result in the response  
    return NextResponse.json({ 
      success: true, 
      data: result, 
      status: 'found',
      message: 'Redis connection successful - test item retrieved'
    })
  } catch (error) {
    console.error('Redis test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Redis connection failed'
    }, { status: 500 })
  }
}

export const GET = async () => {
  try {
    // Simple ping test
    const result = await redis.ping()
    
    return NextResponse.json({ 
      success: true, 
      ping: result,
      message: 'Redis ping successful'
    })
  } catch (error) {
    console.error('Redis ping failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Redis ping failed'
    }, { status: 500 })
  }
} 