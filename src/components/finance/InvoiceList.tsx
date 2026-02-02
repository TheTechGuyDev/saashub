import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "lucide-react";
import { Invoice, useInvoices } from "@/hooks/useFinance";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
  const { deleteInvoice, updateInvoice } = useInvoices();

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
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Invoices ({invoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customers?.name || 'N/A'}</TableCell>
                  <TableCell className="font-medium">
                    ₦{Number(invoice.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]} variant="outline">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(invoice.due_date), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {invoice.status === "sent" && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateInvoice.mutate({ 
                            id: invoice.id, 
                            status: "paid",
                            paid_at: new Date().toISOString()
                          })}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => deleteInvoice.mutate(invoice.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
