-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can view company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = get_user_company_id(auth.uid())::text
);

CREATE POLICY "Staff can upload company documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = get_user_company_id(auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'staff')
  )
);

CREATE POLICY "Staff can update company documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = get_user_company_id(auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'staff')
  )
);

CREATE POLICY "Staff can delete company documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = get_user_company_id(auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'staff')
  )
);

-- Super admin can access all documents
CREATE POLICY "Super admins can access all documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' 
  AND is_super_admin(auth.uid())
);

-- Update the knowledge base articles to remove super_admin role mentions from user-facing content
UPDATE articles 
SET content = REPLACE(content, 'Super Admin', 'Company Admin')
WHERE is_platform_article = true 
  AND category = 'getting-started'
  AND title LIKE '%Roles%';

-- Add a helper function for company slug generation
CREATE OR REPLACE FUNCTION public.generate_company_slug(company_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from company name
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create a function for company onboarding (creates company and assigns role)
CREATE OR REPLACE FUNCTION public.create_company_and_assign_admin(
  p_company_name text,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_slug text;
BEGIN
  -- Generate unique slug
  v_slug := public.generate_company_slug(p_company_name);
  
  -- Create the company
  INSERT INTO companies (name, slug)
  VALUES (p_company_name, v_slug)
  RETURNING id INTO v_company_id;
  
  -- Update user's profile with company_id
  UPDATE profiles 
  SET company_id = v_company_id
  WHERE id = p_user_id;
  
  -- Remove default 'user' role and add 'company_admin' role
  DELETE FROM user_roles WHERE user_id = p_user_id AND role = 'user';
  
  INSERT INTO user_roles (user_id, role, company_id)
  VALUES (p_user_id, 'company_admin', v_company_id)
  ON CONFLICT (user_id, role) DO UPDATE SET company_id = v_company_id;
  
  RETURN v_company_id;
END;
$$;

-- Enable realtime for dashboard relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;