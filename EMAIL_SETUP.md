# Email Setup Guide

This application uses Resend for sending emails. You have two options for configuration:

## Option 1: Direct Resend API (Development/Testing)

For development or testing, you can use Resend directly from the frontend:

1. Get your Resend API key from [resend.com](https://resend.com)
2. Add to your `.env` file:
   ```
   VITE_RESEND_API_KEY=re_your_api_key_here
   VITE_RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

**Note:** Exposing API keys in the frontend is not recommended for production. Use Option 2 for production.

## Option 2: Backend Endpoint (Recommended for Production)

For production, set up a backend endpoint or Supabase Edge Function to handle email sending:

1. Create a backend endpoint (e.g., `/api/send-email`) that accepts:
   ```json
   {
     "to": "user@example.com" or ["user1@example.com", "user2@example.com"],
     "subject": "Email Subject",
     "html": "<html>...</html>",
     "from": "noreply@yourdomain.com" (optional)
   }
   ```

2. The endpoint should:
   - Use your Resend API key (kept secure on the backend)
   - Call Resend API
   - Return the response with `id` (message ID) on success

3. Add to your `.env` file:
   ```
   VITE_EMAIL_API_URL=/api/send-email
   ```

## Option 3: n8n Integration

If you prefer to use n8n to route emails:

1. Set up an n8n workflow that receives email requests
2. Configure the workflow to send emails via Resend
3. Set `VITE_EMAIL_API_URL` to your n8n webhook URL

## Features

- ✅ Send emails to single users by email address
- ✅ Send emails to all users (broadcast)
- ✅ Email format validation
- ✅ User lookup by email address
- ✅ Response handling with message IDs
- ✅ Success/error feedback in the UI

## Usage

1. Navigate to the **Notifications** page
2. Select **Email Blast** as the message type
3. Choose **Single User** or **All Users** as the audience
4. For single user, enter the user's email address (not UUID)
5. Enter subject and message
6. Click **Send Message**

The system will:
- Validate the email address format
- Look up the user in the database
- Send the email via Resend
- Display success/error feedback with message ID






