-- Migration: Add scheduling support to notifications table
-- This migration adds fields to better support scheduled notifications
-- Note: The existing `time_created` field will be used for scheduled time
-- and `status` field will track if the notification has been sent

-- If you want to add a separate scheduled_time field (optional):
-- ALTER TABLE public.notifications 
-- ADD COLUMN IF NOT EXISTS scheduled_time timestamp with time zone NULL;

-- If you want to add an is_sent field instead of using status (optional):
-- ALTER TABLE public.notifications 
-- ADD COLUMN IF NOT EXISTS is_sent boolean NOT NULL DEFAULT false;

-- Update the default status to false for new notifications (so they're marked as unsent by default)
-- This allows us to use status = false for "scheduled, not sent" and status = true for "sent"
ALTER TABLE public.notifications 
ALTER COLUMN status SET DEFAULT false;

-- Add an index for efficient querying of scheduled notifications
CREATE INDEX IF NOT EXISTS idx_notifications_status_time 
ON public.notifications(status, time_created) 
WHERE status = false;

-- Add a comment to clarify the status field usage
COMMENT ON COLUMN public.notifications.status IS 
'Notification status: false = scheduled/not sent, true = sent/active';

COMMENT ON COLUMN public.notifications.time_created IS 
'When the notification was created or scheduled to be sent';






