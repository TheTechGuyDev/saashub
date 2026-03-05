import { useState } from "react";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationInbox } from "@/components/whatsapp/ConversationInbox";
import { BroadcastManager } from "@/components/whatsapp/BroadcastManager";
import { AutoReplyRules } from "@/components/whatsapp/AutoReplyRules";
import { TemplateManager } from "@/components/whatsapp/TemplateManager";
import { ProductCatalogManager } from "@/components/whatsapp/ProductCatalogManager";
import { OrderList } from "@/components/whatsapp/OrderList";
import { WhatsAppAnalytics } from "@/components/whatsapp/WhatsAppAnalytics";
import { ConnectWhatsApp } from "@/components/whatsapp/ConnectWhatsApp";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send, Zap, FileText, Package, ShoppingCart, BarChart3, Wifi } from "lucide-react";

export default function WhatsApp() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  if (!companyId) {
    return (
      <div className="p-6">
        <PageHeader title="WhatsApp Business" description="Connect your WhatsApp to automate conversations and sales." />
        <ConnectWhatsApp />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="WhatsApp Business" description="Manage conversations, automate replies, and grow sales through WhatsApp." />

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="inbox" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" /><span className="hidden sm:inline">Inbox</span></TabsTrigger>
          <TabsTrigger value="broadcasts" className="gap-1.5 text-xs"><Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">Broadcasts</span></TabsTrigger>
          <TabsTrigger value="auto-replies" className="gap-1.5 text-xs"><Zap className="h-3.5 w-3.5" /><span className="hidden sm:inline">Auto-Replies</span></TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /><span className="hidden sm:inline">Templates</span></TabsTrigger>
          <TabsTrigger value="catalog" className="gap-1.5 text-xs"><Package className="h-3.5 w-3.5" /><span className="hidden sm:inline">Catalog</span></TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs"><ShoppingCart className="h-3.5 w-3.5" /><span className="hidden sm:inline">Orders</span></TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Analytics</span></TabsTrigger>
          <TabsTrigger value="connect" className="gap-1.5 text-xs"><Wifi className="h-3.5 w-3.5" /><span className="hidden sm:inline">Connect</span></TabsTrigger>
        </TabsList>

        <TabsContent value="inbox"><ConversationInbox companyId={companyId} /></TabsContent>
        <TabsContent value="broadcasts"><BroadcastManager companyId={companyId} /></TabsContent>
        <TabsContent value="auto-replies"><AutoReplyRules companyId={companyId} /></TabsContent>
        <TabsContent value="templates"><TemplateManager companyId={companyId} /></TabsContent>
        <TabsContent value="catalog"><ProductCatalogManager companyId={companyId} /></TabsContent>
        <TabsContent value="orders"><OrderList /></TabsContent>
        <TabsContent value="analytics"><WhatsAppAnalytics /></TabsContent>
        <TabsContent value="connect"><ConnectWhatsApp connected /></TabsContent>
      </Tabs>
    </div>
  );
}
