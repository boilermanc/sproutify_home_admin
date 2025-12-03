import { useCallback, useEffect, useState } from 'react';
import { Rss, RefreshCw, TrendingUp, Users, Eye, Heart, MessageSquare, Loader2, Database, Code } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import clsx from 'clsx';

type FeedStats = {
  totalPosts: number;
  approvedPosts: number;
  hiddenPosts: number;
  featuredPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  avgEngagement: number;
};

type FeedTestResult = {
  post_id: string;
  username: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  relevance_score: number;
  created_at: string;
};

export function FeedManagement() {
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testUserId, setTestUserId] = useState('');
  const [testFeedType, setTestFeedType] = useState<'for_you' | 'following' | 'popular' | 'recent'>('for_you');
  const [testResults, setTestResults] = useState<FeedTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'test'>('overview');

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get total posts
      const { count: totalPosts, error: totalError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get approved posts
      const { count: approvedPosts, error: approvedError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .eq('is_hidden', false);

      if (approvedError) throw approvedError;

      // Get hidden posts
      const { count: hiddenPosts, error: hiddenError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_hidden', true);

      if (hiddenError) throw hiddenError;

      // Get featured posts
      const { count: featuredPosts, error: featuredError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('is_approved', true)
        .eq('is_hidden', false);

      if (featuredError) throw featuredError;

      // Get engagement stats
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('likes_count, comments_count, view_count')
        .eq('is_approved', true)
        .eq('is_hidden', false)
        .limit(1000);

      if (postsError) throw postsError;

      const totalLikes = postsData?.reduce((sum, p) => sum + (p.likes_count || 0), 0) ?? 0;
      const totalComments = postsData?.reduce((sum, p) => sum + (p.comments_count || 0), 0) ?? 0;
      const totalViews = postsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) ?? 0;
      const avgEngagement =
        postsData && postsData.length > 0
          ? (totalLikes + totalComments + totalViews / 10) / postsData.length
          : 0;

      setStats({
        totalPosts: totalPosts ?? 0,
        approvedPosts: approvedPosts ?? 0,
        hiddenPosts: hiddenPosts ?? 0,
        featuredPosts: featuredPosts ?? 0,
        totalLikes,
        totalComments,
        totalViews,
        avgEngagement,
      });
    } catch (err) {
      console.error('Error loading feed stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const testFeed = useCallback(async () => {
    if (!testUserId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);

      // Call the get_personalized_feed function
      const { data, error: testError } = await supabase.rpc('get_personalized_feed', {
        p_user_id: testUserId.trim(),
        p_feed_type: testFeedType,
        p_limit: 20,
        p_offset: 0,
      });

      if (testError) throw testError;

      setTestResults((data as FeedTestResult[]) ?? []);
    } catch (err) {
      console.error('Error testing feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to test feed');
      setTestResults([]);
    } finally {
      setIsTesting(false);
    }
  }, [testUserId, testFeedType]);

  const formatDate = (dateString: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feed Management</h1>
          <p className="text-gray-600 mt-1">Monitor and test the personalized community feed.</p>
        </div>
        <Button onClick={() => void loadStats()} disabled={isLoading} variant="outline" className="flex items-center gap-2">
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'test')}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test">Test Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-gray-500">Loading feed statistics...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Posts"
                  value={stats.totalPosts.toLocaleString()}
                  icon={Rss}
                  color="text-blue-600"
                />
                <StatCard
                  label="Approved Posts"
                  value={stats.approvedPosts.toLocaleString()}
                  icon={Eye}
                  color="text-green-600"
                />
                <StatCard
                  label="Hidden Posts"
                  value={stats.hiddenPosts.toLocaleString()}
                  icon={Eye}
                  color="text-red-600"
                />
                <StatCard
                  label="Featured Posts"
                  value={stats.featuredPosts.toLocaleString()}
                  icon={TrendingUp}
                  color="text-purple-600"
                />
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Total Likes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      Total Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalComments.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-500" />
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Average Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Engagement</CardTitle>
                  <CardDescription>
                    Average engagement score per post (likes + comments + views/10)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{stats.avgEngagement.toFixed(2)}</p>
                </CardContent>
              </Card>

              {/* Function Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Feed Function Information
                  </CardTitle>
                  <CardDescription>
                    The personalized feed uses the <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">get_personalized_feed</code> database function
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Function Name:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">get_personalized_feed</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Display Format:</span>
                    <Badge variant="outline">First Name + Last Initial (e.g., "John D.")</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Feed Types:</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">for_you</Badge>
                      <Badge variant="outline" className="text-xs">following</Badge>
                      <Badge variant="outline" className="text-xs">popular</Badge>
                      <Badge variant="outline" className="text-xs">recent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Personalized Feed</CardTitle>
              <CardDescription>
                Test the <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">get_personalized_feed</code> function
                with a specific user ID and feed type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="Enter user UUID"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-type">Feed Type</Label>
                <Select value={testFeedType} onValueChange={(v) => setTestFeedType(v as typeof testFeedType)}>
                  <SelectTrigger id="feed-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for_you">For You (Personalized)</SelectItem>
                    <SelectItem value="following">Following</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void testFeed()} disabled={isTesting || !testUserId.trim()} className="w-full">
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Test Feed Function
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Showing {testResults.length} posts from the feed (ordered by relevance score)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={result.post_id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              Score: {result.relevance_score.toFixed(2)}
                            </Badge>
                            <span className="text-sm text-gray-500">{result.username}</span>
                          </div>
                          {result.caption && (
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{result.caption}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {result.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {result.comments_count}
                            </span>
                            <span>{formatDate(result.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {testResults.length === 0 && !isTesting && testUserId && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Rss className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results</h3>
                <p className="text-gray-500 text-center">
                  Run a test to see feed results for the specified user and feed type.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
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

