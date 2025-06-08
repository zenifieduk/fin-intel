# 🚀 Redis Migration Setup Guide

## 1. **Upstash Redis Setup**

### Create Account & Database:
1. Go to [upstash.com](https://upstash.com) 
2. Sign up/login and create a new Redis database
3. Choose region closest to you (for best performance)
4. Copy the REST API credentials

### Add to .env.local:
```bash
# Upstash Redis (Conversation Memory)
NEXT_PUBLIC_UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN=your-token-here
```

## 2. **Pinecone Setup (For Future Knowledge Base)**

### Create Account & Index:
1. Go to [pinecone.io](https://www.pinecone.io)
2. Create account and new index
3. Name: `efl-knowledge`
4. Dimensions: `1536` (for OpenAI embeddings)
5. Metric: `cosine`

### Add to .env.local:
```bash
# Pinecone (Knowledge Base)
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=efl-knowledge
```

## 3. **Supabase Setup (For Future Financial Data)**

### Create Project:
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and anon key from settings

### Add to .env.local:
```bash
# Supabase (Financial Data Store)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. **Complete .env.local Template**

```bash
# ElevenLabs TTS (existing)
ELEVENLABS_API_KEY=your-elevenlabs-key

# Upstash Redis (Conversation Memory) - NEW
NEXT_PUBLIC_UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN=your-token-here

# Pinecone (Knowledge Base) - FUTURE
PINECONE_API_KEY=your-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=efl-knowledge

# Supabase (Financial Data Store) - FUTURE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 5. **Migration Benefits**

### ✅ **Immediate (Redis)**:
- Fixes localStorage SSR errors
- Persistent memory across devices/sessions
- Better performance (Redis caching)
- Scalable conversation history

### ✅ **Phase 2 (Pinecone)**:
- Advanced semantic search for EFL knowledge
- AI-powered financial insights
- Context-aware responses

### ✅ **Phase 3 (Supabase)**:
- Real-time financial data updates
- Structured data with ACID compliance
- Advanced analytics and reporting

## 6. **Free Tier Limits**

| Service | Free Tier Limit |
|---------|----------------|
| **Upstash Redis** | 10K commands/day |
| **Pinecone** | 1M vector operations/month |
| **Supabase** | 500MB database + 2GB bandwidth |

All sufficient for development and moderate production use!

## 7. **Next Steps**

1. **Set up Upstash Redis first** (immediate SSR fix)
2. **Test migration** with existing conversation data
3. **Add Pinecone later** for advanced knowledge retrieval
4. **Add Supabase last** for real-time financial data

Ready to proceed once you have the Redis credentials! 🎯 