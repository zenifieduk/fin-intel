import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const POST = async (request: Request) => {
  try {
    const { localStorageData, userId } = await request.json()
    
    if (!localStorageData) {
      return NextResponse.json({
        success: false,
        error: 'No localStorage data provided'
      }, { status: 400 })
    }

    // Initialize Redis
    const redis = Redis.fromEnv()
    
    // Parse and migrate user profile data
    for (const [key, value] of Object.entries(localStorageData)) {
      if (key.startsWith('aaran-profile-')) {
        try {
          const profileData = typeof value === 'string' ? JSON.parse(value) : value
          
          // Transform localStorage format to Redis format if needed
          const redisProfile = {
            ...profileData,
            lastActiveAt: new Date(),
            migratedAt: new Date(),
            migratedFrom: 'localStorage'
          }
          
          // Save to Redis
          await redis.set(key, JSON.stringify(redisProfile))
          console.log(`✅ Migrated profile: ${key}`)
        } catch (error) {
          console.error(`❌ Failed to migrate ${key}:`, error)
        }
      }
      
      // Migrate conversation data
      if (key.startsWith('aaran-conversation-')) {
        try {
          const conversationData = typeof value === 'string' ? JSON.parse(value) : value
          await redis.set(key, JSON.stringify(conversationData))
          console.log(`✅ Migrated conversation: ${key}`)
        } catch (error) {
          console.error(`❌ Failed to migrate conversation ${key}:`, error)
        }
      }
    }
    
    // Set migration flag
    await redis.set(`migration-completed-${userId}`, JSON.stringify({
      timestamp: new Date(),
      itemsCount: Object.keys(localStorageData).length
    }))
    
    return NextResponse.json({
      success: true,
      message: 'Data migrated successfully to Redis',
      migratedItems: Object.keys(localStorageData).length,
      timestamp: new Date()
    })
    
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    }, { status: 500 })
  }
}

export const GET = async () => {
  try {
    const redis = Redis.fromEnv()
    
    // Check migration status
    const migrationStatus = await redis.get('migration-completed-default-user')
    
    return NextResponse.json({
      success: true,
      migrationCompleted: !!migrationStatus,
      migrationDetails: migrationStatus || null,
      redisConnected: true
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check migration status',
      redisConnected: false
    }, { status: 500 })
  }
} 