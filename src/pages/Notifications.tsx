import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bell, Mail, Users, User, Loader2, CheckCircle2, AlertCircle, X, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { sendEmailViaResend, formatEmailBody } from '../services/emailService';
import { EmailAutocomplete } from '@/components/EmailAutocomplete';
import { format } from 'date-fns';

interface StatusMessage {
  type: 'success' | 'error';
  message: string;
  details?: string;
}

export function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messageType, setMessageType] = useState<'in-app' | 'email'>('email');
  const [audience, setAudience] = useState<'all' | 'single'>('single');
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  // Check for email parameter from Users page
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setTargetUserEmail(emailParam);
      setMessageType('email');
      setAudience('single');
      // Clear the parameter from URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Helper function to get minimum datetime (now) for scheduling
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  async function handleSend() {
    if (!title || !message) return;
    if (audience === 'single' && !targetUserEmail) return;
    if (sendMode === 'schedule' && !scheduledDateTime) {
      setStatus({
        type: 'error',
        message: 'Please select a date and time for scheduling',
      });
      return;
    }

    // Validate scheduled time is in the future
    if (sendMode === 'schedule') {
      const scheduled = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduled <= now) {
        setStatus({
          type: 'error',
          message: 'Scheduled time must be in the future',
        });
        return;
      }
    }

    setSending(true);
    setStatus(null);

    try {
      const scheduledTime = sendMode === 'schedule' ? new Date(scheduledDateTime).toISOString() : null;

      if (messageType === 'in-app') {
        if (audience === 'single') {
          // Look up user by email to get their UUID
          const { data: userData, error: userError } = await supabase
            .from('v_user_dashboard')
            .select('*')
            .eq('email', targetUserEmail.trim().toLowerCase())
            .single();

          if (userError || !userData) {
            throw new Error(`User not found with email: ${targetUserEmail}`);
          }

          // Type assertion since v_user_dashboard has id and email in practice
          const user = userData as unknown as { id: string; email: string | null };

          if (sendMode === 'now') {
            // Send immediately
            const { error } = await supabase
              .from('community_notifications')
              .insert({
                user_id: user.id,
                title,
                message,
                type: 'system',
                is_read: false
              });
            
            if (error) throw error;

            setStatus({
              type: 'success',
              message: `In-app notification sent to ${targetUserEmail}`,
            });
          } else {
            // Schedule for later - store in notifications table with scheduled_time
            // Note: This requires the notifications table to have scheduled_time field
            // For now, we'll use time_created as the scheduled time
            const { error } = await supabase
              .from('notifications')
              .insert({
                title,
                description: message,
                time_created: scheduledTime || new Date().toISOString(),
                status: false, // false = not sent yet
              });
            
            if (error) throw error;

            setStatus({
              type: 'success',
              message: `In-app notification scheduled for ${format(new Date(scheduledDateTime), 'PPpp')}`,
              details: 'The notification will be sent automatically at the scheduled time.',
            });
          }
        } else {
          // Broadcast to all users
          if (sendMode === 'now') {
            setStatus({
              type: 'error',
              message: "Broadcasting to all users requires a backend function to avoid timeout/rate-limits. Please use 'Schedule' mode to queue the notification.",
            });
            return;
          } else {
            // Schedule broadcast notification in the notifications table
            const { error } = await supabase
              .from('notifications')
              .insert({
                title,
                description: message,
                time_created: scheduledTime || new Date().toISOString(),
                status: false, // false = not sent yet
              });
            
            if (error) throw error;

            setStatus({
              type: 'success',
              message: `Broadcast notification scheduled for ${format(new Date(scheduledDateTime), 'PPpp')}`,
              details: 'The notification will be sent to all users automatically at the scheduled time.',
            });
          }
        }
      } else {
        // Email sending
        if (audience === 'single') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(targetUserEmail.trim())) {
            throw new Error('Please enter a valid email address');
          }

          // Look up user by email to verify they exist
          const { data: userData, error: userError } = await supabase
            .from('v_user_dashboard')
            .select('*')
            .eq('email', targetUserEmail.trim().toLowerCase())
            .single();

          if (userError || !userData) {
            throw new Error(`User not found with email: ${targetUserEmail}`);
          }

          // Type assertion since v_user_dashboard has id and email in practice
          const user = userData as unknown as { id: string; email: string | null; first_name?: string | null; last_name?: string | null };

          if (!user.email) {
            throw new Error(`User found but has no email address`);
          }

          if (sendMode === 'now') {
            // Send immediately
            const result = await sendEmailViaResend({
              to: user.email,
              subject: title,
              html: formatEmailBody(message),
            });

            if (result.success) {
              setStatus({
                type: 'success',
                message: `Email sent successfully to ${user.email}`,
                details: result.messageId ? `Message ID: ${result.messageId}` : undefined,
              });
            } else {
              throw new Error(result.error || 'Failed to send email');
            }
          } else {
            // Schedule email - store in notifications table
            // Note: For email scheduling, you may want a separate table or add email-specific fields
            const { error } = await supabase
              .from('notifications')
              .insert({
                title,
                description: `Email to: ${user.email}\n\n${message}`,
                time_created: scheduledTime || new Date().toISOString(),
                status: false, // false = not sent yet
              });
            
            if (error) throw error;

            setStatus({
              type: 'success',
              message: `Email scheduled for ${format(new Date(scheduledDateTime), 'PPpp')}`,
              details: `Email will be sent to ${user.email} at the scheduled time.`,
            });
          }
        } else {
          // Send to all users
          if (sendMode === 'now') {
            const { data: allUsers, error: usersError } = await supabase
              .from('v_user_dashboard')
              .select('*')
              .not('email', 'is', null);

            if (usersError) {
              throw new Error(`Failed to fetch users: ${usersError.message}`);
            }

            if (!allUsers || allUsers.length === 0) {
              throw new Error('No users found to send emails to');
            }

            // Type assertion since v_user_dashboard has email in practice
            const users = allUsers as unknown as Array<{ id: string; email: string | null }>;
            const emailAddresses = users
              .map(u => u.email)
              .filter((email): email is string => email !== null);

            if (emailAddresses.length === 0) {
              throw new Error('No valid email addresses found');
            }

            const result = await sendEmailViaResend({
              to: emailAddresses,
              subject: title,
              html: formatEmailBody(message),
            });

            if (result.success) {
              setStatus({
                type: 'success',
                message: `Email sent successfully to ${emailAddresses.length} users`,
                details: result.messageId ? `Message ID: ${result.messageId}` : undefined,
              });
            } else {
              throw new Error(result.error || 'Failed to send email');
            }
          } else {
            // Schedule broadcast email
            const { error } = await supabase
              .from('notifications')
              .insert({
                title,
                description: `Broadcast Email:\n\n${message}`,
                time_created: scheduledTime || new Date().toISOString(),
                status: false, // false = not sent yet
              });
            
            if (error) throw error;

            setStatus({
              type: 'success',
              message: `Broadcast email scheduled for ${format(new Date(scheduledDateTime), 'PPpp')}`,
              details: 'The email will be sent to all users automatically at the scheduled time.',
            });
          }
        }
      }
      
      // Clear form on success
      if (status?.type !== 'error') {
        setTitle('');
        setMessage('');
        setScheduledDateTime('');
        setSendMode('now');
        if (audience === 'single') {
          setTargetUserEmail('');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Messaging Center</h1>
        <p className="text-muted-foreground mt-2">Send notifications and emails to your community.</p>
      </header>

      {status && (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 flex items-start gap-3',
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          )}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{status.message}</p>
            {status.details && (
              <p className="text-sm mt-1 opacity-80">{status.details}</p>
            )}
          </div>
          <button
            onClick={() => setStatus(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Type Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 p-0 justify-center rounded-full text-xs">1</Badge>
                <CardTitle className="text-lg">Message Type</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMessageType('in-app')}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all flex flex-col gap-3',
                    messageType === 'in-app'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    messageType === 'in-app' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">In-App Notification</div>
                    <div className="text-sm text-muted-foreground">Appears in the user's activity feed</div>
                  </div>
                </button>

                <button
                  onClick={() => setMessageType('email')}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all flex flex-col gap-3',
                    messageType === 'email'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    messageType === 'email' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                  )}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email Blast</div>
                    <div className="text-sm text-muted-foreground">Sent directly to registered email</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 p-0 justify-center rounded-full text-xs">2</Badge>
                <CardTitle className="text-lg">Content</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Subject / Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={messageType === 'email' ? "Email Subject" : "Notification Title"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message Body</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audience Selection */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-6 w-6 p-0 justify-center rounded-full text-xs">3</Badge>
                <CardTitle className="text-lg">Audience</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className={cn(
                  "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                  audience === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                )}>
                  <input
                    type="radio"
                    name="audience"
                    checked={audience === 'all'}
                    onChange={() => setAudience('all')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Users className="w-4 h-4" /> All Users
                    </div>
                    <div className="text-xs text-muted-foreground">Broadcast to entire community</div>
                  </div>
                </label>

                <label className={cn(
                  "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                  audience === 'single' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                )}>
                  <input
                    type="radio"
                    name="audience"
                    checked={audience === 'single'}
                    onChange={() => setAudience('single')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <User className="w-4 h-4" /> Single User
                    </div>
                    <div className="text-xs text-muted-foreground">Target specific user by email address</div>
                  </div>
                </label>
              </div>

              {audience === 'single' && (
                <div className="space-y-2">
                  <Label htmlFor="userEmail" className="text-xs">User Email Address</Label>
                  <EmailAutocomplete
                    value={targetUserEmail}
                    onChange={setTargetUserEmail}
                    placeholder="Search by email address..."
                    className="text-sm"
                    disabled={sending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Start typing to search for a user's email address
                  </p>
                </div>
              )}

              {/* Scheduling Options */}
              <div className="pt-4 border-t space-y-3">
                <Label className="text-sm font-medium">Send Timing</Label>
                <div className="space-y-2">
                  <label className={cn(
                    "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                    sendMode === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  )}>
                    <input
                      type="radio"
                      name="sendMode"
                      checked={sendMode === 'now'}
                      onChange={() => setSendMode('now')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                        <Send className="w-4 h-4" /> Send Now
                      </div>
                      <div className="text-xs text-muted-foreground">Send immediately</div>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center p-3 rounded-lg border cursor-pointer transition-colors",
                    sendMode === 'schedule' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  )}>
                    <input
                      type="radio"
                      name="sendMode"
                      checked={sendMode === 'schedule'}
                      onChange={() => setSendMode('schedule')}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                        <Clock className="w-4 h-4" /> Schedule
                      </div>
                      <div className="text-xs text-muted-foreground">Send at a specific time</div>
                    </div>
                  </label>
                </div>

                {sendMode === 'schedule' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDateTime" className="text-xs">Date & Time</Label>
                    <Input
                      id="scheduledDateTime"
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      min={getMinDateTime()}
                      className="text-sm"
                      disabled={sending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Select when to send this notification
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSend}
                  disabled={sending || !title || !message || (audience === 'single' && !targetUserEmail) || (sendMode === 'schedule' && !scheduledDateTime)}
                  className="w-full"
                  size="lg"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {sendMode === 'schedule' ? 'Scheduling...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      {sendMode === 'schedule' ? (
                        <>
                          <Clock className="w-4 h-4" />
                          Schedule Message
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  {sendMode === 'schedule' 
                    ? (audience === 'all' 
                        ? 'This will be scheduled to reach all users.' 
                        : 'This will be scheduled to reach 1 user.')
                    : (audience === 'all' 
                        ? 'This will reach all users immediately.' 
                        : 'This will reach 1 user immediately.')
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
