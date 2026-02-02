import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useAuth } from "@/contexts/AuthContext";

interface CallLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallLogDialog({ open, onOpenChange }: CallLogDialogProps) {
  const { profile } = useAuth();
  const { createCallLog } = useCallLogs();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      contact_name: "",
      phone_number: "",
      direction: "outbound",
      duration: "",
      outcome: "answered",
      notes: "",
    },
  });

  const onSubmit = (data: any) => {
    const logData = {
      contact_name: data.contact_name,
      phone_number: data.phone_number,
      direction: data.direction as "inbound" | "outbound",
      duration: data.duration ? parseInt(data.duration) * 60 : null,
      outcome: data.outcome as any,
      notes: data.notes || null,
      customer_id: null,
      employee_id: null,
      called_at: new Date().toISOString(),
      company_id: profile?.company_id || "",
    };

    createCallLog.mutate(logData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Call</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input id="contact_name" {...register("contact_name", { required: true })} placeholder="Contact name" />
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" {...register("phone_number", { required: true })} placeholder="+234..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="direction">Direction</Label>
              <Select value={watch("direction")} onValueChange={(v) => setValue("direction", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input id="duration" type="number" {...register("duration")} placeholder="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Select value={watch("outcome")} onValueChange={(v) => setValue("outcome", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="callback">Callback Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Call notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Call</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
