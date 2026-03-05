import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Wifi } from "lucide-react";

interface Props {
  connected?: boolean;
}

export function ConnectWhatsApp({ connected = false }: Props) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
          <Wifi className="h-8 w-8 text-success" />
        </div>
        <CardTitle>WhatsApp Business Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium text-foreground">Connection Status</span>
          {connected ? (
            <Badge className="bg-success text-success-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>
          ) : (
            <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" /> Not Connected</Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Setup Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Connect WhatsApp" below</li>
            <li>Authenticate with WhatsApp Business API</li>
            <li>Verify your phone number</li>
            <li>Sync your contact list</li>
            <li>Activate message automation</li>
          </ol>
        </div>

        <Button className="w-full" disabled={connected}>
          {connected ? "Already Connected" : "Connect WhatsApp"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Requires WhatsApp Business API credentials. Contact support for setup assistance.
        </p>
      </CardContent>
    </Card>
  );
}
