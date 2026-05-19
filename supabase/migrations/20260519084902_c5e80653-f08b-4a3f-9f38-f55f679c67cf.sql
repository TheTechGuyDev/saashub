
-- Restrict sensitive tables to authenticated users only by adding restrictive policies blocking anon access

-- Helper: add restrictive "block anon" policies on sensitive tables
CREATE POLICY "Block anonymous access" ON public.invoices AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.campaigns AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.customers AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.expenses AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.call_logs AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.documents AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.branches AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.articles AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.tasks AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.projects AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.events AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.support_tickets AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.inventory_items AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.product_catalog AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_conversations AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_messages AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_orders AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_templates AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_broadcasts AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Block anonymous access" ON public.whatsapp_auto_rules AS RESTRICTIVE FOR ALL TO public USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
