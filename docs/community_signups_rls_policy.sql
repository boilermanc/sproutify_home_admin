-- RLS Policy for community_signups table
-- This allows authenticated admin users (in team_admins table) to read community signups

-- Step 1: Enable RLS on the table (if not already enabled)
ALTER TABLE public.community_signups ENABLE ROW LEVEL SECURITY;

-- Step 2: Create a policy that allows authenticated users who are team admins to read
-- This policy checks if the authenticated user's email is in the team_admins table
CREATE POLICY "Allow team admins to read community signups"
ON public.community_signups
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.team_admins
    WHERE LOWER(team_admins.email) = LOWER(auth.jwt() ->> 'email')
  )
);

-- Alternative: If you want to allow ALL authenticated users to read (less secure)
-- Uncomment the following and comment out the above policy:
-- CREATE POLICY "Allow authenticated users to read community signups"
-- ON public.community_signups
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- Step 3: Verify the policy was created
-- Run this query to check:
-- SELECT * FROM pg_policies WHERE tablename = 'community_signups';


