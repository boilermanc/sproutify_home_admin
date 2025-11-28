import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Download,
  RefreshCcw,
  Search as SearchIcon,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type SortField = 'first_name' | 'email' | 'inserted_at';

type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface CommunitySignup {
  id: string;
  first_name: string;
  email: string;
  inserted_at: string;
}

const dateFields: SortField[] = ['inserted_at'];

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

export function CommunitySignups() {
  const [signups, setSignups] = useState<CommunitySignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'inserted_at', direction: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_signups')
        .select('*')
        .order('inserted_at', { ascending: false });
      
      if (error) throw error;
      setSignups((data ?? []) as CommunitySignup[]);
    } catch (error) {
      console.error('Error fetching community signups:', error);
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

  const filteredSignups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return signups.filter((signup) => {
      const searchPool = [signup.email, signup.first_name].map((value) =>
        (value ?? '').toString().toLowerCase()
      );
      return !normalizedSearch || searchPool.some((value) => value.includes(normalizedSearch));
    });
  }, [signups, search]);

  const sortedSignups = useMemo(() => {
    const cloned = [...filteredSignups];
    cloned.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      if (dateFields.includes(sort.field)) {
        aValue = toDateValue(aValue as string | number | null | undefined);
        bValue = toDateValue(bValue as string | number | null | undefined);
      } else {
        aValue = (aValue ?? '').toString().toLowerCase();
        bValue = (bValue ?? '').toString().toLowerCase();
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [filteredSignups, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedSignups.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedSignups = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedSignups.slice(start, start + PER_PAGE);
  }, [sortedSignups, page]);

  const startIndex = sortedSignups.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endIndex = sortedSignups.length === 0 ? 0 : Math.min(page * PER_PAGE, sortedSignups.length);

  const exportCSV = () => {
    const headers = ['First Name', 'Email', 'Signed Up'];

    const rows = filteredSignups.map((s) => [
      s.first_name ?? '',
      s.email ?? '',
      s.inserted_at ? new Date(s.inserted_at).toLocaleString() : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-signups-${new Date().toISOString().split('T')[0]}.csv`;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Community Signups</h1>
            <p className="text-sm text-muted-foreground">View all community signups</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchSignups}>
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
              <UserPlus className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">Total Signups</p>
            <p className="text-2xl font-bold text-foreground">{signups.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
              <UserPlus className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-foreground">
              {signups.filter((s) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(s.inserted_at) >= weekAgo;
              }).length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="h-9 w-9 rounded-full border flex items-center justify-center mb-2">
              <UserPlus className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-foreground">
              {signups.filter((s) => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return new Date(s.inserted_at) >= monthAgo;
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
              placeholder="Search by name or email..."
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
                  <SortableHeader label="Name" field="first_name" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableHeader label="Email" field="email" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader label="Signed Up" field="inserted_at" currentSort={sort} onSort={handleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSignups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                    {search ? 'No signups found matching your search' : 'No signups yet'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSignups.map((signup) => {
                  const initials = (signup.first_name?.[0] ?? signup.email?.[0] ?? '?').toUpperCase();

                  return (
                    <TableRow key={signup.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{signup.first_name || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate">{signup.email}</p>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(signup.inserted_at) ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {sortedSignups.length > PER_PAGE && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {sortedSignups.length} signups
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
        {filteredSignups.length} signup{filteredSignups.length !== 1 ? 's' : ''} match your search
      </p>
    </div>
  );
}

