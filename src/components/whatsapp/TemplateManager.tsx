import { useState } from "react";
import { useWhatsAppTemplates } from "@/hooks/useWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, MessageSquare } from "lucide-react";

interface Props { companyId: string; }

export function TemplateManager({ companyId }: Props) {
  const { templates, isLoading, createTemplate, deleteTemplate } = useWhatsAppTemplates();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("faq");

  const handleCreate = () => {
    if (!name || !content) return;
    createTemplate.mutate(
      { company_id: companyId, name, content, category },
      { onSuccess: () => { setOpen(false); setName(""); setContent(""); setCategory("faq"); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Reply Templates</h3>
          <p className="text-sm text-muted-foreground">Create reusable message templates for fast responses.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Template</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pricing Response" /></div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your template message..." rows={4} /></div>
              <Button onClick={handleCreate} className="w-full" disabled={createTemplate.isPending}>Create Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : templates.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">No templates yet. Create your first quick reply template!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTemplate.mutate(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <Badge variant="secondary" className="w-fit text-xs capitalize">{t.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{t.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
