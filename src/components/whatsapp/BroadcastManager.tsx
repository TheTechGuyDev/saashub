import { useState } from "react";
import { useWhatsAppBroadcasts } from "@/hooks/useWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Props { companyId: string; }

export function BroadcastManager({ companyId }: Props) {
  const { broadcasts, isLoading, createBroadcast } = useWhatsAppBroadcasts();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = () => {
    if (!name || !message) return;
    createBroadcast.mutate(
      { company_id: companyId, name, message, target_tags: tags ? tags.split(",").map((t) => t.trim()) : [] },
      { onSuccess: () => { setOpen(false); setName(""); setMessage(""); setTags(""); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Broadcast Campaigns</h3>
          <p className="text-sm text-muted-foreground">Send marketing messages to targeted audiences.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Broadcast</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Broadcast</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Campaign Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Promo" /></div>
              <div><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your broadcast message..." rows={4} /></div>
              <div><Label>Target Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="VIP, Hot Lead" /></div>
              <Button onClick={handleCreate} className="w-full" disabled={createBroadcast.isPending}>
                <Send className="mr-2 h-4 w-4" /> Create Broadcast
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : broadcasts.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">No broadcasts yet. Create your first campaign!</CardContent></Card>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Delivered</TableHead><TableHead>Read</TableHead><TableHead>Replies</TableHead><TableHead>Created</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell><Badge variant={b.status === "completed" ? "default" : "secondary"} className="capitalize">{b.status}</Badge></TableCell>
                  <TableCell>{b.sent_count}</TableCell>
                  <TableCell>{b.delivered_count}</TableCell>
                  <TableCell>{b.read_count}</TableCell>
                  <TableCell>{b.reply_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(b.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
