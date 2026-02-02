import { useState } from "react";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventory } from "@/hooks/useInventory";
import { InventoryDialog } from "@/components/inventory/InventoryDialog";

export default function Inventory() {
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const { items, lowStockItems, isLoading, deleteItem } = useInventory();

  const handleEdit = (item: any) => {
    setEditItem(item);
    setShowDialog(true);
  };

  const handleClose = () => {
    setEditItem(null);
    setShowDialog(false);
  };

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Track and manage inventory items."
        icon={Package}
        action={{
          label: "Add Item",
          onClick: () => setShowDialog(true),
        }}
      />

      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge key={item.id} variant="outline" className="text-warning border-warning/50">
                  {item.name}: {item.quantity} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.sku || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{item.category || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <span className={item.quantity <= (item.reorder_level ?? 10) ? 'text-warning font-medium' : ''}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>₦{Number(item.unit_price).toLocaleString()}</TableCell>
                    <TableCell>₦{(item.quantity * Number(item.unit_price)).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteItem.mutate(item.id)}
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
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory items yet.</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InventoryDialog
        open={showDialog}
        onOpenChange={handleClose}
        item={editItem}
      />
    </div>
  );
}
