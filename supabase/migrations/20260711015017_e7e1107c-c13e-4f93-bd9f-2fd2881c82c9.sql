
CREATE OR REPLACE FUNCTION public.is_admin_or_bootstrap(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'super_admin'))
    OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin'));
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_bootstrap(uuid) FROM PUBLIC, anon, authenticated;
