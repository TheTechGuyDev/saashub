import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerStatus = Database["public"]["Enums"]["customer_status"];

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  status: z.enum(["lead", "opportunity", "deal", "closed_won", "closed_lost"]),
  value: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const { profile, isSuperAdmin } = useAuth();
  const { createCustomer, updateCustomer } = useCustomers();
  const { companies } = useAdminData();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const isEditing = !!customer;
  const showCompanySelect = isSuperAdmin() && !isEditing;

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company_name: "",
      status: "lead",
      value: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        company_name: customer.company_name ?? "",
        status: customer.status,
        value: customer.value?.toString() ?? "",
        notes: customer.notes ?? "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        company_name: "",
        status: "lead",
        value: "",
        notes: "",
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: CustomerFormData) => {
    // For super admin, use selected company; for regular users, use their company_id
    let companyId = profile?.company_id;
    
    if (isSuperAdmin()) {
      if (isEditing && customer) {
        companyId = customer.company_id; // Keep original company when editing
      } else {
        companyId = selectedCompanyId;
        if (!companyId) {
          form.setError("name", { message: "Please select a company first" });
          return;
        }
      }
    }
    
    if (!companyId) {
      form.setError("name", { message: "Company ID is required" });
      return;
    }
    
    const customerData = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company_name: data.company_name || null,
      status: data.status as CustomerStatus,
      value: data.value ? parseFloat(data.value) : 0,
      notes: data.notes || null,
      company_id: companyId,
    };

    if (isEditing && customer) {
      await updateCustomer.mutateAsync({ id: customer.id, ...customerData });
    } else {
      await createCustomer.mutateAsync(customerData);
    }

    onOpenChange(false);
    setSelectedCompanyId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Company selection for super admin */}
            {showCompanySelect && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Select Company *</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
              <Label htmlFor="company_name">Company</Label>
              <Input
                id="company_name"
                placeholder="Acme Inc."
                {...form.register("company_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as CustomerStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="value">Deal Value ($)</Label>
              <Input
                id="value"
                type="number"
                placeholder="10000"
                {...form.register("value")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this customer..."
                rows={3}
                {...form.register("notes")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCustomer.isPending || updateCustomer.isPending}
            >
              {createCustomer.isPending || updateCustomer.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                isEditing ? "Update Customer" : "Add Customer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
