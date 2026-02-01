import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Employee = Database["public"]["Tables"]["employees"]["Row"];
type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"];
type AttendanceRecord = Database["public"]["Tables"]["attendance_records"]["Row"];
type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];

export function useEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      return data as Employee[];
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<EmployeeInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to create employee",
        description: error.message 
      });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update employee",
        description: error.message 
      });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to delete employee",
        description: error.message 
      });
    },
  });

  return {
    employees: employeesQuery.data ?? [],
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

export function useAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const attendanceQuery = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, employees(full_name, employee_number)")
        .order("date", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const clockIn = useMutation({
    mutationFn: async ({ employeeId, companyId }: { employeeId: string; companyId: string }) => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("attendance_records")
        .upsert({
          employee_id: employeeId,
          company_id: companyId,
          date: today,
          clock_in: new Date().toISOString(),
          status: "present",
        }, {
          onConflict: "employee_id,date",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Clocked in successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to clock in",
        description: error.message 
      });
    },
  });

  const clockOut = useMutation({
    mutationFn: async ({ employeeId }: { employeeId: string }) => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("attendance_records")
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq("employee_id", employeeId)
        .eq("date", today)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Clocked out successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to clock out",
        description: error.message 
      });
    },
  });

  return {
    attendance: attendanceQuery.data ?? [],
    isLoading: attendanceQuery.isLoading,
    clockIn,
    clockOut,
  };
}

export function useLeaveRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const leaveRequestsQuery = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*, employees(full_name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createLeaveRequest = useMutation({
    mutationFn: async (request: {
      employee_id: string;
      company_id: string;
      leave_type: Database["public"]["Enums"]["leave_type"];
      start_date: string;
      end_date: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("leave_requests")
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast({ title: "Leave request submitted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to submit leave request",
        description: error.message 
      });
    },
  });

  const updateLeaveStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: Database["public"]["Enums"]["leave_status"];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("leave_requests")
        .update({ 
          status,
          approved_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast({ 
        title: `Leave request ${variables.status === "approved" ? "approved" : "rejected"}` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        variant: "destructive",
        title: "Failed to update leave request",
        description: error.message 
      });
    },
  });

  return {
    leaveRequests: leaveRequestsQuery.data ?? [],
    isLoading: leaveRequestsQuery.isLoading,
    createLeaveRequest,
    updateLeaveStatus,
  };
}
