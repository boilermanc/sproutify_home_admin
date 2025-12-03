-- Run this query in Supabase SQL Editor to get the current get_personalized_feed function definition
-- Copy the output and use it to update the function

SELECT pg_get_functiondef('get_personalized_feed'::regproc);

-- Alternative: If the above doesn't work, try this to see function details:
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_personalized_feed'
  AND n.nspname = 'public';

