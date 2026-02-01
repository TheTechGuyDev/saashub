import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];
type CustomerStatus = Database["public"]["Enums"]["customer_status"];

export function useCustomers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const customersQuery = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<CustomerInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("customers")
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create customer",
        description: error.message 
      });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: CustomerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update customer",
        description: error.message 
      });
    },
  });

  const updateCustomerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CustomerStatus }) => {
      const { data, error } = await supabase
        .from("customers")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update status",
        description: error.message 
      });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete customer",
        description: error.message 
      });
    },
  });

  return {
    customers: customersQuery.data ?? [],
    isLoading: customersQuery.isLoading,
    error: customersQuery.error,
    createCustomer,
    updateCustomer,
    updateCustomerStatus,
    deleteCustomer,
  };
}

export function useCustomerActivities(customerId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const activitiesQuery = useQuery({
    queryKey: ["customer-activities", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from("customer_activities")
        .select("*, profiles:user_id(full_name)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  const createActivity = useMutation({
    mutationFn: async (activity: {
      customer_id: string;
      company_id: string;
      type: Database["public"]["Enums"]["activity_type"];
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("customer_activities")
        .insert({
          ...activity,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-activities", customerId] });
      toast({ title: "Activity logged successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to log activity",
        description: error.message 
      });
    },
  });

  return {
    activities: activitiesQuery.data ?? [],
    isLoading: activitiesQuery.isLoading,
    createActivity,
  };
}
