-- Check if there are other security definer views and fix them
-- Let's query for any security definer views first
SELECT pg_get_viewdef(c.oid, true) as view_definition, c.relname as view_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'v' 
AND n.nspname = 'public'
AND pg_get_viewdef(c.oid, true) ILIKE '%security definer%';