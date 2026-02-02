import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTickets, Ticket } from "@/hooks/useTickets";
import { useCustomers } from "@/hooks/useCustomers";
import { useAdminData } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
}

export function TicketDialog({ open, onOpenChange, ticket }: TicketDialogProps) {
  const { profile, isSuperAdmin } = useAuth();
  const { createTicket, updateTicket } = useTickets();
  const { customers } = useCustomers();
  const { companies } = useAdminData();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      ticket_number: ticket?.ticket_number || `TKT-${Date.now().toString().slice(-6)}`,
      subject: ticket?.subject || "",
      description: ticket?.description || "",
      customer_id: ticket?.customer_id || "",
      priority: ticket?.priority || "medium",
      status: ticket?.status || "open",
      company_id: ticket?.company_id || profile?.company_id || "",
    },
  });

  // Reset form when ticket changes
  useEffect(() => {
    if (ticket) {
      setValue("ticket_number", ticket.ticket_number);
      setValue("subject", ticket.subject);
      setValue("description", ticket.description || "");
      setValue("customer_id", ticket.customer_id || "");
      setValue("priority", ticket.priority);
      setValue("status", ticket.status);
      setValue("company_id", ticket.company_id);
    } else {
      reset({
        ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
        subject: "",
        description: "",
        customer_id: "",
        priority: "medium",
        status: "open",
        company_id: profile?.company_id || "",
      });
    }
  }, [ticket, reset, setValue, profile?.company_id]);

  const selectedCompanyId = watch("company_id");

  // Filter customers by selected company for super admin
  const filteredCustomers = isSuperAdmin() && selectedCompanyId
    ? customers.filter(c => c.company_id === selectedCompanyId)
    : customers;

  const onSubmit = (data: any) => {
    // Determine the company_id to use
    let companyId = data.company_id;
    
    // For regular users, use their profile company_id
    if (!isSuperAdmin()) {
      companyId = profile?.company_id;
    }
    
    // Validate company_id
    if (!companyId) {
      return; // Don't submit without a company
    }

    const ticketData = {
      ticket_number: data.ticket_number,
      subject: data.subject,
      description: data.description || null,
      customer_id: data.customer_id || null,
      priority: data.priority,
      status: data.status,
      assigned_to: null,
      created_by: profile?.id || null,
      company_id: companyId,
    };

    if (ticket) {
      updateTicket.mutate({ id: ticket.id, ...ticketData });
    } else {
      createTicket.mutate(ticketData);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ticket ? "Edit Ticket" : "New Support Ticket"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Super Admin: Company Selection */}
          {isSuperAdmin() && !ticket && (
            <div>
              <Label htmlFor="company_id">Company *</Label>
              <Select 
                value={watch("company_id") || ""} 
                onValueChange={(v) => {
                  setValue("company_id", v);
                  setValue("customer_id", ""); // Reset customer when company changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .filter(c => c.id !== '00000000-0000-0000-0000-000000000000') // Exclude platform company
                    .map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ticket_number">Ticket #</Label>
              <Input id="ticket_number" {...register("ticket_number")} disabled />
            </div>
            <div>
              <Label htmlFor="customer_id">Customer</Label>
              <Select value={watch("customer_id") || ""} onValueChange={(v) => setValue("customer_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Customer</SelectItem>
                  {filteredCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" {...register("subject", { required: true })} placeholder="Ticket subject" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe the issue..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={watch("priority")} onValueChange={(v: "low" | "medium" | "high" | "critical") => setValue("priority", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ticket && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch("status")} onValueChange={(v: "open" | "in_progress" | "waiting" | "resolved" | "closed") => setValue("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isSuperAdmin() && !profile?.company_id}
            >
              {ticket ? "Update" : "Create"} Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
