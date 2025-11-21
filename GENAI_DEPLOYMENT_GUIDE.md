# 🚀 Budgee GenAI Deployment & Troubleshooting Guide

## 📋 Root Cause Analysis

### What Was Wrong

Your Budgee AI feature was failing in production with a **500 Server Components render error** because:

1. **❌ Client Component directly called Server Action**: `chat-assistant.tsx` (client component with `"use client"`) was directly importing and calling `answerFinanceQuestion` (server action with `'use server'`). While this works in Next.js development, it causes runtime errors in production.

2. **❌ No API Route**: There was no `/app/api/ai/ask/route.ts` to handle server-side AI calls. The architecture required a proper API route to proxy GenAI requests.

3. **❌ Environment Variable Access**: Genkit was not explicitly configured to read `GOOGLE_GENAI_API_KEY`, relying on auto-detection which can fail in serverless environments like Vercel.

4. **❌ Production Error Masking**: Next.js hides detailed error messages in production builds, making debugging difficult without proper logging and Vercel logs access.

---

## ✅ What Was Fixed

### 1. Created API Route (`/app/api/ai/ask/route.ts`)
- **Server-side only** endpoint that handles AI requests
- Proper error handling and validation
- Environment variable checking with detailed logging
- Returns appropriate HTTP status codes

### 2. Updated Client Components
- **Removed direct server action import** from `chat-assistant.tsx`
- **Changed to fetch API**: Components now call `/api/ai/ask` via HTTP POST
- **Better error handling**: Network errors, configuration errors, and API errors are handled separately
- **No more "digest" errors**: Proper client-server separation

### 3. Fixed Genkit Initialization
- **Explicit API key configuration** in `genkit.ts`
- Ensures `GOOGLE_GENAI_API_KEY` is read correctly in serverless environments

---

## 🔧 Corrected Architecture

```
┌─────────────────────────────────────────┐
│  Client Component (Browser)             │
│  src/components/ai/chat-assistant.tsx   │
│  - "use client"                         │
│  - Uses fetch() to call API route      │
└──────────────┬──────────────────────────┘
               │ HTTP POST /api/ai/ask
               │ { question, userId, financialData }
               ▼
┌─────────────────────────────────────────┐
│  API Route (Server-Side - Vercel)       │
│  src/app/api/ai/ask/route.ts            │
│  - Validates request                    │
│  - Checks GOOGLE_GENAI_API_KEY          │
│  - Calls server action                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Server Action                          │
│  src/ai/flows/ai-answer-finance-        │
│  questions.ts                           │
│  - 'use server'                         │
│  - Calls Genkit AI                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Genkit AI (src/ai/genkit.ts)          │
│  - Initialized with API key             │
│  - Calls Google Gemini API              │
└─────────────────────────────────────────┘
```

---

## 🔑 Environment Variables Setup

### Required Variables

#### ❌ DO NOT use `NEXT_PUBLIC_` prefix
```bash
# ❌ WRONG - This exposes your API key to the browser!
NEXT_PUBLIC_GOOGLE_GENAI_API_KEY=your_key_here

# ✅ CORRECT - Server-only variable
GOOGLE_GENAI_API_KEY=your_actual_gemini_api_key_here
```

### Where to Add Environment Variables

#### Local Development (`.env.local`)
```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google Gemini AI API Key (Server-only)
GOOGLE_GENAI_API_KEY=AIzaSy...your_key_here
```

#### Vercel Production

1. **Go to your Vercel project dashboard**
2. **Settings** → **Environment Variables**
3. **Add the following**:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GOOGLE_GENAI_API_KEY` | `AIzaSy...your_key` | Production, Preview, Development |

4. **⚠️ IMPORTANT**: After adding/updating env vars, you MUST **redeploy** your project:
   ```bash
   # Trigger a new deployment
   git commit --allow-empty -m "Redeploy to apply env vars"
   git push
   ```

   Or from Vercel dashboard: **Deployments** → **Redeploy**

---

## 📝 Deployment Checklist

### Before Deploying

- [ ] **API Key Obtained**: Get your Google Gemini API key from https://aistudio.google.com/app/apikey
- [ ] **Environment Variables Set**: Add `GOOGLE_GENAI_API_KEY` to Vercel (Settings → Environment Variables)
- [ ] **Code Updated**: Ensure you have the latest code with:
  - [ ] `/app/api/ai/ask/route.ts` created
  - [ ] `chat-assistant.tsx` updated (no direct server action import)
  - [ ] `genkit.ts` updated (explicit API key configuration)
- [ ] **Local Testing**: Test AI feature locally with `npm run dev`
- [ ] **No Secrets in Code**: Verify no API keys are hardcoded in source files

### After Deploying

- [ ] **Trigger Redeploy**: Commit and push changes, or redeploy from Vercel dashboard
- [ ] **Check Build Logs**: Ensure no build errors in Vercel dashboard
- [ ] **Test Health Endpoint**: Visit `https://your-app.vercel.app/api/ai/ask` (should return `{ status: "ok", configured: true }`)
- [ ] **Test Chat Feature**: Try asking a question in the Budgee chatbot
- [ ] **Check Runtime Logs**: If errors occur, check Vercel logs (see below)

---

## 🔍 Debugging Production Errors

### Check Vercel Logs

#### Method 1: Vercel Dashboard
1. Go to your project on Vercel
2. Click **Functions** or **Logs** tab
3. Look for requests to `/api/ai/ask`
4. Check for errors with the "digest" you saw in the error message

#### Method 2: Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# View real-time logs
vercel logs --follow

# Or view logs for a specific deployment
vercel logs [deployment-url]
```

### Common Errors & Solutions

#### Error: "GOOGLE_GENAI_API_KEY is not configured"
**Solution**:
1. Verify env var exists in Vercel (Settings → Environment Variables)
2. Ensure it's assigned to **Production** environment
3. Redeploy after adding the variable
4. Check `/api/ai/ask` health endpoint

#### Error: "Failed to fetch" or Network Error
**Solution**:
1. Check browser console for CORS errors
2. Verify API route is deployed (check Vercel Functions tab)
3. Test the endpoint directly: `curl https://your-app.vercel.app/api/ai/ask`

#### Error: "Server Components render error" with digest
**Solution**:
1. Find the digest in Vercel logs to see the real error
2. Ensure no client components are importing server actions directly
3. Verify all AI calls go through `/api/ai/ask` API route

#### Error: "API key not valid" or "403 Forbidden"
**Solution**:
1. Verify your Google Gemini API key is valid
2. Check API key restrictions in Google Cloud Console
3. Ensure API key has Gemini API enabled

---

## 🧪 Testing the Fix

### Local Testing
```bash
# 1. Set up environment variable
echo "GOOGLE_GENAI_API_KEY=your_key_here" >> .env.local

# 2. Start development server
npm run dev

# 3. Open http://localhost:9002/dashboard/chat
# 4. Try asking: "What's my total spending this month?"
```

### Production Testing
```bash
# 1. Check health endpoint
curl https://your-app.vercel.app/api/ai/ask

# Should return: {"status":"ok","service":"Budgee AI","configured":true}

# 2. Test from browser
# Visit https://your-app.vercel.app/dashboard/chat
# Ask a question
```

### Health Check Endpoint
Visit or curl `https://your-app.vercel.app/api/ai/ask` (GET request)

**Expected Response**:
```json
{
  "status": "ok",
  "service": "Budgee AI",
  "configured": true,
  "message": "AI service is ready"
}
```

**If misconfigured**:
```json
{
  "status": "ok",
  "service": "Budgee AI",
  "configured": false,
  "message": "AI service is not configured - GOOGLE_GENAI_API_KEY missing"
}
```

---

## 📦 Files Changed

1. **Created**: `src/app/api/ai/ask/route.ts` - API route for AI requests
2. **Modified**: `src/components/ai/chat-assistant.tsx` - Updated to call API route
3. **Modified**: `src/ai/genkit.ts` - Explicit API key configuration
4. **Created**: `GENAI_DEPLOYMENT_GUIDE.md` - This guide

---

## 🎯 Quick Fix Commands

```bash
# 1. Ensure environment variable is set in Vercel
# (Do this in Vercel dashboard: Settings → Environment Variables)

# 2. Commit and deploy changes
git add .
git commit -m "Fix GenAI production error - add API route"
git push

# 3. Wait for deployment (or redeploy from Vercel dashboard)

# 4. Verify deployment
curl https://your-app.vercel.app/api/ai/ask

# 5. Check logs if issues persist
vercel logs --follow
```

---

## 💡 Best Practices for Next.js + AI

1. **✅ Always use API Routes for AI calls**: Never call AI providers directly from client components
2. **✅ Keep API keys server-side**: Use regular env vars (not `NEXT_PUBLIC_*`)
3. **✅ Add health check endpoints**: Make debugging easier with status endpoints
4. **✅ Handle errors gracefully**: Provide user-friendly error messages
5. **✅ Log in production**: Use `console.log` in API routes for Vercel logs
6. **✅ Test locally first**: Verify everything works with `npm run dev` before deploying
7. **✅ Redeploy after env var changes**: Vercel doesn't auto-redeploy when you add variables

---

## 🆘 Still Having Issues?

### Check These:

1. **Vercel Dashboard**:
   - Functions tab shows `/api/ai/ask`
   - Environment variables are set correctly
   - Latest deployment succeeded

2. **Browser Console**:
   - Look for network errors
   - Check the request payload to `/api/ai/ask`
   - Verify no CORS errors

3. **Vercel Logs**:
   ```bash
   vercel logs --follow
   ```
   Look for:
   - `[API /ai/ask]` log messages
   - `[Budgee AI]` log messages
   - Error stack traces

4. **Test API Route Directly**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/ai/ask \
     -H "Content-Type: application/json" \
     -d '{
       "question": "test",
       "userId": "test-user",
       "financialData": {
         "totalIncome": 5000,
         "totalExpenses": 3000,
         "savings": 2000,
         "accounts": [],
         "recentTransactions": [],
         "categoryTotals": {}
       }
     }'
   ```

---

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Google AI Studio](https://aistudio.google.com/app/apikey) - Get your API key

---

**✅ Your GenAI feature should now work perfectly in production!**
