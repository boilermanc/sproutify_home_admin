# Process Scheduled Notifications Edge Function

This Edge Function processes scheduled notifications from the `notifications` table and sends them (emails or in-app notifications) at the scheduled time.

## Setup

### 1. Deploy the Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy process-scheduled-notifications
```

### 2. Set Environment Variables

Set these secrets in your Supabase dashboard (Settings > Edge Functions > Secrets):

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Or via Supabase Dashboard:
- Go to Project Settings > Edge Functions
- Add secrets:
  - `RESEND_API_KEY`: Your Resend API key
  - `RESEND_FROM_EMAIL`: Your sender email address

### 3. Set Up pg_cron Trigger

Run this SQL in your Supabase SQL Editor to trigger the function every minute:

```sql
-- First, enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the Edge Function to run every minute
SELECT cron.schedule(
  'process-scheduled-notifications',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      )
    ) AS request_id;
  $$
);
```

**Important:** Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your project URL).

### 4. Alternative: Use Supabase Cron Jobs (if available)

If your Supabase plan supports cron jobs, you can set it up in the dashboard:
- Go to Database > Cron Jobs
- Create a new cron job
- URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-notifications`
- Schedule: `* * * * *` (every minute)
- Method: POST
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

## How It Works

1. **pg_cron** triggers the Edge Function every minute
2. The function queries `notifications` table for:
   - `status = false` (not yet sent)
   - `time_created <= NOW()` (scheduled time has passed)
   - `time_created >= NOW() - 1 minute` (within last minute to avoid duplicates)
3. For each notification:
   - Determines if it's email or in-app
   - Determines if it's broadcast or single user
   - Sends emails via Resend API or creates `community_notifications` entries
   - Updates `status = true` to mark as sent

## Testing

1. Create a test notification scheduled 2 minutes in the future:
   ```sql
   INSERT INTO notifications (title, description, time_created, status)
   VALUES (
     'Test Notification',
     'This is a test',
     NOW() + INTERVAL '2 minutes',
     false
   );
   ```

2. Wait 2 minutes and check:
   ```sql
   SELECT * FROM notifications WHERE id = YOUR_NOTIFICATION_ID;
   -- status should be true
   ```

3. Check Edge Function logs in Supabase Dashboard:
   - Go to Edge Functions > process-scheduled-notifications > Logs

## Monitoring

View pending notifications:
```sql
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
  AND time_created > NOW()
ORDER BY time_created;
```

View overdue notifications (shouldn't happen if scheduler is working):
```sql
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
  AND time_created < NOW() - INTERVAL '5 minutes'
ORDER BY time_created;
```

## Troubleshooting

- **Function not being called**: Check pg_cron is enabled and the schedule is active
- **Emails not sending**: Verify RESEND_API_KEY is set correctly
- **Notifications not updating**: Check function logs for errors
- **Rate limiting**: Resend has rate limits; consider batching for large broadcasts






