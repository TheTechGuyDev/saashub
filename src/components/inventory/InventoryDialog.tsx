import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Electronics", "Office Supplies", "Furniture", "Equipment", "Raw Materials", "Other"];

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

export function InventoryDialog({ open, onOpenChange, item }: InventoryDialogProps) {
  const { profile } = useAuth();
  const { createItem, updateItem } = useInventory();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: item?.name || "",
      sku: item?.sku || "",
      description: item?.description || "",
      category: item?.category || "",
      quantity: item?.quantity?.toString() || "0",
      unit_price: item?.unit_price?.toString() || "0",
      cost_price: item?.cost_price?.toString() || "0",
      reorder_level: item?.reorder_level?.toString() || "10",
    },
  });

  const onSubmit = (data: any) => {
    const itemData = {
      name: data.name,
      sku: data.sku || null,
      description: data.description || null,
      category: data.category || null,
      quantity: parseInt(data.quantity),
      unit_price: parseFloat(data.unit_price),
      cost_price: parseFloat(data.cost_price) || null,
      reorder_level: parseInt(data.reorder_level) || 10,
      company_id: profile?.company_id || "",
    };

    if (item) {
      updateItem.mutate({ id: item.id, ...itemData });
    } else {
      createItem.mutate(itemData);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "New Inventory Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="Item name" />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} placeholder="SKU-001" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Item description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unit_price">Unit Price (₦)</Label>
              <Input id="unit_price" type="number" {...register("unit_price")} />
            </div>
            <div>
              <Label htmlFor="cost_price">Cost Price (₦)</Label>
              <Input id="cost_price" type="number" {...register("cost_price")} />
            </div>
            <div>
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input id="reorder_level" type="number" {...register("reorder_level")} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{item ? "Update" : "Add"} Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
