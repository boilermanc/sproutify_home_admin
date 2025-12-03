import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Download,
  RefreshCcw,
  Search as SearchIcon,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

const PER_PAGE = 25;

type SortField = 'email' | 'subscription_tier' | 'subscription_platform' | 'trial_converted_at' | 'subscription_start_date';

type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface TrialConversion {
  email: string | null;
  subscription_tier: string | null;
  subscription_platform: string | null;
  trial_status: string | null;
  trial_converted_at: string | null;
  subscription_start_date: string | null;
}

const dateFields: SortField[] = ['trial_converted_at', 'subscription_start_date'];

function toDateValue(value: string | number | null | undefined) {
  if (!value) return 0;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

export function TrialConversions() {
  const [conversions, setConversions] = useState<TrialConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'trial_converted_at', direction: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('email, subscription_tier, subscription_platform, trial_status, trial_converted_at, subscription_start_date')
        .eq('trial_status', 'converted')
        .order('trial_converted_at', { ascending: false });
      
      if (queryError) {
        console.error('Supabase query error:', queryError);
        throw queryError;
      }
      
      if (data && Array.isArray(data)) {
        setConversions(data as TrialConversion[]);
      } else {
        setConversions([]);
      }
    } catch (err) {
      console.error('Error fetching trial conversions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trial conversions';
      setError(errorMessage);
      setConversions([]);
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

  const filteredConversions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return conversions.filter((conversion) => {
      const searchPool = [
        conversion.email,
        conversion.subscription_tier,
        conversion.subscription_platform,
      ].map((value) => (value ?? '').toString().toLowerCase());
      return !normalizedSearch || searchPool.some((value) => value.includes(normalizedSearch));
    });
  }, [conversions, search]);

  const sortedConversions = useMemo(() => {
    const cloned = [...filteredConversions];
    cloned.sort((a, b) => {
      let aValue: string | number = a[sort.field];
      let bValue: string | number = b[sort.field];

      if (dateFields.includes(sort.field)) {
        const aDateValue = toDateValue(aValue as string | number | null | undefined);
        const bDateValue = toDateValue(bValue as string | number | null | undefined);
        aValue = aDateValue;
        bValue = bDateValue;
      } else {
        aValue = (aValue ?? '').toString().toLowerCase();
        bValue = (bValue ?? '').toString().toLowerCase();
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [filteredConversions, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedConversions.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedConversions = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedConversions.slice(start, start + PER_PAGE);
  }, [sortedConversions, page]);

  const startIndex = sortedConversions.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endIndex = sortedConversions.length === 0 ? 0 : Math.min(page * PER_PAGE, sortedConversions.length);

  const exportCSV = () => {
    const headers = ['Email', 'Subscription Tier', 'Subscription Platform', 'Trial Converted At', 'Subscription Start Date'];

    const rows = filteredConversions.map((c) => [
      c.email ?? '',
      c.subscription_tier ?? '',
      c.subscription_platform ?? '',
      c.trial_converted_at ? new Date(c.trial_converted_at).toLocaleString() : '',
      c.subscription_start_date ? new Date(c.subscription_start_date).toLocaleString() : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-conversions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-red-600" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error Loading Conversions</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchConversions}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Trial Conversions</h1>
            <p className="text-sm text-muted-foreground">View all users who converted from trial</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchConversions}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <p className="text-2xl font-bold text-foreground">{conversions.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-foreground">
              {conversions.filter((c) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return c.trial_converted_at && new Date(c.trial_converted_at) >= weekAgo;
              }).length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-foreground">
              {conversions.filter((c) => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return c.trial_converted_at && new Date(c.trial_converted_at) >= monthAgo;
              }).length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by email, tier, or platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
                  <SortableHeader label="Email" field="email" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Subscription Tier" field="subscription_tier" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Platform" field="subscription_platform" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Converted At" field="trial_converted_at" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Subscription Start" field="subscription_start_date" currentSort={sort} onSort={handleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedConversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {search ? 'No conversions found matching your search' : 'No trial conversions yet'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedConversions.map((conversion, index) => {
                  const initials = (conversion.email?.[0] ?? '?').toUpperCase();

                  return (
                    <TableRow key={`${conversion.email}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{conversion.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{conversion.subscription_tier || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{conversion.subscription_platform || '—'}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(conversion.trial_converted_at) ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(conversion.subscription_start_date) ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {sortedConversions.length > PER_PAGE && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {sortedConversions.length} conversions
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
        {filteredConversions.length} conversion{filteredConversions.length !== 1 ? 's' : ''} match your search
      </p>
    </div>
  );
}

