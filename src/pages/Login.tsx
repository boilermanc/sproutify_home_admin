import { useState } from 'react';
import type { FormEvent } from 'react';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/authContextBase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-muted via-background to-transparent" />
        <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-muted/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-muted/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-border/50 shadow-2xl shadow-black/5 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Leaf className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
                <CardDescription>Sign in to your Sproutify admin account</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10"
                      placeholder="you@sproutify.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-xs font-semibold">
                      !
                    </span>
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center border-t pt-4">
              <p className="text-xs text-muted-foreground">Sproutify Admin Console</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
