import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Campaign = {
  id: string;
  company_id: string;
  name: string;
  type: "email" | "whatsapp" | "sms";
  status: "draft" | "scheduled" | "running" | "paused" | "completed";
  subject: string | null;
  content: string | null;
  template_id: string | null;
  scheduled_at: string | null;
  sent_count: number | null;
  open_count: number | null;
  click_count: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function useCampaigns(type?: "email" | "whatsapp" | "sms") {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const campaignsQuery = useQuery({
    queryKey: ["campaigns", type],
    queryFn: async () => {
      let query = supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (type) {
        query = query.eq("type", type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: Omit<Campaign, "id" | "created_at" | "updated_at" | "sent_count" | "open_count" | "click_count">) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert(campaign)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create campaign",
        description: error.message 
      });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update campaign",
        description: error.message 
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campaign deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete campaign",
        description: error.message 
      });
    },
  });

  return {
    campaigns: campaignsQuery.data ?? [],
    isLoading: campaignsQuery.isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
