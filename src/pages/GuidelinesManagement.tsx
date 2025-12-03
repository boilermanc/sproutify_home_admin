import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, CheckCircle2, AlertTriangle, TrendingUp, RefreshCw, RotateCcw, Loader2, Info } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import clsx from 'clsx';

type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  community_guidelines_accepted_at?: string | null;
};

type Statistics = {
  totalUsers: number;
  accepted: number;
  notAccepted: number;
  acceptanceRate: number;
};

type ViewMode = 'stats' | 'not_accepted' | 'recent';

export function GuidelinesManagement() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [usersNotAccepted, setUsersNotAccepted] = useState<Profile[]>([]);
  const [recentAcceptances, setRecentAcceptances] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [error, setError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [bulkResetDialogOpen, setBulkResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([loadStatistics(), loadUsersNotAccepted(), loadRecentAcceptances()]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      // Get total users count
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get users who accepted (have community_guidelines_accepted_at set)
      const { count: acceptedCount, error: acceptedError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('community_guidelines_accepted_at', 'is', null);

      if (acceptedError) throw acceptedError;

      const total = totalUsers ?? 0;
      const accepted = acceptedCount ?? 0;
      const notAccepted = total - accepted;
      const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

      setStatistics({
        totalUsers: total,
        accepted,
        notAccepted,
        acceptanceRate,
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
      throw err;
    }
  }, []);

  const loadUsersNotAccepted = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, username, first_name, last_name, created_at')
        .is('community_guidelines_accepted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setUsersNotAccepted((data as Profile[]) ?? []);
    } catch (err) {
      console.error('Error loading users not accepted:', err);
      throw err;
    }
  }, []);

  const loadRecentAcceptances = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, username, first_name, last_name, community_guidelines_accepted_at')
        .not('community_guidelines_accepted_at', 'is', null)
        .order('community_guidelines_accepted_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setRecentAcceptances((data as Profile[]) ?? []);
    } catch (err) {
      console.error('Error loading recent acceptances:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetAcceptance = useCallback(
    async (userId: string) => {
      try {
        setIsResetting(true);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ community_guidelines_accepted_at: null })
          .eq('id', userId);

        if (updateError) throw updateError;

        await loadData();
        setResetDialogOpen(false);
        setSelectedUser(null);
        setError(null);
      } catch (err) {
        console.error('Error resetting acceptance:', err);
        setError(err instanceof Error ? err.message : 'Failed to reset acceptance');
      } finally {
        setIsResetting(false);
      }
    },
    [loadData]
  );

  const bulkResetAll = useCallback(async () => {
    try {
      setIsResetting(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ community_guidelines_accepted_at: null });

      if (updateError) throw updateError;

      await loadData();
      setBulkResetDialogOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error bulk resetting:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset all acceptances');
    } finally {
      setIsResetting(false);
    }
  }, [loadData]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getUserDisplayName = (user: Profile) => {
    if (user.username) return user.username;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.email) return user.email.split('@')[0];
    return 'Unknown User';
  };

  const getUserInitials = (user: Profile) => {
    const name = getUserDisplayName(user);
    return name.charAt(0).toUpperCase();
  };

  if (isLoading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-gray-500">Loading guidelines data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guidelines Management</h1>
          <p className="text-gray-600 mt-1">Manage community guidelines acceptance across all users.</p>
        </div>
        <Button onClick={() => void loadData()} disabled={isLoading} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
          <Button onClick={() => setError(null)} variant="ghost" size="sm" className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="not_accepted">Not Accepted</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {statistics && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Users"
                  value={statistics.totalUsers.toLocaleString()}
                  icon={Users}
                  color="text-blue-600"
                />
                <StatCard
                  label="Accepted"
                  value={statistics.accepted.toLocaleString()}
                  icon={CheckCircle2}
                  color="text-green-600"
                />
                <StatCard
                  label="Not Accepted"
                  value={statistics.notAccepted.toLocaleString()}
                  icon={AlertTriangle}
                  color="text-red-600"
                />
                <StatCard
                  label="Acceptance Rate"
                  value={`${statistics.acceptanceRate.toFixed(1)}%`}
                  icon={TrendingUp}
                  color="text-purple-600"
                />
              </div>

              {/* Progress bar */}
              <Card>
                <CardHeader>
                  <CardTitle>Acceptance Progress</CardTitle>
                  <CardDescription>
                    {statistics.accepted} of {statistics.totalUsers} users have accepted the guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-green-600 h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${statistics.acceptanceRate}%` }}
                      >
                        {statistics.acceptanceRate > 10 && (
                          <span className="text-xs font-semibold text-white">
                            {statistics.acceptanceRate.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {statistics.acceptanceRate <= 10 && (
                      <p className="text-sm text-gray-600 text-right">{statistics.acceptanceRate.toFixed(1)}%</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Reset guidelines acceptance for users. Use this when guidelines are updated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setBulkResetDialogOpen(true)}
                    variant="outline"
                    className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Acceptances
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will require all users to re-accept the guidelines before posting.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="not_accepted" className="space-y-4">
          {usersNotAccepted.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All users have accepted!</h3>
                <p className="text-gray-500 text-center">Every user has accepted the community guidelines.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Info className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <strong>{usersNotAccepted.length}</strong> users have not accepted the guidelines
                </p>
              </div>
              <div className="space-y-2">
                {usersNotAccepted.map((user) => (
                  <UserCard key={user.id} user={user} formatDate={formatDate} getUserDisplayName={getUserDisplayName} getUserInitials={getUserInitials} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentAcceptances.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent acceptances</h3>
                <p className="text-gray-500 text-center">No users have accepted the guidelines yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentAcceptances.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  formatDate={formatDate}
                  getUserDisplayName={getUserDisplayName}
                  getUserInitials={getUserInitials}
                  showReset
                  onReset={() => {
                    setSelectedUser(user);
                    setResetDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reset Individual Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Guidelines Acceptance</DialogTitle>
            <DialogDescription>
              Reset guidelines acceptance for {selectedUser ? getUserDisplayName(selectedUser) : 'this user'}?
              <br />
              <br />
              They will be required to accept again before posting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)} disabled={isResetting}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && void resetAcceptance(selectedUser.id)}
              disabled={isResetting || !selectedUser}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reset Dialog */}
      <Dialog open={bulkResetDialogOpen} onOpenChange={setBulkResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Acceptances</DialogTitle>
            <DialogDescription>
              This will reset guidelines acceptance for <strong>ALL users</strong>. They will all be required to
              accept again before posting.
              <br />
              <br />
              <strong>Use this when guidelines are updated.</strong>
              <br />
              <br />
              Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkResetDialogOpen(false)} disabled={isResetting}>
              Cancel
            </Button>
            <Button onClick={() => void bulkResetAll()} disabled={isResetting} className="bg-red-600 hover:bg-red-700">
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={clsx('p-3 rounded-xl bg-gray-100', color)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserCard({
  user,
  formatDate,
  getUserDisplayName,
  getUserInitials,
  showReset = false,
  onReset,
}: {
  user: Profile;
  formatDate: (date: string | null | undefined) => string;
  getUserDisplayName: (user: Profile) => string;
  getUserInitials: (user: Profile) => string;
  showReset?: boolean;
  onReset?: () => void;
}) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const acceptedAt = user.community_guidelines_accepted_at;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
            <p className="text-sm text-gray-500 truncate">{user.email || 'No email'}</p>
            {acceptedAt ? (
              <div className="mt-1">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Accepted: {formatDate(acceptedAt)}
                </Badge>
              </div>
            ) : (
              user.created_at && (
                <div className="mt-1">
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Joined: {formatDate(user.created_at)}
                  </Badge>
                </div>
              )
            )}
          </div>
          {showReset && acceptedAt && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

