import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Ticket = {
  id: string;
  company_id: string;
  customer_id: string | null;
  ticket_number: string;
  subject: string;
  description: string | null;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assigned_to: string | null;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customers?: { name: string } | null;
  employees?: { full_name: string } | null;
};

export function useTickets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, customers:customer_id(name), employees:assigned_to(full_name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: Omit<Ticket, "id" | "created_at" | "updated_at" | "resolved_at" | "customers" | "employees">) => {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert(ticket)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ title: "Ticket created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create ticket",
        description: error.message 
      });
    },
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ticket> & { id: string }) => {
      const updateData: any = { ...updates };
      if (updates.status === "resolved" || updates.status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ title: "Ticket updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update ticket",
        description: error.message 
      });
    },
  });

  const deleteTicket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ title: "Ticket deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete ticket",
        description: error.message 
      });
    },
  });

  return {
    tickets: ticketsQuery.data ?? [],
    isLoading: ticketsQuery.isLoading,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
