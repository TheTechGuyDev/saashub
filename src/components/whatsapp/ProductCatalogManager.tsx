import { useState } from "react";
import { useProductCatalog } from "@/hooks/useWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Package } from "lucide-react";

interface Props { companyId: string; }

export function ProductCatalogManager({ companyId }: Props) {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProductCatalog();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const handleCreate = () => {
    if (!name || !price) return;
    createProduct.mutate(
      { company_id: companyId, name, description, price: parseFloat(price), category },
      { onSuccess: () => { setOpen(false); setName(""); setDescription(""); setPrice(""); setCategory(""); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product Catalog</h3>
          <p className="text-sm text-muted-foreground">Manage products customers can order via WhatsApp.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Product Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Shawarma" /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description" rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" /></div>
                <div><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Food" /></div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createProduct.isPending}>Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : products.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground"><Package className="mx-auto h-10 w-10 mb-3 text-muted-foreground/30" /><p>No products yet. Add your first product!</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{p.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteProduct.mutate(p.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {p.category && <Badge variant="secondary" className="text-xs">{p.category}</Badge>}
                  <span className="text-sm font-bold text-primary">₦{Number(p.price).toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description || "No description"}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Available:</span>
                  <Switch checked={p.availability ?? true} onCheckedChange={(v) => updateProduct.mutate({ id: p.id, availability: v })} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
