import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Phone, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "connected" | "not_connected" | "coming_soon";
  configUrl?: string;
}

const integrations: Integration[] = [
  {
    id: "resend",
    name: "Email (Resend)",
    description: "Send email marketing campaigns and transactional emails using Resend API.",
    icon: Mail,
    status: "connected",
    configUrl: "https://resend.com/api-keys",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Send WhatsApp messages to customers using the WhatsApp Business API.",
    icon: MessageCircle,
    status: "connected",
  },
  {
    id: "twilio",
    name: "Twilio (Voice & SMS)",
    description: "Make and receive phone calls, send SMS messages using Twilio.",
    icon: Phone,
    status: "not_connected",
  },
];

export function IntegrationsTab() {
  const getStatusBadge = (status: Integration["status"]) => {
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
      case "coming_soon":
        return (
          <Badge variant="secondary">
            Coming Soon
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Integrations</CardTitle>
          <CardDescription>
            Connect third-party services to enable additional features across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
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
                      {getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    {integration.status === "connected" && integration.configUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={integration.configUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage
                        </a>
                      </Button>
                    )}
                    {integration.status === "not_connected" && (
                      <Button size="sm">
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Email (Resend)</h4>
            <p className="text-sm text-muted-foreground">
              Your email integration is configured and ready to use. You can send email campaigns from the Email Marketing page.
              Note: Currently using the Resend test domain (onboarding@resend.dev). For production, verify your own domain at resend.com.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">WhatsApp & Twilio</h4>
            <p className="text-sm text-muted-foreground">
              These integrations require API credentials from the respective providers. 
              Once available, you'll be able to configure them here and use them across the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
