# 🧪 Redis Test Setup

## **Manual Environment Setup (Temporary)**

Since you've set up Upstash through Vercel, the credentials should be auto-configured. However, for local testing, you may need to add them manually to `.env.local`:

```bash
# Add these to .env.local (check Vercel dashboard for actual values)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## **Testing Steps:**

1. **Restart dev server** to pick up new environment variables
2. **Test API endpoint**: `curl http://localhost:3000/api/test-redis`
3. **Check test page**: `http://localhost:3000/test-redis`

## **Expected Results:**

### ✅ **Success Response:**
```json
{
  "success": true,
  "ping": "PONG",
  "message": "Redis ping successful"
}
```

### ❌ **Error Response:**
```json
{
  "success": false,
  "error": "Missing environment variables",
  "message": "Redis connection failed"
}
```

## **Environment Variable Sources:**

1. **Vercel Dashboard** → Project → Settings → Environment Variables
2. **Upstash Dashboard** → Database → Connect → REST API
3. **Auto-configured** via Vercel integration 