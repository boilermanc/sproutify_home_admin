# Notifications System Overview

## How It Works

### Current System Architecture

The notifications system has two main components:

1. **In-App Notifications** (`community_notifications` table)
   - User-specific notifications that appear in the user's app
   - Stored in `community_notifications` table with `user_id`, `title`, `message`, `type`, `is_read`
   - When you send an in-app notification, it's immediately inserted into this table
   - The user's app queries this table to display notifications

2. **Broadcast Notifications** (`notifications` table)
   - General notifications that can be broadcast to all users
   - Stored in `notifications` table with `title`, `description`, `time_created`, `status`
   - Used for scheduled notifications and broadcast messages
   - Requires a background scheduler to process and send them

### Email Notifications

- Emails are sent immediately via Resend API
- No database storage (unless scheduled)
- Can be sent to single users or broadcast to all users

## New Scheduling Feature

### What Was Added

1. **Scheduling UI**
   - "Send Now" vs "Schedule" radio buttons
   - Date/time picker for selecting when to send
   - Validation to ensure scheduled time is in the future

2. **Database Integration**
   - Scheduled notifications are stored in the `notifications` table
   - Uses `time_created` field to store the scheduled send time
   - Uses `status` field to track if notification has been sent (`false` = scheduled, `true` = sent)

3. **Scheduling Logic**
   - When "Schedule" is selected, notifications are saved to the `notifications` table
   - The `time_created` field stores when the notification should be sent
   - The `status` field is set to `false` (not sent yet)
   - A background scheduler (pg_cron or Edge Function) checks for due notifications and sends them

### How Scheduled Notifications Work

1. **Admin creates scheduled notification:**
   - Admin fills out title, message, selects audience
   - Selects "Schedule" and picks a date/time
   - Clicks "Schedule Message"
   - Notification is saved to `notifications` table with `status = false` and `time_created = scheduled_time`

2. **Background scheduler processes notifications:**
   - Runs every minute (via pg_cron or Edge Function)
   - Finds notifications where `status = false` and `time_created <= NOW()`
   - For each due notification:
     - If it's a broadcast: sends to all users (email or in-app)
     - If it's single user: sends to that user
   - Updates `status = true` after sending

3. **User receives notification:**
   - Email: sent via Resend API
   - In-app: inserted into `community_notifications` table for the user(s)

## Database Tables

### `community_notifications`
- Stores user-specific in-app notifications
- Fields: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`
- Used for immediate notifications and scheduled notifications that have been processed

### `notifications`
- Stores broadcast/scheduled notifications
- Fields: `id`, `title`, `description`, `time_created`, `status`, `formatted_time_created`
- Used as a queue for scheduled notifications
- `status = false`: scheduled, waiting to be sent
- `status = true`: sent/completed

## Next Steps

1. **Run the SQL migration** (`docs/sql_migrations/add_notification_scheduling.sql`)
   - Adds index for efficient querying
   - Updates default status behavior

2. **Set up the scheduler** (see `docs/notifications_scheduler_setup.md`)
   - Choose Option 1 (pg_cron) or Option 2 (Edge Function)
   - Implement the notification processing logic
   - Test with a scheduled notification

3. **Test the system:**
   - Create a test notification scheduled 2 minutes in the future
   - Verify it appears in `notifications` table with `status = false`
   - Wait for scheduled time
   - Verify `status` changes to `true` and notification is sent

## Important Notes

- **Broadcast notifications** require scheduling when sending to all users (to avoid timeout/rate limits)
- **Single user notifications** can be sent immediately or scheduled
- **Email scheduling** stores the notification in the `notifications` table; the scheduler will send the email at the scheduled time
- **In-app notification scheduling** stores in `notifications` table; the scheduler will create entries in `community_notifications` at the scheduled time






