import { NextResponse } from 'next/server'

export const GET = async () => {
  return NextResponse.json({
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? `${process.env.UPSTASH_REDIS_REST_TOKEN.slice(0, 10)}...` : 'undefined',
    NODE_ENV: process.env.NODE_ENV,
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} 