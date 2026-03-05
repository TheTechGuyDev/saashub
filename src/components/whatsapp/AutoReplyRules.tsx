import { useState } from "react";
import { useWhatsAppAutoRules, useWhatsAppTemplates } from "@/hooks/useWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Zap } from "lucide-react";

interface Props { companyId: string; }

export function AutoReplyRules({ companyId }: Props) {
  const { rules, isLoading, createRule, toggleRule, deleteRule } = useWhatsAppAutoRules();
  const { templates } = useWhatsAppTemplates();
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [templateId, setTemplateId] = useState("");

  const handleCreate = () => {
    if (!keywords) return;
    createRule.mutate(
      { company_id: companyId, trigger_keywords: keywords.split(",").map((k) => k.trim()), response_template_id: templateId || undefined },
      { onSuccess: () => { setOpen(false); setKeywords(""); setTemplateId(""); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Auto-Reply Rules</h3>
          <p className="text-sm text-muted-foreground">Set keyword triggers to auto-respond to customer messages.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Rule</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Auto-Reply Rule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Trigger Keywords (comma-separated)</Label><Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="price, how much, cost" /></div>
              <div>
                <Label>Response Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createRule.isPending}>
                <Zap className="mr-2 h-4 w-4" /> Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : rules.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">No auto-reply rules yet. Create templates first, then build rules.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.trigger_keywords?.map((k: string) => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  → {(r as any).whatsapp_templates?.name || "AI Fallback Response"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={r.is_active ?? true} onCheckedChange={(v) => toggleRule.mutate({ id: r.id, is_active: v })} />
                <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
