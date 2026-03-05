import { useWhatsAppOrders } from "@/hooks/useWhatsApp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import { format } from "date-fns";

export function OrderList() {
  const { orders, isLoading, updateOrderStatus } = useWhatsAppOrders();

  const statusColors: Record<string, string> = {
    pending: "secondary",
    confirmed: "default",
    delivered: "default",
    cancelled: "destructive",
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (orders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-muted-foreground">
          <Package className="mx-auto h-10 w-10 mb-3 text-muted-foreground/30" />
          <p>No orders yet. Orders will appear here when customers place them via WhatsApp.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">WhatsApp Orders</h3>
        <p className="text-sm text-muted-foreground">Manage orders placed through WhatsApp conversations.</p>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const items = Array.isArray(o.product_items) ? o.product_items : [];
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.customer_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{items.length} item(s)</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.delivery_location || "N/A"}</TableCell>
                  <TableCell>
                    <Select value={o.payment_status} onValueChange={(v) => updateOrderStatus.mutate({ id: o.id, payment_status: v })}>
                      <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateOrderStatus.mutate({ id: o.id, status: v })}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
