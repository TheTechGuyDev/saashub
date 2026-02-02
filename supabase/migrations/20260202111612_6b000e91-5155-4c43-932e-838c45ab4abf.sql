-- Create enums for new modules
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.call_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE public.call_outcome AS ENUM ('answered', 'no_answer', 'busy', 'voicemail', 'callback');
CREATE TYPE public.campaign_type AS ENUM ('email', 'whatsapp', 'sms');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed');

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.employees(id),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  invoice_number TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events/Calendar table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  attendees UUID[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  ticket_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.employees(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Call logs table
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  direction call_direction NOT NULL,
  duration INTEGER DEFAULT 0,
  outcome call_outcome,
  notes TEXT,
  customer_id UUID REFERENCES public.customers(id),
  employee_id UUID REFERENCES public.employees(id),
  called_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  subject TEXT,
  content TEXT,
  template_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge base articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  slug TEXT,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES public.employees(id),
  is_headquarters BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documents/Files table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  folder TEXT DEFAULT 'root',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Super admins can view all projects" ON public.projects FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company projects" ON public.projects FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company projects" ON public.projects FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for tasks
CREATE POLICY "Super admins can view all tasks" ON public.tasks FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company tasks" ON public.tasks FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company tasks" ON public.tasks FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Super admins can view all invoices" ON public.invoices FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company invoices" ON public.invoices FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can manage company invoices" ON public.invoices FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for expenses
CREATE POLICY "Super admins can view all expenses" ON public.expenses FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company expenses" ON public.expenses FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can manage company expenses" ON public.expenses FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for inventory_items
CREATE POLICY "Super admins can view all inventory" ON public.inventory_items FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company inventory" ON public.inventory_items FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company inventory" ON public.inventory_items FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for events
CREATE POLICY "Super admins can view all events" ON public.events FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company events" ON public.events FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company events" ON public.events FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for support_tickets
CREATE POLICY "Super admins can view all tickets" ON public.support_tickets FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company tickets" ON public.support_tickets FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company tickets" ON public.support_tickets FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for call_logs
CREATE POLICY "Super admins can view all call logs" ON public.call_logs FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company call logs" ON public.call_logs FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company call logs" ON public.call_logs FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for campaigns
CREATE POLICY "Super admins can view all campaigns" ON public.campaigns FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company campaigns" ON public.campaigns FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can manage company campaigns" ON public.campaigns FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for articles
CREATE POLICY "Super admins can view all articles" ON public.articles FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company articles" ON public.articles FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company articles" ON public.articles FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for branches
CREATE POLICY "Super admins can view all branches" ON public.branches FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company branches" ON public.branches FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can manage company branches" ON public.branches FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND is_company_admin_or_higher(auth.uid())) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- RLS Policies for documents
CREATE POLICY "Super admins can view all documents" ON public.documents FOR SELECT USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view company documents" ON public.documents FOR SELECT USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Staff can manage company documents" ON public.documents FOR ALL USING (company_id = get_user_company_id(auth.uid()) AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'company_admin', 'staff'))) WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Add updated_at triggers for new tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_projects_company_id ON public.projects(company_id);
CREATE INDEX idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_expenses_company_id ON public.expenses(company_id);
CREATE INDEX idx_inventory_items_company_id ON public.inventory_items(company_id);
CREATE INDEX idx_events_company_id ON public.events(company_id);
CREATE INDEX idx_support_tickets_company_id ON public.support_tickets(company_id);
CREATE INDEX idx_call_logs_company_id ON public.call_logs(company_id);
CREATE INDEX idx_campaigns_company_id ON public.campaigns(company_id);
CREATE INDEX idx_articles_company_id ON public.articles(company_id);
CREATE INDEX idx_branches_company_id ON public.branches(company_id);
CREATE INDEX idx_documents_company_id ON public.documents(company_id);