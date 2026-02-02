import { useState } from "react";
import { Mail, Plus, Send, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns, Campaign } from "@/hooks/useCampaigns";
import { useCustomers } from "@/hooks/useCustomers";
import { CampaignDialog } from "@/components/campaigns/CampaignDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-info/10 text-info",
  running: "bg-warning/10 text-warning",
  paused: "bg-destructive/10 text-destructive",
  completed: "bg-success/10 text-success",
};

export default function EmailMarketing() {
  const [showDialog, setShowDialog] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const { campaigns, isLoading, deleteCampaign, updateCampaign } = useCampaigns("email");
  const { customers } = useCustomers();
  const { toast } = useToast();

  // Get customers with email addresses
  const emailableCustomers = customers.filter(c => c.email);

  const handleSendCampaign = async (campaign: Campaign) => {
    if (!campaign.subject || !campaign.content) {
      toast({
        variant: "destructive",
        title: "Cannot send campaign",
        description: "Campaign must have a subject and content.",
      });
      return;
    }

    if (emailableCustomers.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients",
        description: "Add customers with email addresses first.",
      });
      return;
    }

    setSendingCampaignId(campaign.id);

    try {
      // Send to all customers with emails
      const recipients = emailableCustomers.map(c => ({
        email: c.email!,
        name: c.name,
      }));

      const { data: result, error } = await supabase.functions.invoke("send-email-campaign", {
        body: {
          campaignId: campaign.id,
          recipients,
          subject: campaign.subject,
          content: campaign.content,
        },
      });

      if (error) throw error;

      toast({
        title: "Campaign sent!",
        description: `Successfully sent to ${result.sentCount} of ${result.totalRecipients} recipients.`,
      });
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: "Failed to send campaign",
        description: error.message || "An error occurred while sending emails.",
      });
    } finally {
      setSendingCampaignId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Email Marketing"
        description="Create and manage email campaigns."
        icon={Mail}
        action={{
          label: "New Campaign",
          onClick: () => setShowDialog(true),
        }}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailableCustomers.length}</div>
            <p className="text-xs text-muted-foreground">customers with email</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {campaigns.filter(c => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{campaign.subject || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[campaign.status]} variant="outline">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.sent_count || 0}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {campaign.status === "draft" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleSendCampaign(campaign)}
                            disabled={sendingCampaignId === campaign.id}
                          >
                            {sendingCampaignId === campaign.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteCampaign.mutate(campaign.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No email campaigns yet.</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        type="email"
      />
    </div>
  );
}
