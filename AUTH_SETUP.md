# 🔐 Authentication Setup Guide

## Simple Password Protection (Recommended for Multi-Client)

### 1. Environment Variables

Add this to your `.env.local` for development:
```bash
ACCESS_CODE=your-secure-password-here
```

For Vercel deployment, add in dashboard:
- Variable: `ACCESS_CODE`
- Value: `your-secure-password-here`

### 2. Client-Specific Deployments

**For multiple clients, each gets their own:**
- Vercel project/domain
- Unique `ACCESS_CODE` 
- Customized branding (optional)

### 3. Security Features

✅ **24-hour session timeout**  
✅ **Password masking with toggle**  
✅ **Environment-based access codes**  
✅ **Client-side session storage**  
✅ **Logout functionality**

---

## 🚀 Alternative Options

### Option 2: Next-Auth.js (OAuth)
```bash
npm install next-auth
```
- Google/GitHub/Microsoft login
- More complex but more secure
- Great for team access

### Option 3: Clerk Authentication
```bash
npm install @clerk/nextjs
```
- Professional auth service
- User management UI
- SSO, MFA support

### Option 4: Basic HTTP Auth
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')
  // Validate credentials
}
```

### Option 5: Custom JWT System
- Database user management
- Role-based access
- Most flexible but complex

---

## 📋 Current Implementation

**What's included:**
- Simple access code protection
- Session management (24hr timeout)
- Secure file access only after auth
- Clean logout process
- Mobile-friendly login form

**Perfect for:**
- Small business clients
- Quick deployments
- Per-client customization
- Simple password sharing

---

## 🔧 Customization Per Client

1. **Change branding colors in Tailwind**
2. **Update company name in headers**
3. **Set unique ACCESS_CODE per deployment**
4. **Custom domain via Vercel**

Example deployment workflow:
```bash
# Client A
vercel env add ACCESS_CODE
> clientA_secure2025!

# Client B  
vercel env add ACCESS_CODE
> clientB_files2025!
``` 