import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEvents, Event } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  selectedDate?: Date;
}

export function EventDialog({ open, onOpenChange, event, selectedDate }: EventDialogProps) {
  const { profile } = useAuth();
  const { createEvent, updateEvent } = useEvents();
  const defaultDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      date: event ? format(new Date(event.start_time), 'yyyy-MM-dd') : defaultDate,
      start_time: event ? format(new Date(event.start_time), 'HH:mm') : "09:00",
      end_time: event ? format(new Date(event.end_time), 'HH:mm') : "10:00",
      location: event?.location || "",
      all_day: event?.all_day || false,
    },
  });

  const onSubmit = (data: any) => {
    const startDateTime = new Date(`${data.date}T${data.start_time}`);
    const endDateTime = new Date(`${data.date}T${data.end_time}`);

    const eventData = {
      title: data.title,
      description: data.description || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: data.location || null,
      all_day: data.all_day,
      attendees: [],
      created_by: profile?.id || null,
      company_id: profile?.company_id || "",
    };

    if (event) {
      updateEvent.mutate({ id: event.id, ...eventData });
    } else {
      createEvent.mutate(eventData);
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" {...register("title", { required: true })} placeholder="Event title" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Event details..." />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input id="start_time" type="time" {...register("start_time")} />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input id="end_time" type="time" {...register("end_time")} />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Event location" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="all_day" 
              checked={watch("all_day")} 
              onCheckedChange={(checked) => setValue("all_day", checked as boolean)} 
            />
            <Label htmlFor="all_day" className="text-sm font-normal">All day event</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{event ? "Update" : "Create"} Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
