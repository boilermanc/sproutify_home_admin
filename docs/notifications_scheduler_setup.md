# Notification Scheduler Setup Guide

## Overview

The notifications system now supports scheduling notifications to be sent at a specific date and time. Scheduled notifications are stored in the `notifications` table and need a background process to check and send them at the scheduled time.

## Database Schema

The `notifications` table structure:

```sql
create table public.notifications (
  id serial not null,
  title character varying(255) null,
  description text null,
  time_created timestamp with time zone not null default now(),
  formatted_time_created character varying(255) null,
  status boolean not null default true,
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;
```

**Note:** The `time_created` field is used to store the scheduled send time. The `status` field indicates whether the notification has been sent:
- `false` = scheduled, not yet sent
- `true` = sent (or active notification)

## Option 1: Using pg_cron (Recommended for Supabase)

pg_cron is a PostgreSQL extension that allows you to schedule jobs directly in the database.

### Setup Steps:

1. **Enable pg_cron extension** (if not already enabled):
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Create a function to process scheduled notifications**:
   ```sql
   CREATE OR REPLACE FUNCTION process_scheduled_notifications()
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   DECLARE
     notification_record RECORD;
     all_users RECORD;
     email_addresses TEXT[];
   BEGIN
     -- Find notifications that are scheduled to be sent now (within the last minute)
     -- and haven't been sent yet (status = false)
     FOR notification_record IN
       SELECT id, title, description, time_created
       FROM notifications
       WHERE status = false
         AND time_created <= NOW()
         AND time_created >= NOW() - INTERVAL '1 minute'
     LOOP
       -- Check if this is a broadcast notification (description contains "Broadcast")
       IF notification_record.description LIKE '%Broadcast%' THEN
         -- Get all users with email addresses
         SELECT ARRAY_AGG(email)
         INTO email_addresses
         FROM v_user_dashboard
         WHERE email IS NOT NULL;
         
         -- Send email to all users (you'll need to implement email sending here)
         -- This is a placeholder - you'll need to call your email service
         -- For now, we'll just mark it as sent
         
         -- Update status to sent
         UPDATE notifications
         SET status = true
         WHERE id = notification_record.id;
         
       ELSE
         -- Single user notification - process accordingly
         -- Update status to sent
         UPDATE notifications
         SET status = true
         WHERE id = notification_record.id;
       END IF;
     END LOOP;
   END;
   $$;
   ```

3. **Schedule the cron job to run every minute**:
   ```sql
   SELECT cron.schedule(
     'process-scheduled-notifications',
     '* * * * *', -- Every minute
     $$SELECT process_scheduled_notifications();$$
   );
   ```

### Important Notes:
- The function above is a template. You'll need to integrate it with your actual email sending service (Resend API).
- For production, consider using Supabase Edge Functions instead (see Option 2).

## Option 2: Using Supabase Edge Functions

Supabase Edge Functions are serverless functions that can be triggered on a schedule.

### Setup Steps:

1. **Create an Edge Function** (`supabase/functions/process-scheduled-notifications/index.ts`):
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   serve(async (req) => {
     const supabaseClient = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     )

     // Find notifications scheduled to be sent now
     const { data: notifications, error } = await supabaseClient
       .from('notifications')
       .select('*')
       .eq('status', false)
       .lte('time_created', new Date().toISOString())
       .gte('time_created', new Date(Date.now() - 60000).toISOString()) // Last minute

     if (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' },
       })
     }

     for (const notification of notifications || []) {
       // Process the notification
       // - Send emails if needed
       // - Create community_notifications for in-app notifications
       
       // Mark as sent
       await supabaseClient
         .from('notifications')
         .update({ status: true })
         .eq('id', notification.id)
     }

     return new Response(JSON.stringify({ processed: notifications?.length || 0 }), {
       headers: { 'Content-Type': 'application/json' },
     })
   })
   ```

2. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy process-scheduled-notifications
   ```

3. **Set up a cron trigger** using Supabase Dashboard or pg_cron:
   ```sql
   SELECT cron.schedule(
     'process-scheduled-notifications-edge',
     '* * * * *', -- Every minute
     $$
     SELECT
       net.http_post(
         url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-scheduled-notifications',
         headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
       ) AS request_id;
     $$
   );
   ```

## Option 3: External Cron Service

You can use an external service like:
- **n8n** - Has built-in scheduling
- **GitHub Actions** - Free cron jobs
- **Vercel Cron** - If using Vercel
- **AWS Lambda + EventBridge** - For AWS infrastructure

These services would call your Supabase Edge Function or a custom API endpoint that processes scheduled notifications.

## Testing

To test the scheduler:

1. Create a scheduled notification in the admin panel with a time 1-2 minutes in the future
2. Wait for the scheduled time
3. Check the `notifications` table - the `status` should change from `false` to `true`
4. Verify that emails/notifications were actually sent

## Monitoring

Monitor scheduled notifications with:

```sql
-- View pending scheduled notifications
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
  AND time_created > NOW()
ORDER BY time_created;

-- View failed/overdue notifications
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
  AND time_created < NOW() - INTERVAL '5 minutes'
ORDER BY time_created;
```

## Troubleshooting

- **Notifications not sending**: Check that the cron job is running and the function has proper permissions
- **Timezone issues**: Ensure `time_created` is stored in UTC and converted properly
- **Rate limiting**: For broadcast emails, consider batching or using a queue system



