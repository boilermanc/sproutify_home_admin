import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Content } from './pages/Content';
import { Challenges } from './pages/Challenges';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { CommunitySignups } from './pages/CommunitySignups';
import { TrialConversions } from './pages/TrialConversions';
import { Moderation } from './pages/Moderation';
import { ProfanityFilter } from './pages/ProfanityFilter';
import { GuidelinesManagement } from './pages/GuidelinesManagement';
import { FeedManagement } from './pages/FeedManagement';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/authContextBase';
import { TeamAdminProvider } from './contexts/TeamAdminContext';
import { fetchTeamAdmins, type TeamAdmin } from './contexts/teamAdminContextBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  const [adminList, setAdminList] = useState<TeamAdmin[] | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // useMemo must be called unconditionally (before any early returns)
  const allowedEmailSet = useMemo(
    () => new Set((adminList ?? []).map((admin) => admin.email?.toLowerCase()).filter(Boolean) as string[]),
    [adminList]
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setAdminLoading(true);
      fetchTeamAdmins()
        .then((admins) => {
          if (!isMounted) return;
          setAdminList(admins);
          setAdminError(null);
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error('Error loading team admins', error);
          setAdminError(error.message ?? 'Unable to load access list');
          setAdminList([]);
        })
        .finally(() => {
          if (!isMounted) return;
          setAdminLoading(false);
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [session, session?.user?.id]);

  if (loading) {
    return <LoadingScreen message="Loading Sproutify admin…" />;
  }

  if (!session) {
    return <Login />;
  }

  if (adminLoading || adminList === null) {
    return <LoadingScreen message="Confirming access…" />;
  }

  if (adminError) {
    return <AccessError message={adminError} />;
  }

  const userEmail = session.user.email?.toLowerCase() ?? '';
  const isAllowed = allowedEmailSet.has(userEmail);

  if (!isAllowed) {
    return <Unauthorized email={session.user.email ?? 'Unknown'} />;
  }

  return (
    <TeamAdminProvider initialAdmins={adminList} onChange={setAdminList}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="content" element={<Content />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="community-signups" element={<CommunitySignups />} />
          <Route path="trial-conversions" element={<TrialConversions />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="profanity-filter" element={<ProfanityFilter />} />
          <Route path="guidelines" element={<GuidelinesManagement />} />
          <Route path="feed" element={<FeedManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </TeamAdminProvider>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
      <div className="w-64 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function Unauthorized({ email }: { email: string }) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <CardTitle className="text-2xl">Access restricted</CardTitle>
          <CardDescription className="text-base">
            The account <span className="font-semibold text-foreground">{email}</span> is not authorized to access the Sproutify admin console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signOut()}
            className="w-full"
            size="lg"
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AccessError({ message }: { message: string }) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <CardTitle className="text-2xl">Unable to verify access</CardTitle>
          <CardDescription>We couldn't load the Sproutify team access list.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-destructive bg-destructive/10 rounded-lg p-3">{message}</p>
          <Button
            onClick={() => signOut()}
            className="w-full"
            size="lg"
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
