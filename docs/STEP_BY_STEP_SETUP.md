# Step-by-Step Setup Guide: Notification Scheduler

Follow these steps in order to set up scheduled notifications.

## Prerequisites

- Supabase project (you already have this)
- Resend account and API key
- Supabase CLI installed (we'll check this)

---

## Step 1: Install Supabase CLI

Open your terminal and run:

```bash
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
```

You should see a version number. If you get an error, you may need to install Node.js first.

---

## Step 2: Login to Supabase CLI

```bash
supabase login
```

This will open your browser to authenticate. After logging in, you can close the browser and return to the terminal.

---

## Step 3: Link to Your Project

You need your project reference ID. You can find it in:
- Your Supabase project URL: `https://YOUR_PROJECT_REF.supabase.co`
- Or in Supabase Dashboard → Settings → General → Reference ID

**Link to your project:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference (e.g., `xzckfyipgrgpwnydddev`).

**Verify it worked:**
You should see a success message. If you get an error, make sure you're logged in and have the correct project reference.

---

## Step 4: Deploy the Edge Function

From your project root directory (where `package.json` is), run:

```bash
supabase functions deploy process-scheduled-notifications
```

**What to expect:**
- The function will be uploaded to Supabase
- You should see a success message with the function URL
- If you get an error, check that you're in the right directory and linked to your project

**Verify deployment:**
- Go to Supabase Dashboard → Edge Functions
- You should see `process-scheduled-notifications` in the list

---

## Step 5: Set Environment Variables (Secrets)

You need to store your Resend API key securely in Supabase.

### Option A: Using Supabase Dashboard (Easier)

1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add Secret**
4. Add these two secrets:

   **Secret 1:**
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (starts with `re_`)

   **Secret 2:**
   - Name: `RESEND_FROM_EMAIL`
   - Value: Your sender email (e.g., `noreply@yourdomain.com`)

5. Click **Save** for each secret

### Option B: Using CLI

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Verify secrets are set:**
- In Dashboard: Check that both secrets appear in the list
- Using CLI: `supabase secrets list` (should show your secrets)

---

## Step 6: Get Your Service Role Key

You'll need this for the pg_cron setup.

1. Go to Supabase Dashboard
2. Navigate to: **Project Settings** → **API**
3. Find the **service_role** key (NOT the anon key)
4. Click the eye icon to reveal it
5. **Copy it** - you'll need it in the next step
6. **Keep it secret!** This key has admin access

---

## Step 7: Run the SQL Migration

1. Go to Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Click **New Query**
4. Paste this SQL (replace the placeholders):

```sql
-- Step 7a: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Try http extension first, if that fails, use pg_net (see alternative below)
CREATE EXTENSION IF NOT EXISTS http;

-- Step 7b: Schedule the Edge Function to run every minute
-- Replace YOUR_PROJECT_REF with your project reference
-- Replace YOUR_SERVICE_ROLE_KEY with your service role key from Step 6

-- OPTION 1: Using http extension (try this first)
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

-- If the above gives an error about http extension, use OPTION 2 below instead:
-- OPTION 2: Using pg_net extension (alternative)
-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- SELECT cron.schedule(
--   'process-scheduled-notifications',
--   '* * * * *',
--   $$
--   SELECT
--     net.http_post(
--       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-notifications',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--       )
--     ) AS request_id;
--   $$
-- );
```

5. **Replace placeholders:**
   - `YOUR_PROJECT_REF`: Your project reference (e.g., `xzckfyipgrgpwnydddev`)
   - `YOUR_SERVICE_ROLE_KEY`: Your service role key from Step 6

6. Click **Run** (or press Ctrl+Enter)

**What to expect:**
- You should see a success message
- The cron job is now scheduled

**Verify it worked:**
Run this query to see your scheduled jobs:
```sql
SELECT * FROM cron.job WHERE jobname = 'process-scheduled-notifications';
```

You should see one row with your scheduled job.

---

## Step 8: Run the Database Migration (Optional but Recommended)

This adds an index to make queries faster.

1. Still in **SQL Editor**
2. Click **New Query**
3. Paste the contents of `docs/sql_migrations/add_notification_scheduling.sql`
4. Click **Run**

**What this does:**
- Adds an index for faster queries
- Updates default status behavior
- Adds helpful comments

---

## Step 9: Test the Setup

Let's create a test notification to verify everything works.

### Test 1: Create a Scheduled Notification

1. Go to your admin panel (the app you're building)
2. Navigate to **Notifications** page
3. Fill out:
   - **Message Type**: Email Blast
   - **Audience**: Single User
   - **User Email**: Your own email (so you can verify it arrives)
   - **Subject/Title**: "Test Scheduled Notification"
   - **Message**: "This is a test of the scheduling system"
   - **Send Timing**: Select **Schedule**
   - **Date & Time**: Set it to **2 minutes from now**
4. Click **Schedule Message**

**What to expect:**
- You should see a success message
- The notification is saved to the database

### Test 2: Verify It's in the Database

Run this SQL query:
```sql
SELECT id, title, description, time_created, status
FROM notifications
WHERE status = false
ORDER BY time_created DESC
LIMIT 5;
```

You should see your test notification with:
- `status = false` (not sent yet)
- `time_created` = your scheduled time

### Test 3: Wait and Check

1. Wait 2-3 minutes (until after your scheduled time)
2. Check the notifications table again:
```sql
SELECT id, title, time_created, status
FROM notifications
WHERE id = YOUR_NOTIFICATION_ID;
```

**What to expect:**
- `status` should now be `true` (sent)
- Check your email inbox for the test email

### Test 4: Check Edge Function Logs

1. Go to Supabase Dashboard → **Edge Functions**
2. Click on `process-scheduled-notifications`
3. Click **Logs** tab
4. You should see log entries showing the function ran and processed notifications

**What to look for:**
- Log entries every minute (when cron triggers)
- Success messages when notifications are processed
- Any error messages (if something went wrong)

---

## Step 10: Troubleshooting

### Problem: Function not deploying

**Solution:**
- Make sure you're logged in: `supabase login`
- Make sure you're linked: `supabase link --project-ref YOUR_PROJECT_REF`
- Check you're in the project root directory

### Problem: Cron job not running

**Solution:**
- Verify pg_cron is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
- Check cron job exists: `SELECT * FROM cron.job;`
- Verify the URL and service role key are correct in the cron schedule

### Problem: Notifications not sending

**Solution:**
- Check Edge Function logs for errors
- Verify Resend API key is set correctly
- Check that `status` is updating to `true` (means function ran)
- Verify email address is valid

### Problem: "Extension http does not exist"

**Solution:**
Some Supabase projects may not have the `http` extension enabled. Try this alternative using `net`:

```sql
-- Alternative using net extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'process-scheduled-notifications',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    ) AS request_id;
  $$
);
```

---

## Step 11: You're Done! 🎉

Your notification scheduler is now set up and running! 

**What happens now:**
- Every minute, pg_cron triggers your Edge Function
- The function checks for notifications scheduled to be sent
- It sends emails or creates in-app notifications
- It marks notifications as sent (`status = true`)

**Next steps:**
- Create scheduled notifications in your admin panel
- Monitor the Edge Function logs to ensure everything is working
- Check the `notifications` table to see scheduled notifications

---

## Quick Reference

**Check scheduled jobs:**
```sql
SELECT * FROM cron.job;
```

**View pending notifications:**
```sql
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
  AND time_created > NOW()
ORDER BY time_created;
```

**View Edge Function logs:**
- Dashboard → Edge Functions → process-scheduled-notifications → Logs

**Redeploy function (after changes):**
```bash
supabase functions deploy process-scheduled-notifications
```

**Update secrets:**
- Dashboard → Project Settings → Edge Functions → Secrets

