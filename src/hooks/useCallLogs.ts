import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type CallLog = {
  id: string;
  company_id: string;
  contact_name: string;
  phone_number: string;
  direction: "inbound" | "outbound";
  duration: number | null;
  outcome: "answered" | "no_answer" | "busy" | "voicemail" | "callback" | null;
  notes: string | null;
  customer_id: string | null;
  employee_id: string | null;
  called_at: string;
  created_at: string;
  customers?: { name: string } | null;
  employees?: { full_name: string } | null;
};

export function useCallLogs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const callLogsQuery = useQuery({
    queryKey: ["call-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*, customers:customer_id(name), employees:employee_id(full_name)")
        .order("called_at", { ascending: false });
      
      if (error) throw error;
      return data as CallLog[];
    },
  });

  const createCallLog = useMutation({
    mutationFn: async (log: Omit<CallLog, "id" | "created_at" | "customers" | "employees">) => {
      const { data, error } = await supabase
        .from("call_logs")
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-logs"] });
      toast({ title: "Call logged successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to log call",
        description: error.message 
      });
    },
  });

  const deleteCallLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-logs"] });
      toast({ title: "Call log deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete call log",
        description: error.message 
      });
    },
  });

  return {
    callLogs: callLogsQuery.data ?? [],
    isLoading: callLogsQuery.isLoading,
    createCallLog,
    deleteCallLog,
  };
}
