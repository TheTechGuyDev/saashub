import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Invoice = {
  id: string;
  company_id: string;
  customer_id: string | null;
  invoice_number: string;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  items: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: { name: string; email: string | null } | null;
};

export type Expense = {
  id: string;
  company_id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  approved_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function useInvoices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, customers:customer_id(name, email)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "customers">) => {
      const { data, error } = await supabase
        .from("invoices")
        .insert(invoice)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create invoice",
        description: error.message 
      });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update invoice",
        description: error.message 
      });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete invoice",
        description: error.message 
      });
    },
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}

export function useExpenses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
  });

  const createExpense = useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert(expense)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense recorded successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to record expense",
        description: error.message 
      });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete expense",
        description: error.message 
      });
    },
  });

  return {
    expenses: expensesQuery.data ?? [],
    isLoading: expensesQuery.isLoading,
    createExpense,
    deleteExpense,
  };
}
