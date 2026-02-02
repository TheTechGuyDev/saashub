-- Add is_platform_article column to articles table
ALTER TABLE public.articles ADD COLUMN is_platform_article boolean DEFAULT false;

-- Create index for better query performance
CREATE INDEX idx_articles_platform ON public.articles (is_platform_article) WHERE is_platform_article = true;

-- Add RLS policy for all authenticated users to view platform articles
CREATE POLICY "All users can view platform articles"
ON public.articles FOR SELECT TO authenticated
USING (is_platform_article = true);

-- Add policy for super admins to manage platform articles
CREATE POLICY "Super admins can manage platform articles"
ON public.articles FOR ALL TO authenticated
USING (is_platform_article = true AND is_super_admin(auth.uid()))
WITH CHECK (is_platform_article = true AND is_super_admin(auth.uid()));