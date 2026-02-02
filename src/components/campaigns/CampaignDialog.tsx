import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAuth } from "@/contexts/AuthContext";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "email" | "whatsapp" | "sms";
}

export function CampaignDialog({ open, onOpenChange, type }: CampaignDialogProps) {
  const { profile } = useAuth();
  const { createCampaign } = useCampaigns(type);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      scheduled_at: "",
    },
  });

  const onSubmit = (data: any) => {
    const campaignData = {
      name: data.name,
      type,
      status: "draft" as const,
      subject: data.subject || null,
      content: data.content || null,
      template_id: null,
      scheduled_at: data.scheduled_at || null,
      created_by: profile?.id || null,
      company_id: profile?.company_id || "",
    };

    createCampaign.mutate(campaignData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            New {type === "email" ? "Email" : type === "whatsapp" ? "WhatsApp" : "SMS"} Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Campaign name" />
          </div>
          {type === "email" && (
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input id="subject" {...register("subject")} placeholder="Subject line" />
            </div>
          )}
          <div>
            <Label htmlFor="content">Message Content</Label>
            <Textarea 
              id="content" 
              {...register("content")} 
              placeholder={type === "email" ? "Email body..." : "Message content..."} 
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="scheduled_at">Schedule For (Optional)</Label>
            <Input id="scheduled_at" type="datetime-local" {...register("scheduled_at")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
