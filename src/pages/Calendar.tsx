import { Calendar as CalendarIcon } from "lucide-react";
import { PageHeader, PlaceholderContent } from "@/components/common";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Schedule and manage events."
        icon={CalendarIcon}
        action={{
          label: "New Event",
          onClick: () => console.log("New event"),
        }}
      />
      <PlaceholderContent
        title="Calendar Module Coming Soon"
        description="This module will include event scheduling, calendar views, reminders, and integration with other modules."
        icon={CalendarIcon}
      />
    </div>
  );
}
