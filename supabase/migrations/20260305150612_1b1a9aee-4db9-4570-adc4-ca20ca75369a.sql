
-- WhatsApp conversation statuses
CREATE TYPE public.wa_conversation_status AS ENUM ('open', 'closed', 'archived');

-- WhatsApp message direction
CREATE TYPE public.wa_message_direction AS ENUM ('inbound', 'outbound');

-- WhatsApp message type
CREATE TYPE public.wa_message_type AS ENUM ('text', 'image', 'catalog');

-- WhatsApp message status
CREATE TYPE public.wa_message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- WhatsApp template category
CREATE TYPE public.wa_template_category AS ENUM ('welcome', 'faq', 'product', 'order');

-- WhatsApp broadcast status
CREATE TYPE public.wa_broadcast_status AS ENUM ('draft', 'scheduled', 'sending', 'completed');

-- WhatsApp order status
CREATE TYPE public.wa_order_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');

-- WhatsApp payment status
CREATE TYPE public.wa_payment_status AS ENUM ('pending', 'paid', 'failed');

-- Conversations table
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  status wa_conversation_status NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  direction wa_message_direction NOT NULL,
  content text NOT NULL,
  message_type wa_message_type NOT NULL DEFAULT 'text',
  status wa_message_status NOT NULL DEFAULT 'sent',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Templates table
CREATE TABLE public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  category wa_template_category NOT NULL DEFAULT 'faq',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-reply rules table
CREATE TABLE public.whatsapp_auto_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  trigger_keywords text[] NOT NULL DEFAULT '{}',
  response_template_id uuid REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Product catalog table
CREATE TABLE public.product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  availability boolean NOT NULL DEFAULT true,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- WhatsApp orders table
CREATE TABLE public.whatsapp_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.whatsapp_conversations(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  product_items jsonb NOT NULL DEFAULT '[]',
  delivery_location text,
  payment_status wa_payment_status NOT NULL DEFAULT 'pending',
  status wa_order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Broadcasts table
CREATE TABLE public.whatsapp_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  message text NOT NULL,
  target_tags text[] DEFAULT '{}',
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  read_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  status wa_broadcast_status NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_auto_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: company-scoped read, staff+ manage, super_admin view all

-- whatsapp_conversations
CREATE POLICY "Users can view company conversations" ON public.whatsapp_conversations FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all conversations" ON public.whatsapp_conversations FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Staff can manage company conversations" ON public.whatsapp_conversations FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- whatsapp_messages
CREATE POLICY "Users can view company messages" ON public.whatsapp_messages FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all messages" ON public.whatsapp_messages FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Staff can manage company messages" ON public.whatsapp_messages FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- whatsapp_templates
CREATE POLICY "Users can view company templates" ON public.whatsapp_templates FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all templates" ON public.whatsapp_templates FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Staff can manage company templates" ON public.whatsapp_templates FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- whatsapp_auto_rules
CREATE POLICY "Users can view company auto rules" ON public.whatsapp_auto_rules FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all auto rules" ON public.whatsapp_auto_rules FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Admins can manage company auto rules" ON public.whatsapp_auto_rules FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- product_catalog
CREATE POLICY "Users can view company catalog" ON public.product_catalog FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all catalog" ON public.product_catalog FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Staff can manage company catalog" ON public.product_catalog FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- whatsapp_orders
CREATE POLICY "Users can view company orders" ON public.whatsapp_orders FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all orders" ON public.whatsapp_orders FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Staff can manage company orders" ON public.whatsapp_orders FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- whatsapp_broadcasts
CREATE POLICY "Users can view company broadcasts" ON public.whatsapp_broadcasts FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Super admins can view all broadcasts" ON public.whatsapp_broadcasts FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Admins can manage company broadcasts" ON public.whatsapp_broadcasts FOR ALL USING (
  company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())
) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Enable realtime on conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
