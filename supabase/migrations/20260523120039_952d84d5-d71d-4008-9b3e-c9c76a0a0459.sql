
-- Permission matrix table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  role public.app_role NOT NULL,
  module text NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_create boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company permissions"
ON public.role_permissions FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage company permissions"
ON public.role_permissions FOR ALL TO authenticated
USING (company_id = public.get_user_company_id(auth.uid()) AND public.is_company_admin_or_higher(auth.uid()))
WITH CHECK (company_id = public.get_user_company_id(auth.uid()) AND public.is_company_admin_or_higher(auth.uid()));

CREATE POLICY "Super admins can manage all permissions"
ON public.role_permissions FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permission check function with defaults
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _module text, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_roles app_role[];
  v_role app_role;
  v_allowed boolean;
  v_row record;
BEGIN
  IF public.is_super_admin(_user_id) THEN RETURN true; END IF;

  SELECT company_id INTO v_company_id FROM profiles WHERE id = _user_id;
  IF v_company_id IS NULL THEN RETURN false; END IF;

  SELECT array_agg(role) INTO v_roles FROM user_roles WHERE user_id = _user_id;
  IF v_roles IS NULL THEN RETURN false; END IF;

  FOREACH v_role IN ARRAY v_roles LOOP
    -- company_admin gets everything by default
    IF v_role = 'company_admin' THEN RETURN true; END IF;

    SELECT * INTO v_row FROM role_permissions
      WHERE company_id = v_company_id AND role = v_role AND module = _module;

    IF FOUND THEN
      v_allowed := CASE _action
        WHEN 'view' THEN v_row.can_view
        WHEN 'create' THEN v_row.can_create
        WHEN 'edit' THEN v_row.can_edit
        WHEN 'delete' THEN v_row.can_delete
        ELSE false END;
      IF v_allowed THEN RETURN true; END IF;
    ELSE
      -- Defaults when no config row exists
      IF v_role = 'staff' AND _action IN ('view','create','edit') THEN RETURN true; END IF;
      IF v_role = 'user' AND _action = 'view' THEN RETURN true; END IF;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;
