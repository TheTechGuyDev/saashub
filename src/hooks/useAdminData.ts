import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdminData() {
  const { isSuperAdmin } = useAuth();

  const companiesQuery = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          profiles:profiles(count),
          employees:employees(count)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin(),
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles(role, company_id),
          companies:company_id(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin(),
  });

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [companiesResult, usersResult, customersResult, employeesResult] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("employees").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalCompanies: companiesResult.count ?? 0,
        totalUsers: usersResult.count ?? 0,
        totalCustomers: customersResult.count ?? 0,
        totalEmployees: employeesResult.count ?? 0,
      };
    },
    enabled: isSuperAdmin(),
  });

  return {
    companies: companiesQuery.data ?? [],
    users: usersQuery.data ?? [],
    stats: statsQuery.data ?? { totalCompanies: 0, totalUsers: 0, totalCustomers: 0, totalEmployees: 0 },
    isLoading: companiesQuery.isLoading || usersQuery.isLoading || statsQuery.isLoading,
  };
}

export function useDashboardStats() {
  const { profile, isSuperAdmin } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: ["dashboard-stats", companyId, isSuperAdmin()],
    queryFn: async () => {
      if (isSuperAdmin()) {
        const [companies, users, customers, employees, invoices, tickets] = await Promise.all([
          supabase.from("companies").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("customers").select("id", { count: "exact", head: true }),
          supabase.from("employees").select("id", { count: "exact", head: true }),
          supabase.from("invoices").select("total_amount").eq("status", "paid"),
          supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
        ]);

        const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) ?? 0;

        return {
          totalCompanies: companies.count ?? 0,
          totalUsers: users.count ?? 0,
          totalCustomers: customers.count ?? 0,
          totalEmployees: employees.count ?? 0,
          totalRevenue,
          openTickets: tickets.count ?? 0,
        };
      } else if (companyId) {
        const [customers, employees, invoices, tickets, projects] = await Promise.all([
          supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
          supabase.from("employees").select("id", { count: "exact", head: true }).eq("company_id", companyId),
          supabase.from("invoices").select("total_amount").eq("company_id", companyId).eq("status", "paid"),
          supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "open"),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
        ]);

        const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) ?? 0;

        return {
          totalCustomers: customers.count ?? 0,
          totalEmployees: employees.count ?? 0,
          totalRevenue,
          openTickets: tickets.count ?? 0,
          activeProjects: projects.count ?? 0,
        };
      }

      return {
        totalCustomers: 0,
        totalEmployees: 0,
        totalRevenue: 0,
        openTickets: 0,
        activeProjects: 0,
      };
    },
  });
}

export function useRecentActivity() {
  const { profile, isSuperAdmin } = useAuth();
  const companyId = profile?.company_id;

  return useQuery({
    queryKey: ["recent-activity", companyId],
    queryFn: async () => {
      const activities = [];

      // Get recent customers
      const customersQuery = supabase
        .from("customers")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (!isSuperAdmin() && companyId) {
        customersQuery.eq("company_id", companyId);
      }
      
      const { data: customers } = await customersQuery;
      
      customers?.forEach(c => {
        activities.push({
          id: c.id,
          action: "New customer added",
          user: c.name,
          time: c.created_at,
        });
      });

      // Get recent tickets
      const ticketsQuery = supabase
        .from("support_tickets")
        .select("id, subject, created_at")
        .order("created_at", { ascending: false })
        .limit(2);
      
      if (!isSuperAdmin() && companyId) {
        ticketsQuery.eq("company_id", companyId);
      }
      
      const { data: tickets } = await ticketsQuery;
      
      tickets?.forEach(t => {
        activities.push({
          id: t.id,
          action: "Ticket created",
          user: t.subject,
          time: t.created_at,
        });
      });

      return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
    },
  });
}
