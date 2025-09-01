-- Make the first user an admin (you'll need to sign up first)
-- This will assign admin role to any user that currently exists
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
    p.user_id, 
    'admin', 
    p.user_id
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'admin'
)
LIMIT 1;