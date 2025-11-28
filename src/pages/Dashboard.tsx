import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Hourglass,
  Star,
  TrendingUp,
  Building2,
  Leaf,
  MapPin,
  Target,
  Timer,
  ClipboardList,
  HeartPulse,
  RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type UserDashboardRow = {
  user_status: string | null;
  trial_status: string | null;
  trial_days_remaining: number | null;
  active_towers: number | null;
  active_plants: number | null;
  profile_completeness: string | null;
  engagement_status: string | null;
};

type UserProfileRow = Pick<Database['public']['Views']['v_user_profiles']['Row'], 'profile_created_at' | 'auth_created_at'>;

type ActivityPoint = { key: string; name: string; users: number };

type BreakdownItem = {
  label: string;
  count: number;
  color?: string;
};

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  trend?: number | null;
};

type BreakdownCardProps = {
  title: string;
  data: BreakdownItem[];
  icon: ReactNode;
};

const ACTIVITY_DAYS = 7;

function buildActivitySkeleton(): ActivityPoint[] {
  const today = new Date();
  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = new Date(today);
    const offset = ACTIVITY_DAYS - index - 1;
    date.setDate(today.getDate() - offset);
    date.setHours(0, 0, 0, 0);

    return {
      key: date.toISOString().slice(0, 10),
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      users: 0,
    };
  });
}

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [map]);

  return null;
}

const StatCard = ({ title, value, subtitle, icon, trend }: StatCardProps) => {
  const trendLabel =
    typeof trend === 'number'
      ? `${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} ${Math.abs(trend).toFixed(1)}%`
      : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl border bg-background shadow-sm">
            {icon}
          </div>
          {trendLabel && (
            <Badge 
              variant={trend && trend > 0 ? 'default' : trend && trend < 0 ? 'destructive' : 'secondary'}
              className="font-medium"
            >
              {trendLabel}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const BreakdownCard = ({ title, data, icon }: BreakdownCardProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg border bg-background shadow-sm">{icon}</span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough data yet.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={`${item.label}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-foreground font-semibold">{item.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-primary'}`}
                    style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTrials: 0,
    subscribers: 0,
    conversionRate: 0,
    totalTowers: 0,
    totalPlants: 0,
  });
  const [userStatus, setUserStatus] = useState<BreakdownItem[]>([]);
  const [trialFunnel, setTrialFunnel] = useState<BreakdownItem[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<BreakdownItem[]>([]);
  const [engagement, setEngagement] = useState<BreakdownItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityPoint[]>(() => buildActivitySkeleton());
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const totalUsersDisplay = useMemo(() => stats.totalUsers.toLocaleString(), [stats.totalUsers]);
  const activeTrialsDisplay = useMemo(() => stats.activeTrials.toLocaleString(), [stats.activeTrials]);
  const subscribersDisplay = useMemo(() => stats.subscribers.toLocaleString(), [stats.subscribers]);
  const towersDisplay = useMemo(() => stats.totalTowers.toLocaleString(), [stats.totalTowers]);
  const plantsDisplay = useMemo(() => stats.totalPlants.toLocaleString(), [stats.totalPlants]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase.from('v_user_dashboard').select('*');

      if (error) {
        throw error;
      }

      const safeUsers = (users ?? []) as UserDashboardRow[];
      const totalUsers = safeUsers.length;
      const activeTrials = safeUsers.filter((u) => u.user_status === 'trial_active').length;
      const subscribers = safeUsers.filter((u) => ['subscribed', 'lifetime'].includes(u.user_status ?? '')).length;
      const expiredTrials = safeUsers.filter((u) => u.user_status === 'trial_expired').length;
      const totalConversionPool = subscribers + expiredTrials;
      const conversionRate =
        totalConversionPool > 0 ? Number(((subscribers / totalConversionPool) * 100).toFixed(1)) : 0;
      const totalTowers = safeUsers.reduce((sum, u) => sum + (u.active_towers ?? 0), 0);
      const totalPlants = safeUsers.reduce((sum, u) => sum + (u.active_plants ?? 0), 0);

      setStats({
        totalUsers,
        activeTrials,
        subscribers,
        conversionRate,
        totalTowers,
        totalPlants,
      });

      const statusCounts = safeUsers.reduce<Record<string, number>>((acc, u) => {
        if (!u.user_status) return acc;
        acc[u.user_status] = (acc[u.user_status] ?? 0) + 1;
        return acc;
      }, {});

      setUserStatus(
        [
          { label: 'Active Trial', count: statusCounts.trial_active ?? 0, color: 'bg-emerald-500' },
          { label: 'Subscribed', count: statusCounts.subscribed ?? 0, color: 'bg-violet-500' },
          { label: 'Lifetime', count: statusCounts.lifetime ?? 0, color: 'bg-amber-500' },
          { label: 'Trial Expired', count: statusCounts.trial_expired ?? 0, color: 'bg-rose-400' },
          { label: 'Churned', count: statusCounts.churned ?? 0, color: 'bg-muted-foreground' },
        ].filter((item) => item.count > 0)
      );

      const funnelCounts = safeUsers
        .filter((u) => u.trial_status === 'active')
        .reduce<Record<string, number>>((acc, u) => {
          const days = u.trial_days_remaining ?? 0;
          if (days >= 6) acc['Day 1-2'] = (acc['Day 1-2'] ?? 0) + 1;
          else if (days >= 3) acc['Day 3-5'] = (acc['Day 3-5'] ?? 0) + 1;
          else if (days >= 0) acc['Day 6-7'] = (acc['Day 6-7'] ?? 0) + 1;
          else acc['Expired'] = (acc['Expired'] ?? 0) + 1;
          return acc;
        }, {});

      setTrialFunnel(
        [
          { label: 'Day 1-2 (New)', count: funnelCounts['Day 1-2'] ?? 0, color: 'bg-sky-500' },
          { label: 'Day 3-5 (Mid)', count: funnelCounts['Day 3-5'] ?? 0, color: 'bg-teal-500' },
          { label: 'Day 6-7 (Ending)', count: funnelCounts['Day 6-7'] ?? 0, color: 'bg-amber-500' },
          { label: 'Expired', count: funnelCounts['Expired'] ?? 0, color: 'bg-rose-400' },
        ].filter((item) => item.count > 0)
      );

      const profileCounts = safeUsers.reduce<Record<string, number>>((acc, u) => {
        if (!u.profile_completeness) return acc;
        acc[u.profile_completeness] = (acc[u.profile_completeness] ?? 0) + 1;
        return acc;
      }, {});

      setProfileCompletion(
        [
          { label: 'Complete', count: profileCounts.complete ?? 0, color: 'bg-emerald-500' },
          { label: 'Partial', count: profileCounts.partial ?? 0, color: 'bg-amber-500' },
          { label: 'Minimal', count: profileCounts.minimal ?? 0, color: 'bg-muted-foreground' },
        ].filter((item) => item.count > 0)
      );

      const engagementCounts = safeUsers.reduce<Record<string, number>>((acc, u) => {
        if (!u.engagement_status) return acc;
        acc[u.engagement_status] = (acc[u.engagement_status] ?? 0) + 1;
        return acc;
      }, {});

      setEngagement(
        [
          { label: 'Active (7 days)', count: engagementCounts.active_7d ?? 0, color: 'bg-emerald-500' },
          { label: 'Active (30 days)', count: engagementCounts.active_30d ?? 0, color: 'bg-teal-500' },
          { label: 'Dormant', count: engagementCounts.dormant ?? 0, color: 'bg-amber-500' },
          { label: 'Never Active', count: engagementCounts.never_active ?? 0, color: 'bg-muted-foreground' },
        ].filter((item) => item.count > 0)
      );

      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivityData = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(null);

    try {
      const baseSeries = buildActivitySkeleton();
      const bucket = baseSeries.reduce<Record<string, ActivityPoint>>((acc, point) => {
        acc[point.key] = { ...point };
        return acc;
      }, {});

      const oldestDay = baseSeries[0];
      const sinceIso = (() => {
        const date = new Date(oldestDay.key);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      })();

      const { data, error } = await supabase
        .from('v_user_profiles')
        .select('profile_created_at, auth_created_at')
        .or(`profile_created_at.gte.${sinceIso},auth_created_at.gte.${sinceIso}`);

      if (error) {
        throw error;
      }

      (data as UserProfileRow[] | null)?.forEach((row) => {
        const createdAt = row.profile_created_at ?? row.auth_created_at;
        if (!createdAt) return;

        const dayKey = createdAt.slice(0, 10);
        if (bucket[dayKey]) {
          bucket[dayKey].users += 1;
        }
      });

      setActivityData(baseSeries.map((point) => bucket[point.key]));
    } catch (error) {
      console.error('Error fetching activity chart data:', error);
      setActivityError('Unable to load recent activity');
      setActivityData(buildActivitySkeleton());
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-10 w-10 rounded-xl mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-2xl">
                🌱
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Sproutify Admin</h1>
                <p className="text-sm text-muted-foreground">User intelligence overview</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={fetchDashboardData}
              className="self-start md:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Key Metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Users" value={totalUsersDisplay} icon={<Users className="w-6 h-6 text-foreground" />} />
          <StatCard title="Active Trials" value={activeTrialsDisplay} icon={<Hourglass className="w-6 h-6 text-foreground" />} />
          <StatCard title="Subscribers" value={subscribersDisplay} icon={<Star className="w-6 h-6 text-foreground" />} />
          <StatCard
            title="Conversion"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6 text-foreground" />}
          />
          <StatCard title="Active Towers" value={towersDisplay} icon={<Building2 className="w-6 h-6 text-foreground" />} />
          <StatCard title="Active Plants" value={plantsDisplay} icon={<Leaf className="w-6 h-6 text-foreground" />} />
        </div>
      </section>

      {/* Breakdowns */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breakdowns</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <BreakdownCard title="User Status" data={userStatus} icon={<Target className="w-5 h-5 text-foreground" />} />
          <BreakdownCard title="Trial Funnel" data={trialFunnel} icon={<Timer className="w-5 h-5 text-foreground" />} />
          <BreakdownCard title="Profile Completion" data={profileCompletion} icon={<ClipboardList className="w-5 h-5 text-foreground" />} />
          <BreakdownCard title="Engagement" data={engagement} icon={<HeartPulse className="w-5 h-5 text-foreground" />} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>User Activity (7 days)</CardTitle>
              <CardDescription>New user signups over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] md:h-[360px] w-full min-w-0">
                {activityLoading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Loading activity…</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              {activityError && <p className="mt-4 text-sm text-destructive">{activityError}</p>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Global Community</CardTitle>
                <CardDescription>User locations around the world</CardDescription>
              </div>
              <MapPin className="text-muted-foreground w-5 h-5" />
            </CardHeader>
            <CardContent>
              <div className="h-[320px] md:h-[360px] rounded-xl overflow-hidden relative z-0">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                  className="w-full h-full"
                >
                  <MapResizeHandler />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[40.7128, -74.006]}>
                    <Popup>New York User Base</Popup>
                  </Marker>
                  <Marker position={[51.5074, -0.1278]}>
                    <Popup>London Community</Popup>
                  </Marker>
                  <Marker position={[35.6762, 139.6503]}>
                    <Popup>Tokyo Gardeners</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <p className="text-primary-foreground/70 text-sm">Jump to detailed views</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0">
                View All Users
              </Button>
              <Button variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0">
                Export Data
              </Button>
              <Button variant="secondary" className="bg-emerald-500 hover:bg-emerald-400 text-white border-0">
                Send Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="border-t pt-6 text-sm text-muted-foreground text-center">
        Last updated: {lastUpdated ?? '—'}
      </footer>
    </div>
  );
}
