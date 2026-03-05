import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useWhatsAppConversations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createConversation = useMutation({
    mutationFn: async (conv: { company_id: string; contact_name: string; contact_phone: string; tags?: string[] }) => {
      const { data, error } = await supabase.from("whatsapp_conversations").insert(conv).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-conversations"] });
      toast({ title: "Conversation created" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const updateConversation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: "open" | "closed" | "archived"; assigned_to?: string | null; tags?: string[] }) => {
      const { data, error } = await supabase.from("whatsapp_conversations").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa-conversations"] }),
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  return { conversations: query.data ?? [], isLoading: query.isLoading, createConversation, updateConversation };
}

export function useWhatsAppMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("sent_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async (msg: { conversation_id: string; company_id: string; content: string; direction?: string }) => {
      const { data, error } = await supabase.from("whatsapp_messages").insert({
        ...msg,
        direction: (msg.direction || "outbound") as any,
        message_type: "text" as any,
        status: "sent" as any,
      }).select().single();
      if (error) throw error;
      // Update last_message_at
      await supabase.from("whatsapp_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", msg.conversation_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["wa-conversations"] });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Failed to send", description: e.message }),
  });

  return { messages: query.data ?? [], isLoading: query.isLoading, sendMessage };
}

export function useWhatsAppTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_templates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (t: { company_id: string; name: string; content: string; category?: string }) => {
      const { data, error } = await supabase.from("whatsapp_templates").insert(t as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-templates"] }); toast({ title: "Template created" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-templates"] }); toast({ title: "Template deleted" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  return { templates: query.data ?? [], isLoading: query.isLoading, createTemplate, deleteTemplate };
}

export function useWhatsAppAutoRules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-auto-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_auto_rules").select("*, whatsapp_templates(name, content)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createRule = useMutation({
    mutationFn: async (r: { company_id: string; trigger_keywords: string[]; response_template_id?: string; is_active?: boolean }) => {
      const { data, error } = await supabase.from("whatsapp_auto_rules").insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-auto-rules"] }); toast({ title: "Rule created" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("whatsapp_auto_rules").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa-auto-rules"] }),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_auto_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-auto-rules"] }); toast({ title: "Rule deleted" }); },
  });

  return { rules: query.data ?? [], isLoading: query.isLoading, createRule, toggleRule, deleteRule };
}

export function useProductCatalog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["product-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_catalog").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (p: { company_id: string; name: string; description?: string; price: number; category?: string; image_url?: string }) => {
      const { data, error } = await supabase.from("product_catalog").insert(p).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product-catalog"] }); toast({ title: "Product added" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; price?: number; category?: string; availability?: boolean }) => {
      const { data, error } = await supabase.from("product_catalog").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product-catalog"] }); toast({ title: "Product updated" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product-catalog"] }); toast({ title: "Product deleted" }); },
  });

  return { products: query.data ?? [], isLoading: query.isLoading, createProduct, updateProduct, deleteProduct };
}

export function useWhatsAppOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, payment_status }: { id: string; status?: string; payment_status?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (payment_status) updates.payment_status = payment_status;
      const { error } = await supabase.from("whatsapp_orders").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-orders"] }); toast({ title: "Order updated" }); },
  });

  return { orders: query.data ?? [], isLoading: query.isLoading, updateOrderStatus };
}

export function useWhatsAppBroadcasts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["wa-broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_broadcasts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createBroadcast = useMutation({
    mutationFn: async (b: { company_id: string; name: string; message: string; target_tags?: string[]; scheduled_at?: string }) => {
      const { data, error } = await supabase.from("whatsapp_broadcasts").insert(b).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wa-broadcasts"] }); toast({ title: "Broadcast created" }); },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  return { broadcasts: query.data ?? [], isLoading: query.isLoading, createBroadcast };
}
