import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Branch = {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  is_headquarters: boolean | null;
  created_at: string;
  updated_at: string;
  employees?: { full_name: string } | null;
};

export function useBranches() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*, employees:manager_id(full_name)")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Branch[];
    },
  });

  const createBranch = useMutation({
    mutationFn: async (branch: Omit<Branch, "id" | "created_at" | "updated_at" | "employees">) => {
      const { data, error } = await supabase
        .from("branches")
        .insert(branch)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create branch",
        description: error.message 
      });
    },
  });

  const updateBranch = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from("branches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update branch",
        description: error.message 
      });
    },
  });

  const deleteBranch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete branch",
        description: error.message 
      });
    },
  });

  return {
    branches: branchesQuery.data ?? [],
    isLoading: branchesQuery.isLoading,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
