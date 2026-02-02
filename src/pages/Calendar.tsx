import { useState } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents, Event } from "@/hooks/useEvents";
import { EventDialog } from "@/components/calendar/EventDialog";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

export default function CalendarPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { events, isLoading, deleteEvent } = useEvents();

  const dayEvents = events.filter(e => 
    isSameDay(new Date(e.start_time), selectedDate)
  );

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setShowDialog(true);
  };

  const handleClose = () => {
    setEditEvent(null);
    setShowDialog(false);
  };

  const eventDays = events.map(e => new Date(e.start_time));

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Schedule and manage events."
        icon={CalendarIcon}
        action={{
          label: "New Event",
          onClick: () => setShowDialog(true),
        }}
      />

      <div className="grid gap-6 md:grid-cols-[350px_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasEvents: eventDays,
              }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : dayEvents.length > 0 ? (
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleEdit(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                          </span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent.mutate(event.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events on this date.</p>
                <Button className="mt-4" onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EventDialog
        open={showDialog}
        onOpenChange={handleClose}
        event={editEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}
