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
  const { createEmployee, updateEmployee } = useEmployees();
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
    const employeeData = {
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
    };

    if (isEditing && employee) {
      await updateEmployee.mutateAsync({ id: employee.id, ...employeeData });
    } else {
      await createEmployee.mutateAsync(employeeData);
    }

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
