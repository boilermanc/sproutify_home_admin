import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Activity,
  Crown,
  DollarSign,
  Download,
  FlaskConical,
  RefreshCcw,
  Search as SearchIcon,
  Trash2,
  Users as UsersIcon,
  X,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

const PER_PAGE = 25;

type SortField =
  | 'email'
  | 'user_status'
  | 'engagement_status'
  | 'active_towers'
  | 'active_plants'
  | 'total_spent'
  | 'created_at'
  | 'last_activity_date';

type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface DashboardUser {
  id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_status: string | null;
  engagement_status: string | null;
  profile_completeness: string | null;
  created_at: string | null;
  last_activity_date: string | null;
  gardening_experience: string | null;
  subscription_tier: string | null;
  subscription_platform: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  trial_status: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_days_remaining: number | null;
  active_towers: number | null;
  total_towers: number | null;
  active_plants: number | null;
  total_plants: number | null;
  total_spent: number | string | null;
  total_purchases: number | null;
  first_login_email_sent: boolean | null;
  day2_email_sent: boolean | null;
  day4_email_sent: boolean | null;
  day6_email_sent: boolean | null;
  current_streak: number | null;
  total_xp: number | null;
  current_level: number | null;
  [key: string]: string | number | boolean | null | undefined;
}

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Trial Active', value: 'trial_active' },
  { label: 'Subscribed', value: 'subscribed' },
  { label: 'Lifetime', value: 'lifetime' },
  { label: 'Trial Expired', value: 'trial_expired' },
  { label: 'Churned', value: 'churned' },
];

const ENGAGEMENT_OPTIONS = [
  { label: 'All Engagement', value: 'all' },
  { label: 'Active (7 days)', value: 'active_7d' },
  { label: 'Active (30 days)', value: 'active_30d' },
  { label: 'Dormant', value: 'dormant' },
  { label: 'Never Active', value: 'never_active' },
];

const PROFILE_OPTIONS = [
  { label: 'All Profiles', value: 'all' },
  { label: 'Complete', value: 'complete' },
  { label: 'Partial', value: 'partial' },
  { label: 'Minimal', value: 'minimal' },
];

const numberFields: SortField[] = ['active_towers', 'active_plants', 'total_spent'];
const dateFields: SortField[] = ['created_at', 'last_activity_date'];

function toNumber(value: string | number | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function toDateValue(value: string | number | null | undefined) {
  if (!value) return 0;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatCurrency(value: string | number | null | undefined, withCents = true) {
  const amount = toNumber(value);
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Unknown';
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

interface StatusBadgeProps {
  status: string | null | undefined;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    trial_active: { label: 'Trial Active', variant: 'default' },
    subscribed: { label: 'Subscribed', variant: 'default' },
    lifetime: { label: 'Lifetime', variant: 'default' },
    trial_expired: { label: 'Trial Expired', variant: 'destructive' },
    churned: { label: 'Churned', variant: 'secondary' },
    active_7d: { label: 'Active (7d)', variant: 'default' },
    active_30d: { label: 'Active (30d)', variant: 'default' },
    dormant: { label: 'Dormant', variant: 'outline' },
    never_active: { label: 'Never Active', variant: 'secondary' },
    complete: { label: 'Complete', variant: 'default' },
    partial: { label: 'Partial', variant: 'outline' },
    minimal: { label: 'Minimal', variant: 'secondary' },
  };

  const safeStatus = status ?? 'unknown';
  const config = configs[safeStatus] ?? { label: formatLabel(safeStatus), variant: 'secondary' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

interface DeleteConfirmationDialogProps {
  user: DashboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog = ({ user, isOpen, onClose, onConfirm }: DeleteConfirmationDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete || !user) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete User</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and all associated data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">User to be deleted:</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            {user.first_name || user.last_name ? (
              <p className="text-sm text-muted-foreground">
                {user.first_name} {user.last_name}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-bold">DELETE</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface UserDetailModalProps {
  user: DashboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (user: DashboardUser) => void;
}

const UserDetailModal = ({ user, isOpen, onClose, onDelete }: UserDetailModalProps) => {
  const navigate = useNavigate();
  
  if (!user) return null;

  const DetailRow = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string | number | null | undefined;
    highlight?: boolean;
  }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-600' : 'text-foreground'}`}>
        {value ?? '—'}
      </span>
    </div>
  );

  const daysRemaining = typeof user.trial_days_remaining === 'number' ? user.trial_days_remaining : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={user.user_status} />
            <StatusBadge status={user.engagement_status} />
            <StatusBadge status={user.profile_completeness} />
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <DetailRow label="User ID" value={user.id ? `${user.id.slice(0, 8)}...` : null} />
              <DetailRow label="Created" value={formatDate(user.created_at)} />
              <DetailRow label="Gardening Experience" value={user.gardening_experience} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <DetailRow label="Status" value={formatLabel(user.user_status)} />
              <DetailRow label="Tier" value={user.subscription_tier} highlight={Boolean(user.subscription_tier)} />
              <DetailRow label="Platform" value={user.subscription_platform} />
              <DetailRow label="Start Date" value={formatDate(user.subscription_start_date)} />
              <DetailRow label="End Date" value={formatDate(user.subscription_end_date)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Trial</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <DetailRow label="Trial Status" value={formatLabel(user.trial_status)} />
              <DetailRow label="Started" value={formatDate(user.trial_started_at)} />
              <DetailRow label="Ends" value={formatDate(user.trial_ends_at)} />
              <DetailRow
                label="Days Remaining"
                value={daysRemaining}
                highlight={typeof daysRemaining === 'number' && daysRemaining <= 2 && daysRemaining > 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Email Sequence</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <div className="flex flex-wrap gap-2 py-2">
                {[
                  { label: 'First Login', sent: user.first_login_email_sent },
                  { label: 'Day 2', sent: user.day2_email_sent },
                  { label: 'Day 4', sent: user.day4_email_sent },
                  { label: 'Day 6', sent: user.day6_email_sent },
                ].map((email) => (
                  <Badge key={email.label} variant={email.sent ? 'default' : 'secondary'}>
                    {email.sent ? '✓' : '○'} {email.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <DetailRow label="Last Active" value={formatDate(user.last_activity_date) ?? 'Never'} />
              <DetailRow
                label="Current Streak"
                value={typeof user.current_streak === 'number' ? `${user.current_streak} days` : null}
              />
              <DetailRow
                label="Total XP"
                value={typeof user.total_xp === 'number' ? user.total_xp.toLocaleString() : null}
              />
              <DetailRow label="Level" value={user.current_level} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Activity</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{user.total_towers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Towers</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{user.active_towers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Towers</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{user.total_plants ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Plants</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{user.active_plants ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Plants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            <CardHeader className="py-3">
              <CardTitle className="text-sm text-white/80">Spending</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{formatCurrency(user.total_spent)}</p>
                  <p className="text-sm text-white/80">Total Spent</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{user.total_purchases ?? 0}</p>
                  <p className="text-sm text-white/80">Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            {user.email && (
              <Button
                variant="default"
                onClick={() => {
                  navigate(`/notifications?email=${encodeURIComponent(user.email!)}`);
                  onClose();
                }}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => onDelete(user)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortState;
  onSort: (field: SortField) => void;
}

const SortableHeader = ({ label, field, currentSort, onSort }: SortableHeaderProps) => {
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-sm font-semibold hover:text-foreground transition-colors w-full"
    >
      {label}
      <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`}>
        {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
      </span>
    </button>
  );
};

export function Users() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEngagement, setFilterEngagement] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');
  const [sort, setSort] = useState<SortState>({ field: 'created_at', direction: 'desc' });
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('v_user_dashboard').select('*');
      if (error) throw error;
      setUsers((data ?? []) as DashboardUser[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      const searchPool = [user.email, user.first_name, user.last_name].map((value) =>
        (value ?? '').toString().toLowerCase()
      );
      const matchesSearch = !normalizedSearch || searchPool.some((value) => value.includes(normalizedSearch));
      const matchesStatus = filterStatus === 'all' || user.user_status === filterStatus;
      const matchesEngagement = filterEngagement === 'all' || user.engagement_status === filterEngagement;
      const matchesProfile = filterProfile === 'all' || user.profile_completeness === filterProfile;
      return matchesSearch && matchesStatus && matchesEngagement && matchesProfile;
    });
  }, [users, search, filterStatus, filterEngagement, filterProfile]);

  const sortedUsers = useMemo(() => {
    const cloned = [...filteredUsers];
    cloned.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      if (dateFields.includes(sort.field)) {
        aValue = toDateValue(aValue as string | number | null | undefined);
        bValue = toDateValue(bValue as string | number | null | undefined);
      } else if (numberFields.includes(sort.field)) {
        aValue = toNumber(aValue as string | number | null | undefined);
        bValue = toNumber(bValue as string | number | null | undefined);
      } else {
        aValue = (aValue ?? '').toString().toLowerCase();
        bValue = (bValue ?? '').toString().toLowerCase();
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [filteredUsers, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterEngagement, filterProfile]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedUsers.slice(start, start + PER_PAGE);
  }, [sortedUsers, page]);

  const startIndex = sortedUsers.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endIndex = sortedUsers.length === 0 ? 0 : Math.min(page * PER_PAGE, sortedUsers.length);

  const totalRevenue = useMemo(
    () => users.reduce((sum, user) => sum + toNumber(user.total_spent), 0),
    [users]
  );

  const exportCSV = () => {
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Status',
      'Subscription Tier',
      'Trial Days Left',
      'Engagement',
      'Towers',
      'Plants',
      'Total Spent',
      'Created',
    ];

    const rows = filteredUsers.map((u) => [
      u.email ?? '',
      u.first_name ?? '',
      u.last_name ?? '',
      u.user_status ?? '',
      u.subscription_tier ?? '',
      u.trial_days_remaining ?? '',
      u.engagement_status ?? '',
      u.active_towers ?? '',
      u.active_plants ?? '',
      toNumber(u.total_spent),
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sproutify-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.email) return;

    try {
      const { data, error } = await supabase.rpc('delete_user_by_email', {
        target_email: userToDelete.email,
      });

      if (error) {
        throw error;
      }

      // Refresh the users list
      await fetchUsers();
      
      // Close modals
      setUserToDelete(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length.toLocaleString(), icon: UsersIcon },
    { label: 'Active Trials', value: users.filter((u) => u.user_status === 'trial_active').length.toLocaleString(), icon: FlaskConical },
    { label: 'Subscribers', value: users.filter((u) => ['subscribed', 'lifetime'].includes(u.user_status ?? '')).length.toLocaleString(), icon: Crown },
    { label: 'Active (7d)', value: users.filter((u) => u.engagement_status === 'active_7d').length.toLocaleString(), icon: Activity },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue, false), icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-9 w-9 rounded-full mb-2" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-7 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border flex items-center justify-center">
            <UsersIcon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground">View and manage all users</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEngagement} onValueChange={setFilterEngagement}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by engagement" />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterProfile} onValueChange={setFilterProfile}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by profile" />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader label="User" field="email" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Status" field="user_status" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Engagement" field="engagement_status" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-center">
                  <SortableHeader label="Towers" field="active_towers" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-center">
                  <SortableHeader label="Plants" field="active_plants" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader label="Spent" field="total_spent" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader label="Joined" field="created_at" currentSort={sort} onSort={handleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No users found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => {
                  const rowKey = user.id ?? user.email ?? `user-${index}`;
                  const fullName =
                    user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.email?.split('@')[0] ?? 'Unknown';
                  const initials = (user.first_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase();
                  const spent = toNumber(user.total_spent);

                  return (
                    <TableRow
                      key={rowKey}
                      onClick={() => setSelectedUser(user)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{fullName}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.user_status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.engagement_status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-foreground">{user.active_towers ?? 0}</span>
                        {typeof user.total_towers === 'number' && user.total_towers > (user.active_towers ?? 0) && (
                          <span className="text-sm text-muted-foreground"> / {user.total_towers}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium text-foreground">{user.active_plants ?? 0}</span>
                        {typeof user.total_plants === 'number' && user.total_plants > (user.active_plants ?? 0) && (
                          <span className="text-sm text-muted-foreground"> / {user.total_plants}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium ${spent > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {formatCurrency(user.total_spent)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(user.created_at) ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {sortedUsers.length > PER_PAGE && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {sortedUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-1.5 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        {filteredUsers.length} users match your filters
      </p>

      <UserDetailModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onDelete={(user) => {
          setSelectedUser(null);
          setUserToDelete(user);
        }}
      />
      
      <DeleteConfirmationDialog
        user={userToDelete}
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
