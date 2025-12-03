import { useCallback, useEffect, useState } from 'react';
import { Flag, RefreshCw, Eye, EyeOff, CheckCircle2, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Database } from '../database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';

type PostReport = Database['public']['Tables']['post_reports']['Row'];
type CommunityPost = Database['public']['Tables']['community_posts']['Row'];

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type ReportedPost = {
  post: CommunityPost;
  reports: PostReport[];
  reportsCount: number;
  userProfile?: UserProfile | null;
};

type FilterType = 'all' | 'unresolved' | 'resolved';

export function Moderation() {
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('unresolved');
  const [error, setError] = useState<string | null>(null);

  const loadReportedPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query based on filter
      let query = supabase
        .from('post_reports')
        .select(`
          *,
          community_posts!inner(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filter
      if (filter === 'resolved') {
        query = query.eq('is_resolved', true);
      } else if (filter === 'unresolved') {
        query = query.eq('is_resolved', false);
      }
      // 'all' doesn't need a filter

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Group reports by post
      const postsMap = new Map<string, ReportedPost>();

      if (data) {
        for (const report of data) {
          const reportData = report as PostReport & { community_posts: CommunityPost };
          const post = reportData.community_posts;
          const postId = post.id;

          if (!postsMap.has(postId)) {
            postsMap.set(postId, {
              post,
              reports: [],
              reportsCount: 0,
            });
          }

          const reportedPost = postsMap.get(postId)!;
          reportedPost.reports.push(reportData);
          reportedPost.reportsCount = reportedPost.reports.length;
        }
      }

      // Fetch user profiles for all unique user IDs
      const userIds = Array.from(new Set(Array.from(postsMap.values()).map(item => item.post.user_id)));
      const userProfilesMap = new Map<string, UserProfile | null>();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          for (const profile of profilesData) {
            userProfilesMap.set(profile.id, profile as UserProfile);
          }
        }

        // Set null for users not found
        for (const userId of userIds) {
          if (!userProfilesMap.has(userId)) {
            userProfilesMap.set(userId, null);
          }
        }
      }

      // Attach user profiles to reported posts
      const reportedPostsArray = Array.from(postsMap.values());
      for (const reportedPost of reportedPostsArray) {
        reportedPost.userProfile = userProfilesMap.get(reportedPost.post.user_id) ?? null;
      }

      setReportedPosts(reportedPostsArray);
    } catch (err) {
      console.error('Error loading reported posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reported posts');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadReportedPosts();
  }, [loadReportedPosts]);

  const updatePostStatus = useCallback(
    async (postId: string, isHidden: boolean, isApproved?: boolean) => {
      try {
        const updates: Partial<CommunityPost> = {
          is_hidden: isHidden,
        };
        if (isApproved !== undefined) {
          updates.is_approved = isApproved;
        }

        const { error: updateError } = await supabase
          .from('community_posts')
          .update(updates)
          .eq('id', postId);

        if (updateError) throw updateError;

        await loadReportedPosts();
      } catch (err) {
        console.error('Error updating post status:', err);
        setError(err instanceof Error ? err.message : 'Failed to update post status');
      }
    },
    [loadReportedPosts]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
        return;
      }

      try {
        const { error: deleteError } = await supabase.from('community_posts').delete().eq('id', postId);

        if (deleteError) throw deleteError;

        await loadReportedPosts();
      } catch (err) {
        console.error('Error deleting post:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete post');
      }
    },
    [loadReportedPosts]
  );

  const resolveReports = useCallback(
    async (postId: string) => {
      try {
        const { error: resolveError } = await supabase
          .from('post_reports')
          .update({ is_resolved: true })
          .eq('post_id', postId);

        if (resolveError) throw resolveError;

        await loadReportedPosts();
      } catch (err) {
        console.error('Error resolving reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to resolve reports');
      }
    },
    [loadReportedPosts]
  );

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatUserName = (userProfile: UserProfile | null | undefined) => {
    if (!userProfile) {
      return 'Gardener';
    }
    
    const firstName = userProfile.first_name?.trim() || '';
    const lastName = userProfile.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName[0].toUpperCase()}.`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return 'Gardener';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-gray-600 mt-1">Review and manage reported community posts.</p>
        </div>
        <Button
          onClick={() => void loadReportedPosts()}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="rounded-xl"
        >
          All
        </Button>
        <Button
          variant={filter === 'unresolved' ? 'default' : 'outline'}
          onClick={() => setFilter('unresolved')}
          className="rounded-xl"
        >
          Unresolved
        </Button>
        <Button
          variant={filter === 'resolved' ? 'default' : 'outline'}
          onClick={() => setFilter('resolved')}
          className="rounded-xl"
        >
          Resolved
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
          <Button
            onClick={() => setError(null)}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <Card key={`skeleton-${idx}`} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reportedPosts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reported posts</h3>
            <p className="text-gray-500 text-center">
              {filter === 'unresolved'
                ? 'All reports have been resolved!'
                : 'No posts match the current filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reportedPosts.map((item) => {
            const { post, reports, reportsCount, userProfile } = item;
            const isHidden = post.is_hidden ?? false;

            return (
              <Card
                key={post.id}
                className={clsx(
                  'overflow-hidden',
                  isHidden && 'border-red-300 border-2'
                )}
              >
                <div className="grid md:grid-cols-[300px,1fr] gap-0">
                  {/* Post Image */}
                  {post.photo_url && (
                    <div className="relative h-64 md:h-full min-h-[200px] bg-gray-100">
                      <img
                        src={post.photo_url}
                        alt={post.caption || 'Post image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Status badges and metadata */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge
                        variant={isHidden ? 'destructive' : 'default'}
                        className="rounded-full"
                      >
                        {isHidden ? 'Hidden' : 'Visible'}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {reportsCount} {reportsCount === 1 ? 'report' : 'reports'}
                      </Badge>
                      {post.created_at && (
                        <span className="text-sm text-gray-500 ml-auto">
                          {formatTimeAgo(post.created_at)}
                        </span>
                      )}
                    </div>

                    {/* User Name */}
                    {post.user_id && (
                      <p className="text-sm text-gray-500 mb-4">
                        Author: <span className="font-medium text-gray-700">{formatUserName(userProfile)}</span>
                      </p>
                    )}

                    {/* Caption */}
                    {post.caption && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Caption:</p>
                        <p className="text-sm text-gray-900">{post.caption}</p>
                      </div>
                    )}

                    {/* Reports list */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Report Reasons:</p>
                      <div className="space-y-2">
                        {reports.slice(0, 5).map((report) => (
                          <div
                            key={report.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <Flag className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-xs font-semibold text-gray-900 uppercase">
                                  {report.reason}
                                </p>
                                {report.created_at && (
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(report.created_at)}
                                  </span>
                                )}
                              </div>
                              {report.additional_info && (
                                <p className="text-xs text-gray-600">{report.additional_info}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {reports.length > 5 && (
                          <p className="text-xs text-gray-500 pl-7">
                            ... and {reports.length - 5} more reports
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        onClick={() => void updatePostStatus(post.id, !isHidden)}
                        variant={isHidden ? 'default' : 'destructive'}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {isHidden ? (
                          <>
                            <Eye className="w-4 h-4" />
                            Restore
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => void resolveReports(post.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolve
                      </Button>
                      <Button
                        onClick={() => void deletePost(post.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

