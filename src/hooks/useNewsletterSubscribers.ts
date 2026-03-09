import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
};

export function useNewsletterSubscribers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const subscribersQuery = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .is("unsubscribed_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as NewsletterSubscriber[];
    },
  });

  const subscribe = useMutation({
    mutationFn: async ({ email, source }: { email: string; source?: string }) => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source: source || "website" })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("This email is already subscribed");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({ 
        title: "Subscribed!", 
        description: "You'll receive our latest updates." 
      });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to subscribe",
        description: error.message 
      });
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("email", email);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast({ title: "Unsubscribed successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to unsubscribe",
        description: error.message 
      });
    },
  });

  return {
    subscribers: subscribersQuery.data ?? [],
    isLoading: subscribersQuery.isLoading,
    subscribe,
    unsubscribe,
  };
}
