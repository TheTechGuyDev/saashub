import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StaffActivity {
  id: string;
  company_id: string;
  user_id: string;
  employee_id: string | null;
  activity_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useStaffActivities(opts?: { userId?: string; limit?: number }) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["staff-activities", opts?.userId ?? "all", opts?.limit ?? 100],
    queryFn: async () => {
      let query = (supabase as any)
        .from("staff_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 100);
      if (opts?.userId) query = query.eq("user_id", opts.userId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as StaffActivity[];
    },
    enabled: !!profile,
  });
}

export function useLogActivity() {
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      activity_type: string;
      description: string;
      entity_type?: string;
      entity_id?: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user?.id || !profile?.company_id) return null;
      const { data, error } = await (supabase as any)
        .from("staff_activities")
        .insert({
          user_id: user.id,
          company_id: profile.company_id,
          activity_type: input.activity_type,
          description: input.description,
          entity_type: input.entity_type ?? null,
          entity_id: input.entity_id ?? null,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-activities"] });
    },
  });
}