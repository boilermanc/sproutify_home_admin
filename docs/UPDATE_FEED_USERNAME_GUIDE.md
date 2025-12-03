# Guide: Update Community Feed to Show First Name + Last Initial

This guide will help you update the `get_personalized_feed` database function to display user names as "John D." instead of full names.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

## Step 2: Get the Current Function Definition

Run this query in the SQL Editor to see the current function definition:

```sql
SELECT pg_get_functiondef('get_personalized_feed'::regproc);
```

This will show you the complete function definition. **Copy the entire output** - you'll need it in the next step.

## Step 3: Create the Helper Function

First, run this to create a helper function that formats names:

```sql
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
  -- Default fallback
  ELSE
    RETURN 'User';
  END IF;
END;
$$;

COMMENT ON FUNCTION format_user_display_name IS 
'Formats user name for display in community feed as "First L." (first name + last initial)';
```

## Step 4: Update the get_personalized_feed Function

Now you need to modify the function definition you copied in Step 2. Look for the line that selects the `username` field. It will likely look something like:

```sql
p.username AS username
```

or

```sql
COALESCE(p.username, ...) AS username
```

**Replace that line** with one of these options:

### Option A: Using the Helper Function (Recommended)
```sql
format_user_display_name(p.first_name, p.last_name, p.username) AS username
```

### Option B: Inline CASE Statement
```sql
CASE 
  WHEN p.first_name IS NOT NULL AND p.first_name != '' AND p.last_name IS NOT NULL AND p.last_name != '' THEN 
    TRIM(p.first_name) || ' ' || UPPER(SUBSTRING(TRIM(p.last_name), 1, 1)) || '.'
  WHEN p.first_name IS NOT NULL AND p.first_name != '' THEN 
    TRIM(p.first_name)
  WHEN p.last_name IS NOT NULL AND p.last_name != '' THEN 
    TRIM(p.last_name)
  WHEN p.username IS NOT NULL AND p.username != '' THEN 
    p.username
  ELSE 
    'User'
END AS username
```

## Step 5: Run the Updated Function

After modifying the function definition, run the entire `CREATE OR REPLACE FUNCTION` statement in the SQL Editor.

## Step 6: Test the Function

Test that it works by calling the function:

```sql
SELECT * FROM get_personalized_feed(
  p_user_id := 'your-test-user-id-here',
  p_limit := 5
);
```

Check that the `username` field now shows "First L." format instead of full names.

## Troubleshooting

### If you can't find the username field in the SELECT statement:
- The function might be using a view or CTE (Common Table Expression)
- Look for `FROM` clauses that join with the `profiles` table (usually aliased as `p`)
- The username might be selected from a subquery or view

### If the function uses a view:
You may need to update the view definition instead. To find views that might be related:

```sql
SELECT viewname, definition 
FROM pg_views 
WHERE definition LIKE '%get_personalized_feed%' 
   OR definition LIKE '%community_posts%';
```

### If you get permission errors:
Make sure you're using an account with sufficient privileges (usually the database owner or a role with CREATE FUNCTION permissions).

## Need Help?

If you're having trouble finding or updating the function:
1. Copy the full output from Step 2
2. Share it (you can redact sensitive parts)
3. I can help you identify exactly what needs to be changed

