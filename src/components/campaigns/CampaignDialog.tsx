import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCustomers } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Users } from "lucide-react";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "email" | "whatsapp" | "sms";
}

export function CampaignDialog({ open, onOpenChange, type }: CampaignDialogProps) {
  const { profile } = useAuth();
  const { createCampaign } = useCampaigns(type);
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendNow, setSendNow] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      scheduled_at: "",
    },
  });

  // Get customers with email addresses
  const emailableCustomers = customers.filter(c => c.email);

  const toggleRecipient = (customerId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAll = () => {
    if (selectedRecipients.length === emailableCustomers.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(emailableCustomers.map(c => c.id));
    }
  };

  const onSubmit = async (data: any) => {
    if (type === "email" && sendNow && selectedRecipients.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients selected",
        description: "Please select at least one recipient to send the campaign.",
      });
      return;
    }

    const campaignData = {
      name: data.name,
      type,
      status: sendNow ? "running" as const : "draft" as const,
      subject: data.subject || null,
      content: data.content || null,
      template_id: null,
      scheduled_at: data.scheduled_at || null,
      created_by: profile?.id || null,
      company_id: profile?.company_id || "",
    };

    // Create campaign first
    createCampaign.mutate(campaignData, {
      onSuccess: async (newCampaign) => {
        if (type === "email" && sendNow && selectedRecipients.length > 0) {
          setIsSending(true);
          
          try {
            // Get recipient details
            const recipients = selectedRecipients.map(id => {
              const customer = customers.find(c => c.id === id);
              return { email: customer?.email || "", name: customer?.name || "" };
            }).filter(r => r.email);

            // Call the edge function to send emails
            const { data: result, error } = await supabase.functions.invoke("send-email-campaign", {
              body: {
                campaignId: newCampaign.id,
                recipients,
                subject: data.subject,
                content: data.content,
              },
            });

            if (error) {
              throw error;
            }

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
            setIsSending(false);
          }
        }

        reset();
        setSelectedRecipients([]);
        setSendNow(false);
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    reset();
    setSelectedRecipients([]);
    setSendNow(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            New {type === "email" ? "Email" : type === "whatsapp" ? "WhatsApp" : "SMS"} Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="Campaign name" />
            </div>
            {type === "email" && (
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input id="subject" {...register("subject", { required: type === "email" })} placeholder="Subject line" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="content">Message Content *</Label>
            <Textarea 
              id="content" 
              {...register("content", { required: true })} 
              placeholder={`${type === "email" ? "Email body" : "Message content"}... Use {{name}} to personalize with recipient's name.`} 
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Use {"{{name}}"} to insert the recipient's name automatically.
            </p>
          </div>

          {type === "email" && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="sendNow" 
                  checked={sendNow} 
                  onCheckedChange={(checked) => setSendNow(checked as boolean)} 
                />
                <Label htmlFor="sendNow" className="text-sm cursor-pointer">
                  Send immediately after creating
                </Label>
              </div>

              {sendNow && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select Recipients ({selectedRecipients.length} selected)
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={selectAll}
                    >
                      {selectedRecipients.length === emailableCustomers.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-40 border rounded-md p-2">
                    {emailableCustomers.length > 0 ? (
                      <div className="space-y-2">
                        {emailableCustomers.map((customer) => (
                          <label 
                            key={customer.id} 
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                          >
                            <Checkbox 
                              checked={selectedRecipients.includes(customer.id)}
                              onCheckedChange={() => toggleRecipient(customer.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{customer.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No customers with email addresses found.
                      </p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </>
          )}

          {!sendNow && (
            <div>
              <Label htmlFor="scheduled_at">Schedule For (Optional)</Label>
              <Input id="scheduled_at" type="datetime-local" {...register("scheduled_at")} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : sendNow ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send Now
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
