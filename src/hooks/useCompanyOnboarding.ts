import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useCompanyOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const createCompany = async (companyName: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please sign in first",
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Call the database function to create company and assign admin role
      const { data, error } = await supabase.rpc("create_company_and_assign_admin", {
        p_company_name: companyName,
        p_user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Company created!",
        description: `Welcome to ${companyName}! You are now the Company Admin.`,
      });

      // Force refresh the page to update auth context
      window.location.reload();

      return data;
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast({
        variant: "destructive",
        title: "Failed to create company",
        description: error.message,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const needsOnboarding = !profile?.company_id;

  return {
    createCompany,
    isLoading,
    needsOnboarding,
  };
}
