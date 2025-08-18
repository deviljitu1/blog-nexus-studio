-- Fix security definer functions with proper search path
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_login(_user_id uuid);
DROP FUNCTION IF EXISTS public.log_blog_activity();

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name, login_count)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 
    1
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Log signup activity
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (NEW.id, 'user_signup', jsonb_build_object('email', NEW.email));
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_login(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile login info
  UPDATE public.profiles 
  SET 
    last_login = now(),
    login_count = login_count + 1,
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Log login activity
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (_user_id, 'user_login', jsonb_build_object('timestamp', now()));
END;
$$;

CREATE OR REPLACE FUNCTION public.log_blog_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (auth.uid(), 'blog_post_created', jsonb_build_object('post_id', NEW.id, 'title', NEW.title));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (auth.uid(), 'blog_post_updated', jsonb_build_object('post_id', NEW.id, 'title', NEW.title));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (auth.uid(), 'blog_post_deleted', jsonb_build_object('post_id', OLD.id, 'title', OLD.title));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;