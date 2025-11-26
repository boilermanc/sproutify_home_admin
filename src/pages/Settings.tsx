import { useState } from 'react';
import { MailPlus, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { useTeamAdminContext } from '../contexts/teamAdminContextBase';
import { useAuth } from '../contexts/authContextBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Settings() {
  const { admins, loading, addAdmin, removeAdmin } = useTeamAdminContext();
  const { session } = useAuth();
  const currentEmail = session?.user.email?.toLowerCase();

  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await addAdmin(newEmail);
      setFeedback({ type: 'success', message: `${newEmail.trim()} can now access the console.` });
      setNewEmail('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add team member.';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string, email: string) {
    const confirmed = window.confirm(`Remove ${email} from admin access?`);
    if (!confirmed) return;

    setRemovingId(id);
    setFeedback(null);
    try {
      await removeAdmin(id);
      setFeedback({ type: 'success', message: `${email} no longer has access.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove team member.';
      setFeedback({ type: 'error', message });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage Sproutify admin access.</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Sproutify team access</CardTitle>
              <CardDescription>Only listed emails can sign into this console.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAdd}>
            <Label htmlFor="new-email">Invite a new admin</Label>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <MailPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="member@sproutify.app"
                  className="pl-10"
                  required
                />
              </div>
              <Button type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  'Add admin'
                )}
              </Button>
            </div>
          </form>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Authorized emails</h3>
            {admins.length === 0 ? (
              <p className="text-muted-foreground text-sm">No administrators added yet.</p>
            ) : (
              <ul className="space-y-3">
                {admins.map((admin) => {
                  const normalized = admin.email?.toLowerCase();
                  const isSelf = normalized === currentEmail;
                  return (
                    <li
                      key={admin.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground">{admin.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                        {isSelf && <Badge variant="secondary">You</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(admin.id, admin.email)}
                        disabled={isSelf || loading || removingId === admin.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {removingId === admin.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="ml-2">{removingId === admin.id ? 'Removing…' : 'Remove'}</span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
