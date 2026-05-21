import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["employees"]["Row"];
type EmployeeStatus = Database["public"]["Enums"]["employee_status"];

const employeeSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  employee_number: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  hire_date: z.string().optional(),
  status: z.enum(["active", "on_leave", "terminated"]),
  salary: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["staff", "company_admin", "user"]).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Product",
  "Design",
  "Legal",
];

export function EmployeeDialog({ open, onOpenChange, employee }: EmployeeDialogProps) {
  const { profile } = useAuth();
  const { createEmployee, updateEmployee, employees } = useEmployees();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEditing = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      employee_number: "",
      department: "",
      position: "",
      hire_date: "",
      status: "active",
      salary: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name,
        email: employee.email ?? "",
        phone: employee.phone ?? "",
        employee_number: employee.employee_number ?? "",
        department: employee.department ?? "",
        position: employee.position ?? "",
        hire_date: employee.hire_date ?? "",
        status: employee.status,
        salary: employee.salary?.toString() ?? "",
      });
    } else {
      form.reset({
        full_name: "",
        email: "",
        phone: "",
        employee_number: "",
        department: "",
        position: "",
        hire_date: new Date().toISOString().split("T")[0],
        status: "active",
        salary: "",
      });
    }
  }, [employee, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    if (isEditing && employee) {
      await updateEmployee.mutateAsync({
        id: employee.id,
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        employee_number: data.employee_number || null,
        department: data.department || null,
        position: data.position || null,
        hire_date: data.hire_date || null,
        status: data.status as EmployeeStatus,
        salary: data.salary ? parseFloat(data.salary) : null,
        company_id: profile?.company_id ?? "",
      });
      onOpenChange(false);
      return;
    }

    // Creating: if email + password provided, create login account via edge function
    if (data.email && data.password) {
      // Use only the caller's company. Super admins without a company must
      // assign themselves to a company before creating staff (no cross-tenant fallback).
      const targetCompanyId = profile?.company_id ?? null;
      if (!targetCompanyId) {
        toast({
          variant: "destructive",
          title: "No company assigned",
          description: "Set up or join a company before adding staff.",
        });
        return;
      }
      const { data: result, error } = await supabase.functions.invoke(
        "create-staff-account",
        {
          body: {
            email: data.email,
            password: data.password,
            full_name: data.full_name,
            phone: data.phone || null,
            department: data.department || null,
            position: data.position || null,
            employee_number: data.employee_number || null,
            hire_date: data.hire_date || null,
            salary: data.salary ? parseFloat(data.salary) : null,
            role: data.role ?? "staff",
            company_id: targetCompanyId,
          },
        },
      );
      let errorMessage: string | undefined = (result as any)?.error;
      if (error && !errorMessage) {
        // supabase-js throws on non-2xx and discards body; read it from error.context
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") {
            const parsed = await ctx.json();
            errorMessage = parsed?.error ?? JSON.stringify(parsed);
          } else if (ctx && typeof ctx.text === "function") {
            errorMessage = await ctx.text();
          }
        } catch {
          /* ignore */
        }
        errorMessage = errorMessage ?? error.message;
      }
      if (error || (result as any)?.error) {
        toast({
          variant: "destructive",
          title: "Failed to create staff account",
          description: errorMessage,
        });
        return;
      }
      toast({
        title: "Staff account created",
        description: `${data.full_name} can now sign in with ${data.email}`,
      });
      qc.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
      return;
    }

    // Fallback: create employee record only (no login)
      if (!profile?.company_id) {
        toast({
          variant: "destructive",
          title: "No company assigned",
          description: "Set up or join a company before adding staff.",
        });
        return;
      }
      await createEmployee.mutateAsync({
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      employee_number: data.employee_number || null,
      department: data.department || null,
      position: data.position || null,
      hire_date: data.hire_date || null,
      status: data.status as EmployeeStatus,
      salary: data.salary ? parseFloat(data.salary) : null,
        company_id: profile.company_id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...form.register("full_name")}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                {...form.register("email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 890"
                {...form.register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_number">Employee ID</Label>
              <Input
                id="employee_number"
                placeholder="EMP001"
                {...form.register("employee_number")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={form.watch("department")}
                onValueChange={(value) => form.setValue("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Software Engineer"
                {...form.register("position")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                {...form.register("hire_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as EmployeeStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="50000"
                {...form.register("salary")}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="rounded-lg border border-dashed p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold">Create login account (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Provide a temporary password and role so this employee can sign in and access their own dashboard. Requires the Email field above.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="At least 6 characters"
                    {...form.register("password")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.watch("role") ?? "staff"}
                    onValueChange={(v) => form.setValue("role", v as "staff" | "company_admin" | "user")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="company_admin">Manager / Admin</SelectItem>
                      <SelectItem value="user">User (limited)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployee.isPending || updateEmployee.isPending}
            >
              {createEmployee.isPending || updateEmployee.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                isEditing ? "Update Employee" : "Add Employee"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
