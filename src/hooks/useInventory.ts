import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type InventoryItem = {
  id: string;
  company_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  cost_price: number | null;
  reorder_level: number | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export function useInventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Item added successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to add item",
        description: error.message 
      });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Item updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update item",
        description: error.message 
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete item",
        description: error.message 
      });
    },
  });

  const lowStockItems = inventoryQuery.data?.filter(
    item => item.quantity <= (item.reorder_level ?? 10)
  ) ?? [];

  return {
    items: inventoryQuery.data ?? [],
    lowStockItems,
    isLoading: inventoryQuery.isLoading,
    createItem,
    updateItem,
    deleteItem,
  };
}
