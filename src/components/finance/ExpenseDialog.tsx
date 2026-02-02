import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useFinance";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "Office Supplies",
  "Software",
  "Marketing",
  "Utilities",
  "Rent",
  "Salaries",
  "Travel",
  "Equipment",
  "Maintenance",
  "Other",
];

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDialog({ open, onOpenChange }: ExpenseDialogProps) {
  const { profile } = useAuth();
  const { createExpense } = useExpenses();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      category: "",
      amount: "",
      description: "",
      expense_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: any) => {
    const expenseData = {
      category: data.category,
      amount: parseFloat(data.amount),
      description: data.description || null,
      expense_date: data.expense_date,
      receipt_url: null,
      approved_by: null,
      created_by: profile?.id || null,
      company_id: profile?.company_id || "",
    };

    createExpense.mutate(expenseData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input id="amount" type="number" {...register("amount", { required: true })} placeholder="0.00" />
          </div>
          <div>
            <Label htmlFor="expense_date">Date</Label>
            <Input id="expense_date" type="date" {...register("expense_date", { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Expense details..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
