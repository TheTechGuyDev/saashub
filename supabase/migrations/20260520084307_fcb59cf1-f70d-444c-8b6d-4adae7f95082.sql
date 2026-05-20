
CREATE TABLE public.staff_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid NOT NULL,
  employee_id uuid,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_activities_company ON public.staff_activities(company_id, created_at DESC);
CREATE INDEX idx_staff_activities_user ON public.staff_activities(user_id, created_at DESC);

ALTER TABLE public.staff_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block anonymous access" ON public.staff_activities
  AS RESTRICTIVE FOR ALL TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own activities" ON public.staff_activities
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own activities" ON public.staff_activities
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Admins can view company activities" ON public.staff_activities
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()) AND public.is_company_admin_or_higher(auth.uid()));

CREATE POLICY "Super admins can view all activities" ON public.staff_activities
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
