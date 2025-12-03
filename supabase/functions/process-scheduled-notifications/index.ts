// Supabase Edge Function to process scheduled notifications
// This function is called by pg_cron every minute to check for due notifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@sproutify.com'

interface Notification {
  id: number
  title: string | null
  description: string | null
  time_created: string
  status: boolean
}

serve(async (req) => {
  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Find notifications scheduled to be sent now (within the last minute)
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    
    const { data: notifications, error: fetchError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('status', false) // Not yet sent
      .lte('time_created', now.toISOString())
      .gte('time_created', oneMinuteAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'No notifications to process' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = {
      processed: 0,
      emailsSent: 0,
      inAppNotificationsCreated: 0,
      errors: [] as string[]
    }

    // Process each notification
    for (const notification of notifications as Notification[]) {
      try {
        const description = notification.description || ''
        const isBroadcast = description.includes('Broadcast') || description.includes('Broadcast Email')
        const isEmail = description.includes('Email to:') || description.includes('Broadcast Email')
        
        if (isEmail) {
          // Handle email notifications
          if (isBroadcast) {
            // Broadcast email - get all users
            const { data: users, error: usersError } = await supabaseClient
              .from('v_user_dashboard')
              .select('email')
              .not('email', 'is', null)

            if (usersError) {
              throw new Error(`Failed to fetch users: ${usersError.message}`)
            }

            const emailAddresses = (users || [])
              .map((u: { email: string | null }) => u.email)
              .filter((email): email is string => email !== null)

            if (emailAddresses.length > 0 && RESEND_API_KEY) {
              // Extract message body (remove "Broadcast Email:\n\n" prefix if present)
              const messageBody = description.replace(/^Broadcast Email:\s*\n*\s*/i, '').trim()
              
              // Send email via Resend
              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: RESEND_FROM_EMAIL,
                  to: emailAddresses,
                  subject: notification.title || 'Notification',
                  html: formatEmailBody(messageBody),
                }),
              })

              if (!resendResponse.ok) {
                const errorData = await resendResponse.json()
                throw new Error(`Resend API error: ${JSON.stringify(errorData)}`)
              }

              results.emailsSent += emailAddresses.length
            }
          } else {
            // Single user email - extract email from description
            const emailMatch = description.match(/Email to:\s*([^\n]+)/i)
            if (emailMatch && RESEND_API_KEY) {
              const userEmail = emailMatch[1].trim()
              const messageBody = description.replace(/^Email to:.*\n+\s*/i, '').trim()
              
              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: RESEND_FROM_EMAIL,
                  to: userEmail,
                  subject: notification.title || 'Notification',
                  html: formatEmailBody(messageBody),
                }),
              })

              if (!resendResponse.ok) {
                const errorData = await resendResponse.json()
                throw new Error(`Resend API error: ${JSON.stringify(errorData)}`)
              }

              results.emailsSent += 1
            }
          }
        } else {
          // Handle in-app notifications
          if (isBroadcast) {
            // Broadcast in-app notification - create entries for all users
            const { data: users, error: usersError } = await supabaseClient
              .from('v_user_dashboard')
              .select('id')

            if (usersError) {
              throw new Error(`Failed to fetch users: ${usersError.message}`)
            }

            if (users && users.length > 0) {
              const notificationEntries = users.map((user: { id: string }) => ({
                user_id: user.id,
                title: notification.title || 'Notification',
                message: description,
                type: 'system',
                is_read: false,
              }))

              const { error: insertError } = await supabaseClient
                .from('community_notifications')
                .insert(notificationEntries)

              if (insertError) {
                throw new Error(`Failed to create notifications: ${insertError.message}`)
              }

              results.inAppNotificationsCreated += users.length
            }
          } else {
            // Single user in-app notification
            // Note: For single user, we'd need to store user_id in the notifications table
            // For now, this is a placeholder - you may need to adjust based on your schema
            results.errors.push(`Single user in-app notification not fully implemented for notification ${notification.id}`)
          }
        }

        // Mark notification as sent
        const { error: updateError } = await supabaseClient
          .from('notifications')
          .update({ status: true })
          .eq('id', notification.id)

        if (updateError) {
          throw new Error(`Failed to update notification status: ${updateError.message}`)
        }

        results.processed++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error processing notification ${notification.id}:`, errorMessage)
        results.errors.push(`Notification ${notification.id}: ${errorMessage}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to format email body (convert plain text to HTML)
function formatEmailBody(text: string): string {
  // Convert line breaks to <br> tags
  const html = text
    .replace(/\n/g, '<br>')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="white-space: pre-wrap;">${html}</div>
      </body>
    </html>
  `
}






