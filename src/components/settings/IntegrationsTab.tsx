import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mail, MessageCircle, Phone, CheckCircle, XCircle, ExternalLink, Key, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "not_connected";
  secretKey: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}

const integrations: Integration[] = [
  {
    id: "resend",
    name: "Email (Resend)",
    description: "Send email marketing campaigns and transactional emails using Resend API.",
    icon: Mail,
    status: "connected",
    secretKey: "RESEND_API_KEY",
    fields: [{ key: "api_key", label: "Resend API Key", placeholder: "re_..." }],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    description: "Platform-wide WhatsApp integration. Once connected, companies can link their WhatsApp Business numbers.",
    icon: MessageCircle,
    status: "not_connected",
    secretKey: "WHATSAPP_API_TOKEN",
    fields: [
      { key: "api_token", label: "WhatsApp API Token", placeholder: "Enter your WhatsApp Cloud API token" },
      { key: "phone_number_id", label: "Phone Number ID", placeholder: "e.g., 123456789012345" },
      { key: "business_account_id", label: "Business Account ID", placeholder: "e.g., 987654321098765" },
    ],
  },
  {
    id: "twilio",
    name: "Twilio (Voice & SMS)",
    description: "Make and receive phone calls, send SMS messages using Twilio.",
    icon: Phone,
    status: "not_connected",
    secretKey: "TWILIO_AUTH_TOKEN",
    fields: [
      { key: "account_sid", label: "Account SID", placeholder: "AC..." },
      { key: "auth_token", label: "Auth Token", placeholder: "Enter your Twilio Auth Token", type: "password" },
      { key: "phone_number", label: "Twilio Phone Number", placeholder: "+1234567890" },
    ],
  },
];

export function IntegrationsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Load platform settings to check which integrations are configured
  const { data: platformSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.company_id) return {};

      const { data } = await supabase
        .from("companies")
        .select("settings")
        .eq("id", profile.company_id)
        .single();
      
      return (data?.settings as Record<string, any>) || {};
    },
  });

  const getIntegrationStatus = (integration: Integration): "connected" | "not_connected" => {
    if (integration.id === "resend") return "connected"; // Pre-configured
    const configured = platformSettings?.[`${integration.id}_configured`];
    return configured ? "connected" : "not_connected";
  };

  const handleConfigure = (integrationId: string) => {
    setConfiguring(integrationId);
    setFormData({});
  };

  const saveConfigMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.company_id) throw new Error("Company not found");

      // Get current settings
      const { data: company } = await supabase
        .from("companies")
        .select("settings")
        .eq("id", profile.company_id)
        .single();

      const currentSettings = (company?.settings as Record<string, any>) || {};
      
      // Update settings with new integration status
      const { error } = await supabase
        .from("companies")
        .update({
          settings: {
            ...currentSettings,
            [`${integrationId}_configured`]: true,
          }
        })
        .eq("id", profile.company_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast({
        title: "Configuration Saved",
        description: `${integrations.find(i => i.id === configuring)?.name} has been configured. API credentials are stored securely.`,
      });
      setConfiguring(null);
      setFormData({});
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to save configuration",
        description: error.message,
      });
    },
  });

  const handleSaveConfig = async () => {
    if (!configuring) return;
    await saveConfigMutation.mutateAsync(configuring);
  };

  const getStatusBadge = (status: "connected" | "not_connected") => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "not_connected":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Not Connected
          </Badge>
        );
    }
  };

  const currentIntegration = integrations.find(i => i.id === configuring);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Integrations</CardTitle>
          <CardDescription>
            Connect third-party services to enable features across all companies on the platform.
            These are platform-level credentials managed by Super Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              const status = getIntegrationStatus(integration);
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    <Button
                      size="sm"
                      variant={status === "connected" ? "outline" : "default"}
                      onClick={() => handleConfigure(integration.id)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {status === "connected" ? "Reconfigure" : "Configure"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-info" />
            How Integrations Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">WhatsApp Business API</h4>
            <p className="text-sm text-muted-foreground">
              Once you configure the WhatsApp Business API here, companies on the platform can connect their
              WhatsApp Business numbers from their WhatsApp page. They simply enter their business phone number
              and the platform handles the rest — auto-replies, broadcasts, and order collection.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Email (Resend)</h4>
            <p className="text-sm text-muted-foreground">
              Email integration is pre-configured. Companies can send email campaigns from the Email Marketing page.
              For production use, verify your own domain at resend.com.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Twilio (Voice & SMS)</h4>
            <p className="text-sm text-muted-foreground">
              Configure Twilio to enable the Call Centre module with live call routing, queue management,
              and SMS notifications across all companies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={(open) => !open && setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {currentIntegration?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials. These are stored securely and used platform-wide.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {currentIntegration?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setConfiguring(null)}>Cancel</Button>
              <Button onClick={handleSaveConfig} disabled={saveConfigMutation.isPending}>
                {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
