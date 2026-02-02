import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoices } from "@/hooks/useFinance";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDialog({ open, onOpenChange }: InvoiceDialogProps) {
  const { profile } = useAuth();
  const { createInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      customer_id: "",
      amount: "",
      tax_amount: "0",
      due_date: "",
      notes: "",
    },
  });

  const amount = parseFloat(watch("amount") || "0");
  const tax = parseFloat(watch("tax_amount") || "0");
  const total = amount + tax;

  const onSubmit = (data: any) => {
    const invoiceData = {
      invoice_number: data.invoice_number,
      customer_id: data.customer_id || null,
      amount: parseFloat(data.amount),
      tax_amount: parseFloat(data.tax_amount) || 0,
      total_amount: parseFloat(data.amount) + (parseFloat(data.tax_amount) || 0),
      due_date: data.due_date,
      notes: data.notes || null,
      status: "draft" as const,
      issue_date: new Date().toISOString().split('T')[0],
      paid_at: null,
      items: [],
      company_id: profile?.company_id || "",
    };

    createInvoice.mutate(invoiceData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input id="invoice_number" {...register("invoice_number", { required: true })} />
            </div>
            <div>
              <Label htmlFor="customer_id">Customer</Label>
              <Select value={watch("customer_id")} onValueChange={(v) => setValue("customer_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input id="amount" type="number" {...register("amount", { required: true })} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="tax_amount">Tax (₦)</Label>
              <Input id="tax_amount" type="number" {...register("tax_amount")} placeholder="0.00" />
            </div>
            <div>
              <Label>Total (₦)</Label>
              <Input value={total.toLocaleString()} disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" {...register("due_date", { required: true })} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
