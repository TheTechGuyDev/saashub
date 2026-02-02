import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type Document = {
  id: string;
  company_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  folder: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export function useDocuments() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const documentsQuery = useQuery({
    queryKey: ["documents", profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!profile?.company_id || !!profile?.id,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, folder = "root" }: { file: File; folder?: string }) => {
      if (!profile?.company_id) throw new Error("No company ID");

      // Upload to storage
      const filePath = `${profile.company_id}/${folder}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from("documents")
        .insert({
          company_id: profile.company_id,
          name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          folder,
          uploaded_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to upload document",
        description: error.message,
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: Document) => {
      // Delete from storage
      const path = new URL(doc.file_url).pathname.split("/").slice(-3).join("/");
      await supabase.storage.from("documents").remove([path]);

      // Delete record
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete document",
        description: error.message,
      });
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    uploadDocument,
    deleteDocument,
  };
}
