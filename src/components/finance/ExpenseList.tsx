import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown } from "lucide-react";
import { Expense, useExpenses } from "@/hooks/useFinance";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const { deleteExpense } = useExpenses();

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Expenses ({expenses.length})
          </CardTitle>
          <div className="text-lg font-semibold text-destructive">
            Total: ₦{totalExpenses.toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.category}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {expense.description || '-'}
                  </TableCell>
                  <TableCell className="font-medium text-destructive">
                    ₦{Number(expense.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteExpense.mutate(expense.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No expenses recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
