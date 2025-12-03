-- Migration: Update get_personalized_feed to return first name + last initial
-- This updates the username field to display as "John D." instead of full name

-- Step 1: Create the helper function (if not already created)
CREATE OR REPLACE FUNCTION format_user_display_name(
  first_name TEXT,
  last_name TEXT,
  username TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- If both first and last name exist, return "First L."
  IF first_name IS NOT NULL AND first_name != '' AND last_name IS NOT NULL AND last_name != '' THEN
    RETURN TRIM(first_name) || ' ' || UPPER(SUBSTRING(TRIM(last_name), 1, 1)) || '.';
  -- If only first name exists, return it
  ELSIF first_name IS NOT NULL AND first_name != '' THEN
    RETURN TRIM(first_name);
  -- If only last name exists, return it
  ELSIF last_name IS NOT NULL AND last_name != '' THEN
    RETURN TRIM(last_name);
  -- Fallback to username if available
  ELSIF username IS NOT NULL AND username != '' THEN
    RETURN username;
  -- Default fallback - always return "Gardener" if nothing else is available
  ELSE
    RETURN 'Gardener';
  END IF;
END;
$$;

COMMENT ON FUNCTION format_user_display_name IS 
'Formats user name for display in community feed as "First L." (first name + last initial). Falls back to "Gardener" if no name is available.';

-- Step 2: Update the get_personalized_feed function
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  p_user_id uuid, 
  p_feed_type text DEFAULT 'for_you'::text, 
  p_limit integer DEFAULT 20, 
  p_offset integer DEFAULT 0
)
 RETURNS TABLE(
   post_id uuid, 
   post_user_id uuid, 
   username text, 
   user_photo text, 
   photo_url text, 
   photo_aspect_ratio numeric, 
   caption text, 
   location_city text, 
   location_state text, 
   is_featured boolean, 
   featured_type text, 
   likes_count integer, 
   comments_count integer, 
   view_count integer, 
   created_at timestamp with time zone, 
   is_liked_by_user boolean, 
   is_bookmarked_by_user boolean, 
   plant_tags jsonb, 
   tower_name text, 
   hashtags jsonb, 
   relevance_score numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY

  WITH user_plants AS (
    -- Get plants the current user is growing
    SELECT DISTINCT plant_id
    FROM userplants
    WHERE user_id = p_user_id
  ),

  user_following AS (
    -- Get users the current user follows
    SELECT following_id
    FROM user_follows
    WHERE follower_id = p_user_id
  ),

  post_data AS (
    SELECT
      cp.id,
      cp.user_id,
      -- UPDATED: Use format_user_display_name to show "First L." format
      format_user_display_name(
        p.first_name,
        p.last_name,
        p.username
      ) as username,
      ucp.profile_photo_url,
      cp.photo_url,
      cp.photo_aspect_ratio,
      cp.caption,
      cp.location_city,
      cp.location_state,
      cp.is_featured,
      cp.featured_type,
      cp.likes_count,
      cp.comments_count,
      cp.view_count,
      cp.created_at,

      -- Check if current user liked this post
      EXISTS (
        SELECT 1 FROM post_likes pl_like
        WHERE pl_like.post_id = cp.id AND pl_like.user_id = p_user_id
      ) as is_liked,

      -- Check if current user bookmarked this post
      EXISTS (
        SELECT 1 FROM post_bookmarks pb
        WHERE pb.post_id = cp.id AND pb.user_id = p_user_id
      ) as is_bookmarked,

      -- Get plant tags as JSON
      (
        SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', ppt.plant_id
          )
        )
        FROM post_plant_tags ppt
        WHERE ppt.post_id = cp.id
      ) as plant_tags_json,

      -- Get tower name
      mt.tower_name as tower_name,

      -- Get hashtags as JSON
      (
        SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', h.id,
            'tag', h.display_tag
          )
        )
        FROM post_hashtags ph
        JOIN hashtags h ON ph.hashtag_id = h.id
        WHERE ph.post_id = cp.id
      ) as hashtags_json,

      -- Calculate relevance score based on feed type
      CASE
        WHEN p_feed_type = 'for_you' THEN
          -- Personalized scoring
          (
            -- Base recency score (0-10 points)
            (10 * EXP(-EXTRACT(EPOCH FROM (NOW() - cp.created_at)) / 86400)) +

            -- Engagement score (0-20 points)
            (LEAST(cp.likes_count::NUMERIC / 10, 10)) +
            (LEAST(cp.comments_count::NUMERIC / 2, 5)) +
            (LEAST(cp.view_count::NUMERIC / 50, 5)) +

            -- Following boost (20 points if following)
            (CASE WHEN EXISTS (SELECT 1 FROM user_following WHERE following_id = cp.user_id) THEN 20 ELSE 0 END) +

            -- Same plant boost (15 points if growing same plants)
            (CASE WHEN EXISTS (
              SELECT 1 FROM post_plant_tags ppt_same
              JOIN user_plants up ON ppt_same.plant_id = up.plant_id
              WHERE ppt_same.post_id = cp.id
            ) THEN 15 ELSE 0 END) +

            -- Featured boost (10 points)
            (CASE WHEN cp.is_featured THEN 10 ELSE 0 END)
          )

        WHEN p_feed_type = 'following' THEN
          -- Just recency for following feed
          EXTRACT(EPOCH FROM cp.created_at)

        WHEN p_feed_type = 'popular' THEN
          -- Engagement-based scoring
          (cp.likes_count * 3) + (cp.comments_count * 5) + (cp.view_count * 0.1)

        ELSE -- 'recent'
          -- Pure recency
          EXTRACT(EPOCH FROM cp.created_at)
      END as relevance_score

    FROM community_posts cp
    LEFT JOIN profiles p ON cp.user_id = p.id
    LEFT JOIN user_community_profiles ucp ON cp.user_id = ucp.user_id
    LEFT JOIN my_towers mt ON cp.tower_id = mt.tower_id

    WHERE
      cp.is_approved = true
      AND cp.is_hidden = false
      AND (
        -- For 'following' feed, only show posts from followed users
        p_feed_type != 'following' OR
        EXISTS (SELECT 1 FROM user_following WHERE following_id = cp.user_id)
      )
      AND cp.user_id != p_user_id -- Don't show user's own posts in feed (optional)
  )

  SELECT
    pd.id,
    pd.user_id,
    pd.username::TEXT,
    pd.profile_photo_url::TEXT,
    pd.photo_url::TEXT,
    pd.photo_aspect_ratio,
    pd.caption::TEXT,
    pd.location_city::TEXT,
    pd.location_state::TEXT,
    pd.is_featured,
    pd.featured_type::TEXT,
    pd.likes_count,
    pd.comments_count,
    pd.view_count,
    pd.created_at,
    pd.is_liked,
    pd.is_bookmarked,
    pd.plant_tags_json,
    pd.tower_name::TEXT,
    pd.hashtags_json,
    pd.relevance_score
  FROM post_data pd
  ORDER BY pd.relevance_score DESC, pd.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;

END;
$function$;

