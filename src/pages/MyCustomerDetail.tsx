import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Building2, MessageSquare, Activity, PhoneCall, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800",
  opportunity: "bg-purple-100 text-purple-800",
  deal: "bg-amber-100 text-amber-800",
  closed_won: "bg-emerald-100 text-emerald-800",
  closed_lost: "bg-red-100 text-red-800",
};

export default function MyCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      if (data) setNotes(data.notes ?? "");
      return data;
    },
    enabled: !!id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["customer-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_activities").select("*")
        .eq("customer_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: calls = [] } = useQuery({
    queryKey: ["customer-calls", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs").select("*")
        .eq("customer_id", id!).order("called_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["customer-wa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_conversations").select("*")
        .eq("customer_id", id!).order("last_message_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const addNote = async () => {
    if (!note.trim() || !customer || !profile?.company_id) return;
    const { error } = await supabase.from("customer_activities").insert({
      customer_id: customer.id,
      company_id: profile.company_id,
      user_id: user?.id,
      type: "note" as any,
      description: note.trim(),
    });
    if (error) {
      toast({ variant: "destructive", title: "Failed to add note", description: error.message });
      return;
    }
    setNote("");
    qc.invalidateQueries({ queryKey: ["customer-activities", id] });
    toast({ title: "Note added" });
  };

  const saveNotes = async () => {
    if (!customer) return;
    setSavingNotes(true);
    const { error } = await supabase.from("customers").update({ notes }).eq("id", customer.id);
    setSavingNotes(false);
    if (error) {
      toast({ variant: "destructive", title: "Failed to save", description: error.message });
      return;
    }
    qc.invalidateQueries({ queryKey: ["customer", id] });
    toast({ title: "Notes saved" });
  };

  if (isLoading) return <Skeleton className="h-64" />;
  if (!customer) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Customer not found.</p>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              {customer.company_name && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="h-4 w-4" /> {customer.company_name}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {customer.email && (<span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>)}
                {customer.phone && (<span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>)}
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className={statusColors[customer.status] ?? ""} variant="secondary">
                {String(customer.status).replace("_", " ")}
              </Badge>
              <p className="text-2xl font-bold">${Number(customer.value ?? 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pipeline value</p>
            </div>
          </div>
          {customer.tags && customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {customer.tags.map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><StickyNote className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="timeline"><Activity className="h-4 w-4 mr-1" /> Timeline</TabsTrigger>
          <TabsTrigger value="calls"><PhoneCall className="h-4 w-4 mr-1" /> Calls</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageSquare className="h-4 w-4 mr-1" /> WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={6}
                value={notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this customer..."
              />
              <Button onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving..." : "Save notes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note to the timeline..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
                />
                <Button onClick={addNote} disabled={!note.trim()}>Add</Button>
              </div>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className="border-l-2 border-primary pl-3 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="capitalize">{String(a.type)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{a.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardContent className="p-4">
              {calls.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No calls logged.</p>
              ) : (
                <ul className="space-y-3">
                  {calls.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{c.contact_name} — {c.phone_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.called_at), "PPp")} · {c.direction} · {c.duration ?? 0}s
                        </p>
                        {c.notes && <p className="text-xs mt-1">{c.notes}</p>}
                      </div>
                      {c.outcome && <Badge variant="outline">{c.outcome}</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardContent className="p-4">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No WhatsApp conversations.</p>
              ) : (
                <ul className="space-y-3">
                  {conversations.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{c.contact_name}</p>
                        <p className="text-xs text-muted-foreground">{c.contact_phone}</p>
                      </div>
                      <Link to="/whatsapp" className="text-sm text-primary hover:underline">Open inbox →</Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}