import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Article = {
  id: string;
  company_id: string;
  title: string;
  content: string;
  category: string | null;
  slug: string | null;
  published: boolean | null;
  views: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function useArticles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const createArticle = useMutation({
    mutationFn: async (article: Omit<Article, "id" | "created_at" | "updated_at" | "views">) => {
      const { data, error } = await supabase
        .from("articles")
        .insert(article)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({ title: "Article created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create article",
        description: error.message 
      });
    },
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase
        .from("articles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({ title: "Article updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update article",
        description: error.message 
      });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({ title: "Article deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete article",
        description: error.message 
      });
    },
  });

  return {
    articles: articlesQuery.data ?? [],
    isLoading: articlesQuery.isLoading,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
