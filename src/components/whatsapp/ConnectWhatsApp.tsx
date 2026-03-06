import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Wifi, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  connected?: boolean;
  companyId?: string;
}

export function ConnectWhatsApp({ connected = false, companyId }: Props) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(connected);

  const handleConnect = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Phone number required",
        description: "Please enter your WhatsApp Business phone number.",
      });
      return;
    }

    setIsConnecting(true);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsConnected(true);
    setIsConnecting(false);

    toast({
      title: "WhatsApp Connected!",
      description: `Your WhatsApp Business number ${phoneNumber} has been linked to the platform.`,
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPhoneNumber("");
    setBusinessName("");
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp Business number has been unlinked.",
    });
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
          <Wifi className="h-8 w-8 text-success" />
        </div>
        <CardTitle>WhatsApp Business Connection</CardTitle>
        <CardDescription>
          Connect your WhatsApp Business number to enable messaging, auto-replies, and order collection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium text-foreground">Connection Status</span>
          {isConnected ? (
            <Badge className="bg-success text-success-foreground"><CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>
          ) : (
            <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" /> Not Connected</Badge>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="e.g., My Restaurant"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">WhatsApp Business Phone Number</Label>
              <div className="flex gap-2">
                <Phone className="h-5 w-5 mt-2.5 text-muted-foreground" />
                <Input
                  id="phone-number"
                  placeholder="+234 801 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the phone number registered with WhatsApp Business.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What happens next:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your number is verified with the platform</li>
                <li>Incoming messages are routed to your inbox</li>
                <li>Auto-reply rules and AI responses are activated</li>
                <li>You can send broadcasts and manage orders</li>
              </ol>
            </div>

            <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect WhatsApp"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-foreground">Connected Number</p>
              <p className="text-sm text-muted-foreground">{phoneNumber || "+234 XXX XXX XXXX"}</p>
              {businessName && (
                <>
                  <p className="text-sm font-medium text-foreground mt-2">Business Name</p>
                  <p className="text-sm text-muted-foreground">{businessName}</p>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Active Features:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Message inbox</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> AI auto-replies</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Broadcast campaigns</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Product catalog</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Order collection</li>
              </ul>
            </div>

            <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
              Disconnect WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
