-- Migration: Update get_personalized_feed to return first name + last initial instead of full username
-- This changes the username field in the feed to display as "John D." instead of "John Doe" or full username
-- 
-- Run this migration in your Supabase SQL Editor to update the get_personalized_feed function
--
-- IMPORTANT: Before running this, you should first check the current function definition:
-- SELECT pg_get_functiondef('get_personalized_feed'::regproc);
--
-- Then adapt this template to match your actual function structure.

-- Helper function to format username as "First LastInitial."
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

-- Example of how to update get_personalized_feed function:
-- Replace the username field in your SELECT statement with:
-- format_user_display_name(p.first_name, p.last_name, p.username) AS username
--
-- Or inline version:
-- CASE 
--   WHEN p.first_name IS NOT NULL AND p.first_name != '' AND p.last_name IS NOT NULL AND p.last_name != '' THEN 
--     TRIM(p.first_name) || ' ' || UPPER(SUBSTRING(TRIM(p.last_name), 1, 1)) || '.'
--   WHEN p.first_name IS NOT NULL AND p.first_name != '' THEN 
--     TRIM(p.first_name)
--   WHEN p.last_name IS NOT NULL AND p.last_name != '' THEN 
--     TRIM(p.last_name)
--   WHEN p.username IS NOT NULL AND p.username != '' THEN 
--     p.username
--   ELSE 
--     'User'
-- END AS username

-- To find and update your function:
-- 1. Run: SELECT pg_get_functiondef('get_personalized_feed'::regproc);
-- 2. Copy the function definition
-- 3. Replace the username field selection with the format_user_display_name() call or CASE statement above
-- 4. Run the updated CREATE OR REPLACE FUNCTION statement

COMMENT ON FUNCTION format_user_display_name IS 
'Formats user name for display in community feed as "First L." (first name + last initial). Falls back to "Gardener" if no name is available.';

