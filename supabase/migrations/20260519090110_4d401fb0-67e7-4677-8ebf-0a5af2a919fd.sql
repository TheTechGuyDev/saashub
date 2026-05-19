CREATE OR REPLACE FUNCTION public.create_company_and_assign_admin(p_company_name text, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
  v_slug text;
BEGIN
  v_slug := public.generate_company_slug(p_company_name);

  INSERT INTO companies (name, slug)
  VALUES (p_company_name, v_slug)
  RETURNING id INTO v_company_id;

  UPDATE profiles
  SET company_id = v_company_id
  WHERE id = p_user_id;

  -- Remove any existing roles for this user so we can cleanly assign company_admin
  DELETE FROM user_roles WHERE user_id = p_user_id;

  INSERT INTO user_roles (user_id, role, company_id)
  VALUES (p_user_id, 'company_admin', v_company_id);

  RETURN v_company_id;
END;
$function$;