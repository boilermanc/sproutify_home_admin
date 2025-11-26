# Notification Scheduler Setup Checklist

Print this or keep it open while you set up. Check off each step as you complete it.

## Preparation
- [ ] Have your Supabase project URL ready
- [ ] Have your Resend API key ready (from resend.com)
- [ ] Have a sender email address ready (e.g., noreply@yourdomain.com)

## Installation & Setup
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login to Supabase: `supabase login`
- [ ] Link to project: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Deploy function: `supabase functions deploy process-scheduled-notifications`

## Configuration
- [ ] Set RESEND_API_KEY secret in Supabase Dashboard
- [ ] Set RESEND_FROM_EMAIL secret in Supabase Dashboard
- [ ] Copy your service_role key from Supabase Dashboard

## Database Setup
- [ ] Run SQL migration (enable extensions + schedule cron job)
- [ ] Run optional migration (add index) from `add_notification_scheduling.sql`
- [ ] Verify cron job exists: `SELECT * FROM cron.job;`

## Testing
- [ ] Create test notification scheduled 2 minutes in future
- [ ] Verify notification appears in database with `status = false`
- [ ] Wait 2-3 minutes
- [ ] Check notification `status` changed to `true`
- [ ] Verify email was received (if testing email)
- [ ] Check Edge Function logs for success messages

## Done!
- [ ] Everything working? You're all set! 🎉

---

## Quick Commands Reference

**Deploy function:**
```bash
supabase functions deploy process-scheduled-notifications
```

**Check cron jobs:**
```sql
SELECT * FROM cron.job;
```

**View pending notifications:**
```sql
SELECT id, title, time_created, status
FROM notifications
WHERE status = false
ORDER BY time_created;
```

**View Edge Function logs:**
- Dashboard → Edge Functions → process-scheduled-notifications → Logs



