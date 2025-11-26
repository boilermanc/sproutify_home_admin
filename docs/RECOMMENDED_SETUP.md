# Recommended Setup: Edge Functions + pg_cron

## Why This Approach?

**Edge Functions** handle the actual notification processing (sending emails, creating in-app notifications) because:
- ✅ Secure API key storage (environment variables)
- ✅ Better error handling and logging
- ✅ Easier to test and debug
- ✅ Can handle rate limits and retries
- ✅ Scales better for broadcast emails

**pg_cron** triggers the Edge Function because:
- ✅ Simple scheduling (runs every minute)
- ✅ No external services needed
- ✅ Reliable and built into PostgreSQL

## Quick Start

### Step 1: Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy process-scheduled-notifications
```

### Step 2: Set Secrets

In Supabase Dashboard → Settings → Edge Functions → Secrets:

- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: Your sender email (e.g., `noreply@yourdomain.com`)

### Step 3: Set Up pg_cron Trigger

Run this SQL in Supabase SQL Editor (replace placeholders):

```sql
-- Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule the Edge Function
-- Replace YOUR_PROJECT_REF with your project reference (from project URL)
-- Replace YOUR_SERVICE_ROLE_KEY with your service role key (from project settings)
SELECT cron.schedule(
  'process-scheduled-notifications',
  '* * * * *', -- Every minute
  $$
  SELECT
    http_post(
      'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-notifications',
      '{}'::jsonb,
      '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    );
  $$
);
```

**Where to find these values:**
- **YOUR_PROJECT_REF**: Found in your Supabase project URL (e.g., `xzckfyipgrgpwnydddev`)
- **YOUR_SERVICE_ROLE_KEY**: Found in Project Settings → API → `service_role` key (keep this secret!)

**Alternative (using anon key - less secure but simpler):**
If you prefer to use the anon key (publicly visible but read-only), you can use that instead of the service role key.

### Step 4: Test

1. Create a scheduled notification in the admin panel (2 minutes in the future)
2. Wait 2 minutes
3. Check the `notifications` table - `status` should be `true`
4. Verify emails/notifications were sent

## Alternative: Pure pg_cron (Not Recommended)

If you really want to use only pg_cron without Edge Functions, you'd need to:

1. Store Resend API key in Supabase secrets
2. Create a PostgreSQL function that calls Resend API via `http` extension
3. Handle all error cases in SQL

**Why this is harder:**
- ❌ More complex SQL code
- ❌ Harder to debug
- ❌ Limited error handling
- ❌ API keys in database (less secure)
- ❌ Can't easily handle rate limits

## Cost Comparison

**Edge Functions + pg_cron:**
- pg_cron: Free (included with Supabase)
- Edge Functions: Free tier includes 500K invocations/month
- For 1,440 calls/day (every minute) = ~43K/month = **Well within free tier**

**Pure pg_cron:**
- Free, but requires `http` extension (may need to enable)

Both are essentially free for this use case, so choose based on maintainability, not cost.

## Summary

**Use Edge Functions + pg_cron** - It's the best balance of:
- Security (API keys in env vars)
- Maintainability (TypeScript, version control)
- Reliability (proper error handling)
- Scalability (handles broadcasts well)

The setup takes ~10 minutes and you're done!

