import { useWhatsAppConversations, useWhatsAppBroadcasts, useWhatsAppOrders } from "@/hooks/useWhatsApp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, ShoppingCart, TrendingUp, Clock, Send } from "lucide-react";

export function WhatsAppAnalytics() {
  const { conversations } = useWhatsAppConversations();
  const { broadcasts } = useWhatsAppBroadcasts();
  const { orders } = useWhatsAppOrders();

  const openConversations = conversations.filter((c) => c.status === "open").length;
  const totalBroadcastsSent = broadcasts.reduce((sum, b) => sum + (b.sent_count ?? 0), 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === "paid").length;

  const stats = [
    { icon: MessageSquare, label: "Total Conversations", value: conversations.length, color: "text-primary" },
    { icon: Users, label: "Open Conversations", value: openConversations, color: "text-info" },
    { icon: Send, label: "Broadcasts Sent", value: totalBroadcastsSent, color: "text-accent" },
    { icon: ShoppingCart, label: "Total Orders", value: totalOrders, color: "text-warning" },
    { icon: TrendingUp, label: "Paid Orders", value: paidOrders, color: "text-success" },
    { icon: Clock, label: "Avg Response Time", value: "< 2 min", color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">WhatsApp Analytics</h3>
        <p className="text-sm text-muted-foreground">Track your WhatsApp business performance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
